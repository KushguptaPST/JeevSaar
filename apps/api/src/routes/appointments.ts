import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { storageProvider } from '../providers/storage';
import { config } from '../config';

const prisma = new PrismaClient();

export async function appointmentRoutes(fastify: FastifyInstance) {
  // 1. Get Available Slots for a given date
  fastify.get('/appointments/slots', async (request, reply) => {
    const { date, departmentId } = request.query as { date?: string; departmentId?: string };

    if (!date) {
      return reply.status(400).send({
        error: 'Missing date parameter',
        message: 'Please provide query parameter ?date=YYYY-MM-DD',
      });
    }

    const hospital = config.hospital;
    const workingHours = hospital.workingHours;

    // Generate slots: 09:00 to 17:00 at 30 min increments
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    const slotDuration = workingHours.slotDurationMinutes || 30;

    const allSlots: string[] = [];
    let currentTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    while (currentTotalMinutes + slotDuration <= endTotalMinutes) {
      const h = Math.floor(currentTotalMinutes / 60);
      const m = currentTotalMinutes % 60;
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      allSlots.push(formatted);
      currentTotalMinutes += slotDuration;
    }

    // Query booked slots from database
    const booked = await prisma.appointment.findMany({
      where: {
        hospitalId: hospital.id,
        date,
        ...(departmentId ? { departmentId } : {}),
        status: { in: ['PENDING_VERIFICATION', 'CONFIRMED'] },
      },
      select: { timeSlot: true },
    });

    const bookedSet = new Set(booked.map((b) => b.timeSlot));

    const slotItems = allSlots.map((time) => ({
      time,
      date,
      available: !bookedSet.has(time),
    }));

    return reply.send({
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        departments: hospital.departments,
        acceptedDocumentTypes: hospital.acceptedDocumentTypes,
      },
      date,
      slots: slotItems,
    });
  });

  // 2. Book an Appointment (Multipart: patient info + document upload)
  fastify.post('/appointments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parts = request.parts();

    const fields: Record<string, string> = {};
    let uploadedFile:
      | {
          buffer: Buffer;
          filename: string;
          mimetype: string;
          sizeBytes: number;
        }
      | undefined;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        uploadedFile = {
          buffer,
          filename: part.filename,
          mimetype: part.mimetype,
          sizeBytes: buffer.length,
        };
      } else {
        fields[part.fieldname] = String(part.value);
      }
    }

    // Validate required fields
    const {
      departmentId,
      departmentName,
      date,
      timeSlot,
      patientName,
      patientAge,
      patientPhone,
      documentType,
      notes,
    } = fields;

    if (!departmentId || !date || !timeSlot || !patientName || !patientPhone) {
      return reply.status(400).send({
        error: 'Missing required fields',
        message: 'departmentId, date, timeSlot, patientName, and patientPhone are required',
      });
    }

    // Document validation: required, JPG/PNG/PDF only, max 10MB, non-blank
    if (!uploadedFile) {
      return reply.status(400).send({
        error: 'Missing document',
        message: 'A valid document (Government ID, Doctor Prescription, or Recent Lab Report) is required to book an appointment',
      });
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(uploadedFile.mimetype)) {
      return reply.status(400).send({
        error: 'Invalid document type',
        message: 'Document must be JPG, PNG, or PDF',
      });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (uploadedFile.sizeBytes > MAX_FILE_SIZE) {
      return reply.status(400).send({
        error: 'File too large',
        message: 'Document size must be under 10 MB',
      });
    }

    if (uploadedFile.sizeBytes < 100) {
      return reply.status(400).send({
        error: 'Invalid document',
        message: 'Document appears to be empty or corrupted',
      });
    }

    // Check double booking constraint
    const existing = await prisma.appointment.findFirst({
      where: {
        hospitalId: config.hospital.id,
        departmentId,
        date,
        timeSlot,
        status: { in: ['PENDING_VERIFICATION', 'CONFIRMED'] },
      },
    });

    if (existing) {
      return reply.status(409).send({
        error: 'Slot unavailable',
        message: 'This time slot was just booked by another patient. Please pick another slot.',
      });
    }

    // Store document safely
    const storedDoc = await storageProvider.saveFile({
      buffer: uploadedFile.buffer,
      originalFilename: uploadedFile.filename,
      mimeType: uploadedFile.mimetype,
      subfolder: 'documents',
    });

    // Generate Human-Readable Booking Reference: e.g. APT-2611-7B4F
    const randSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const dateCode = date.replace(/-/g, '').slice(2, 6);
    const bookingRef = `APT-${dateCode}-${randSuffix}`;

    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        userId: request.user.userId,
        hospitalId: config.hospital.id,
        hospitalName: config.hospital.name,
        departmentId,
        departmentName: departmentName || 'General OPD',
        date,
        timeSlot,
        patientName,
        patientAge: parseInt(patientAge, 10) || 30,
        patientPhone,
        notes: notes || null,
        status: 'PENDING_VERIFICATION',
        documents: {
          create: {
            documentType: documentType || 'GOVERNMENT_PHOTO_ID',
            originalFilename: uploadedFile.filename,
            fileUrl: storedDoc.fileUrl,
            filePath: storedDoc.storagePath,
            fileMimeType: uploadedFile.mimetype,
            fileSizeBytes: storedDoc.sizeBytes,
            verificationStatus: 'PENDING',
          },
        },
      },
      include: {
        documents: true,
      },
    });

    // Schedule reminder notification record for evening before (19:00 on date - 1 day)
    try {
      const aptDate = new Date(`${date}T${timeSlot}:00`);
      const reminderTime = new Date(aptDate.getTime() - 24 * 60 * 60 * 1000);
      reminderTime.setHours(19, 0, 0, 0);

      await prisma.notificationRecord.create({
        data: {
          userId: request.user.userId,
          title: `Appointment Reminder: ${config.hospital.name}`,
          body: `Reminder: Your appointment in ${appointment.departmentName} is scheduled tomorrow at ${timeSlot}. Please carry your documents.`,
          type: 'APPOINTMENT_REMINDER',
          scheduledFor: reminderTime,
        },
      });
    } catch (e) {
      // non-fatal
    }

    return reply.status(201).send({
      id: appointment.id,
      bookingRef: appointment.bookingRef,
      hospitalName: appointment.hospitalName,
      departmentName: appointment.departmentName,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      patientName: appointment.patientName,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      document: appointment.documents[0]
        ? {
            id: appointment.documents[0].id,
            documentType: appointment.documents[0].documentType,
            verificationStatus: appointment.documents[0].verificationStatus,
            fileUrl: appointment.documents[0].fileUrl,
          }
        : null,
    });
  });

  // 3. List user's appointments
  fastify.get('/appointments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const appointments = await prisma.appointment.findMany({
      where: { userId: request.user.userId },
      orderBy: { date: 'desc' },
      include: { documents: true },
    });

    return reply.send({
      appointments: appointments.map((a) => ({
        id: a.id,
        bookingRef: a.bookingRef,
        hospitalName: a.hospitalName,
        departmentName: a.departmentName,
        date: a.date,
        timeSlot: a.timeSlot,
        patientName: a.patientName,
        status: a.status,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt.toISOString(),
        document: a.documents[0]
          ? {
              documentType: a.documents[0].documentType,
              verificationStatus: a.documents[0].verificationStatus,
              fileUrl: a.documents[0].fileUrl,
            }
          : null,
      })),
    });
  });

  // 4. Cancel appointment
  fastify.delete('/appointments/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const apt = await prisma.appointment.findFirst({
      where: { id, userId: request.user.userId },
    });

    if (!apt) {
      return reply.status(404).send({ error: 'Appointment not found' });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return reply.send({ success: true, message: 'Appointment cancelled successfully' });
  });
}
