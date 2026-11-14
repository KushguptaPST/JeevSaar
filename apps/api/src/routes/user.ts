import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { storageProvider } from '../providers/storage';

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  language: z.enum(['en', 'hi', 'kn', 'ta', 'bn', 'or', 'pa']).optional(),
  textSize: z.enum(['normal', 'large', 'extra-large']).optional(),
});

export async function userRoutes(fastify: FastifyInstance) {
  // Update preferences
  fastify.patch('/users/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parseResult = updateProfileSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid input',
        details: parseResult.error.errors,
      });
    }

    const updated = await prisma.user.update({
      where: { id: request.user.userId },
      data: parseResult.data,
    });

    return reply.send({
      id: updated.id,
      phone: updated.phone,
      language: updated.language,
      textSize: updated.textSize,
      hasConsented: updated.hasConsented,
    });
  });

  // "Delete My Data" - Hard GDPR / Privacy purge
  fastify.delete('/users/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.userId;

    // 1. Fetch all user report files to delete from disk
    const reports = await prisma.report.findMany({
      where: { userId },
      select: { storagePath: true },
    });

    // 2. Fetch all appointment documents to delete from disk
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: { documents: true },
    });

    for (const report of reports) {
      await storageProvider.deleteFile(report.storagePath);
    }

    for (const apt of appointments) {
      for (const doc of apt.documents) {
        await storageProvider.deleteFile(doc.filePath);
      }
    }

    // 3. Delete user row in DB (cascades to consents, reports, values, explanations, appointments, documents)
    await prisma.user.delete({
      where: { id: userId },
    });

    return reply.send({
      success: true,
      message: 'All your personal data, reports, audio records, and documents have been permanently deleted.',
    });
  });
}
