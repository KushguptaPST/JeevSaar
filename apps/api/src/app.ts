import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import { authPlugin } from './plugins/auth';
import { adminRoutes } from './routes/admin';
import { appointmentRoutes } from './routes/appointments';
import { authRoutes } from './routes/auth';
import { reportRoutes } from './routes/reports';
import { ttsRoutes } from './routes/tts';
import { userRoutes } from './routes/user';
import { config } from './config';

const prisma = new PrismaClient();

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: config.NODE_ENV !== 'test',
  });

  // CORS
  app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  // Rate Limiting
  app.register(fastifyRateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
  });

  // Multipart upload handling (10MB limit)
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 2,
    },
  });

  // Serve static uploads (audio, report previews, documents)
  app.register(fastifyStatic, {
    root: config.uploadAbsoluteDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Authentication Plugin
  app.register(authPlugin);

  // API Routes
  app.register(authRoutes);
  app.register(reportRoutes);
  app.register(ttsRoutes);
  app.register(appointmentRoutes);
  app.register(adminRoutes);
  app.register(userRoutes);

  // Health check
  app.get('/health', async () => {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      app: config.app.appName,
      hospital: config.hospital.name,
      providers: {
        llm: process.env.LLM_PROVIDER || 'mock',
        tts: process.env.TTS_PROVIDER || 'mock',
        sms: 'mock',
      },
    };
  });

  // System Diagnostics and Metrics
  app.get('/metrics', async () => {
    let counts = { reports: 0, appointments: 0, audioCaches: 0 };
    try {
      const [reports, appointments, audioCaches] = await Promise.all([
        prisma.report.count(),
        prisma.appointment.count(),
        prisma.audioCache.count(),
      ]);
      counts = { reports, appointments, audioCaches };
    } catch {
      // ignore
    }
    const mem = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      counts,
    };
  });

  // Welcome / Root API info
  app.get('/', async () => ({
    message: `Welcome to ${config.app.appName} API`,
    tagline: config.app.tagline,
    version: config.app.version,
    documentation: '/admin for hospital desk portal, /health for service status',
  }));

  return app;
}
