import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { smsProvider } from '../providers/sms';

const prisma = new PrismaClient();

// In-memory OTP store for dev / fallback (or Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const requestOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().min(4),
  language: z.string().optional().default('hi'),
});

const consentSchema = z.object({
  accepted: z.boolean(),
  version: z.string().default('1.0'),
  language: z.string().default('hi'),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Request OTP
  fastify.post('/auth/otp/request', async (request, reply) => {
    const parseResult = requestOtpSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid input',
        details: parseResult.error.errors,
      });
    }

    const { phone } = parseResult.data;
    // In dev: OTP is always 123456 per specification
    const devOtp = '123456';
    otpStore.set(phone, {
      otp: devOtp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
    });

    await smsProvider.sendOtp(phone, devOtp);

    return reply.send({
      success: true,
      message: 'OTP sent successfully',
      devOtp, // Returned in dev for easy offline testing
    });
  });

  // Verify OTP
  fastify.post('/auth/otp/verify', async (request, reply) => {
    const parseResult = verifyOtpSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid input',
        details: parseResult.error.errors,
      });
    }

    const { phone, otp, language } = parseResult.data;

    // Validate OTP (dev fallback: accepts 123456 or stored OTP)
    const stored = otpStore.get(phone);
    const isValid = otp === '123456' || (stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return reply.status(400).send({
        error: 'Invalid OTP',
        message: 'The OTP entered is incorrect or has expired',
      });
    }

    // Clear used OTP
    otpStore.delete(phone);

    // Upsert User
    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        phone,
        language: language || 'hi',
        textSize: 'normal',
        hasConsented: false,
      },
      update: {
        language: language || undefined,
      },
    });

    const token = fastify.jwt.sign(
      { userId: user.id, phone: user.phone },
      { expiresIn: '30d' }
    );

    return reply.send({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        language: user.language,
        textSize: user.textSize,
        hasConsented: user.hasConsented,
        createdAt: user.createdAt.toISOString(),
      },
    });
  });

  // Record Consent
  fastify.post('/auth/consent', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parseResult = consentSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid input',
        details: parseResult.error.errors,
      });
    }

    const { accepted, version, language } = parseResult.data;
    const userId = request.user.userId;

    const consent = await prisma.consent.create({
      data: {
        userId,
        version,
        language,
        accepted,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { hasConsented: accepted },
    });

    return reply.send({
      success: true,
      consentId: consent.id,
      hasConsented: accepted,
    });
  });

  // Get current user profile
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({
      id: user.id,
      phone: user.phone,
      language: user.language,
      textSize: user.textSize,
      hasConsented: user.hasConsented,
      createdAt: user.createdAt.toISOString(),
    });
  });
}
