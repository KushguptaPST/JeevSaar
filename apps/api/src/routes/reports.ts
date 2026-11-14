import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { SupportedLanguage } from '@reportsaathi/shared';
import { reportExtractor } from '../providers/extractor';
import { explanationLLM } from '../providers/llm';
import { storageProvider } from '../providers/storage';
import { evaluateReportValues, parseNumeric } from '../safety/engine';
import { config } from '../config';

const prisma = new PrismaClient();

const explainSchema = z.object({
  language: z.enum(['en', 'hi', 'kn', 'ta', 'bn', 'or', 'pa']).default('hi'),
});

export async function reportRoutes(fastify: FastifyInstance) {
  // 1. Upload Report (Multipart)
  fastify.post('/reports', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        error: 'Missing file',
        message: 'Please provide an image or PDF file of your lab report',
      });
    }

    const buffer = await data.toBuffer();
    const mimeType = data.mimetype;
    const filename = data.filename || 'report.jpg';

    // Validate mime type (JPG, PNG, PDF)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(mimeType)) {
      return reply.status(400).send({
        error: 'Unsupported file type',
        message: 'Only JPG, PNG, and PDF files are accepted',
      });
    }

    // Save file via storage provider
    const stored = await storageProvider.saveFile({
      buffer,
      originalFilename: filename,
      mimeType,
      subfolder: 'reports',
    });

    const retentionDays = config.DATA_RETENTION_DAYS || 30;
    const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

    // Create Report in database
    const report = await prisma.report.create({
      data: {
        userId: request.user.userId,
        filename,
        fileUrl: stored.fileUrl,
        fileMimeType: mimeType,
        fileSizeBytes: stored.sizeBytes,
        storagePath: stored.storagePath,
        status: 'EXTRACTED',
        patientNameStripped: true,
        expiresAt,
      },
    });

    // Extract values with ReportExtractor
    const rawValues = await reportExtractor.extract(buffer, mimeType, filename);

    // Evaluate values with RulesEngine
    const rulesResult = evaluateReportValues(rawValues);

    // Save Report Values
    const reportValuesData = rulesResult.evaluatedTests.map((t) => ({
      reportId: report.id,
      testName: t.testName,
      testNameEnglish: t.testNameEnglish,
      value: String(t.value),
      numericValue: t.numericValue,
      unit: t.unit,
      referenceRange: t.referenceRange,
      status: t.status,
      rawText: t.rawText,
      category: t.category,
    }));

    await prisma.reportValue.createMany({
      data: reportValuesData,
    });

    // Update report with overall doctor visit level
    await prisma.report.update({
      where: { id: report.id },
      data: {
        doctorVisitLevel: rulesResult.doctorVisitLevel,
      },
    });

    return reply.status(201).send({
      id: report.id,
      filename: report.filename,
      fileUrl: report.fileUrl,
      status: report.status,
      doctorVisitLevel: rulesResult.doctorVisitLevel,
      valuesCount: reportValuesData.length,
      createdAt: report.createdAt.toISOString(),
    });
  });

  // 2. List user reports
  fastify.get('/reports', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const reports = await prisma.report.findMany({
      where: { userId: request.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        explanations: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return reply.send({
      reports: reports.map((r) => ({
        id: r.id,
        filename: r.filename,
        fileUrl: r.fileUrl,
        status: r.status,
        doctorVisitLevel: r.doctorVisitLevel,
        createdAt: r.createdAt.toISOString(),
        hasExplanation: r.explanations.length > 0,
      })),
    });
  });

  // 3. Get single report details
  fastify.get('/reports/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const report = await prisma.report.findFirst({
      where: { id, userId: request.user.userId },
      include: {
        values: true,
        explanations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!report) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    const latestExpl = report.explanations[0];

    return reply.send({
      id: report.id,
      filename: report.filename,
      fileUrl: report.fileUrl,
      status: report.status,
      doctorVisitLevel: report.doctorVisitLevel,
      createdAt: report.createdAt.toISOString(),
      values: report.values.map((v) => ({
        id: v.id,
        testName: v.testName,
        testNameEnglish: v.testNameEnglish,
        value: v.value,
        unit: v.unit,
        referenceRange: v.referenceRange,
        status: v.status,
        category: v.category,
      })),
      latestExplanation: latestExpl
        ? {
            language: latestExpl.language,
            overallSummary: latestExpl.overallSummary,
            doctorVisit: {
              level: latestExpl.doctorVisitLevel,
              reason: latestExpl.doctorVisitReason,
            },
            tests: latestExpl.testsJson,
            questionsForDoctor: latestExpl.questionsJson,
            spokenScript: latestExpl.spokenScript,
            disclaimer: latestExpl.disclaimer,
          }
        : null,
    });
  });

  // 4. Generate Explanation for a report in requested language
  fastify.post('/reports/:id/explain', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = explainSchema.safeParse(request.body || {});
    const language = (parseResult.success ? parseResult.data.language : 'hi') as SupportedLanguage;

    const report = await prisma.report.findFirst({
      where: { id, userId: request.user.userId },
      include: { values: true },
    });

    if (!report) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    // Convert stored values back to EvaluatedTestValue format
    const rawValues = report.values.map((v) => ({
      testName: v.testName,
      value: v.value,
      unit: v.unit,
      referenceRange: v.referenceRange,
      rawText: v.rawText || undefined,
      category: v.category || undefined,
    }));

    const rulesResult = evaluateReportValues(rawValues);

    // Call LLM Explanation Provider with Runtime Safety Rules
    const explanation = await explanationLLM.generateExplanation(
      rulesResult.evaluatedTests,
      language,
      rulesResult.doctorVisitLevel,
      rulesResult.doctorVisitReason
    );

    // Save Explanation record
    const saved = await prisma.explanationRecord.create({
      data: {
        reportId: report.id,
        language: explanation.language,
        overallSummary: explanation.overallSummary,
        doctorVisitLevel: explanation.doctorVisit.level,
        doctorVisitReason: explanation.doctorVisit.reason,
        testsJson: explanation.tests as any,
        questionsJson: explanation.questionsForDoctor as any,
        spokenScript: explanation.spokenScript,
        disclaimer: explanation.disclaimer,
      },
    });

    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: 'EXPLAINED',
        doctorVisitLevel: explanation.doctorVisit.level,
      },
    });

    return reply.send(explanation);
  });

  // 5. Test trend lines across repeated tests
  fastify.get('/reports/trends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const reports = await prisma.report.findMany({
      where: { userId: request.user.userId },
      orderBy: { createdAt: 'asc' },
      include: { values: true },
    });

    const seriesMap: Record<
      string,
      {
        testNameEnglish: string;
        dataPoints: Array<{
          reportId: string;
          date: string;
          numericValue: number;
          unit: string;
          referenceRange: string;
          status: string;
        }>;
      }
    > = {};

    for (const report of reports) {
      for (const val of report.values) {
        const num = val.numericValue ?? parseNumeric(val.value);
        if (num !== undefined) {
          const key = val.testNameEnglish.toLowerCase().trim();
          if (!seriesMap[key]) {
            seriesMap[key] = {
              testNameEnglish: val.testNameEnglish,
              dataPoints: [],
            };
          }
          seriesMap[key].dataPoints.push({
            reportId: report.id,
            date: report.createdAt.toISOString().split('T')[0],
            numericValue: num,
            unit: val.unit,
            referenceRange: val.referenceRange,
            status: val.status,
          });
        }
      }
    }

    return reply.send({
      series: Object.values(seriesMap),
    });
  });

  // 6. Delete report
  fastify.delete('/reports/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const report = await prisma.report.findFirst({
      where: { id, userId: request.user.userId },
    });

    if (!report) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    // Delete stored file
    await storageProvider.deleteFile(report.storagePath);

    // Delete database records
    await prisma.report.delete({
      where: { id },
    });

    return reply.send({ success: true, message: 'Report deleted successfully' });
  });
}
