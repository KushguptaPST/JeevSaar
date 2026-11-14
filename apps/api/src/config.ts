import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { APP_CONFIG, CONFIGURED_HOSPITAL } from '@reportsaathi/shared';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16).default('reportsaathi_dev_jwt_secret_min_32_chars_long'),
  ADMIN_API_TOKEN: z.string().default('admin_hospital_desk_secret_token_123'),
  SMS_PROVIDER: z.enum(['mock', 'twilio', 'msg91']).default('mock'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./uploads'),
  LLM_PROVIDER: z.enum(['mock', 'openai', 'gemini', 'sarvam']).default('mock'),
  TTS_PROVIDER: z.enum(['mock', 'sarvam']).default('mock'),
  SARVAM_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  DATA_RETENTION_DAYS: z.coerce.number().default(APP_CONFIG.retentionDays),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000),
});

const parsedEnv = envSchema.parse(process.env);

export const config = {
  ...parsedEnv,
  app: APP_CONFIG,
  hospital: CONFIGURED_HOSPITAL,
  uploadAbsoluteDir: path.resolve(process.cwd(), parsedEnv.STORAGE_LOCAL_DIR),
};
