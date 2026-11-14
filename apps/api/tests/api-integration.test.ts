import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Fastify REST API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 and application metadata', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.app).toBe('ReportSaathi');
    expect(body.hospital).toBe('Shree Satya Sai Hospital');
    expect(body.database).toBe('connected');
  });

  it('GET /metrics returns server health and database counts', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/metrics',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(body.heapUsedMb).toBeGreaterThan(0);
    expect(body.counts).toBeDefined();
  });

  it('POST /auth/otp/request and verify returns JWT token', async () => {
    // 1. Request OTP
    const otpRes = await app.inject({
      method: 'POST',
      url: '/auth/otp/request',
      payload: { phone: '9876543210' },
    });
    expect(otpRes.statusCode).toBe(200);
    const otpBody = JSON.parse(otpRes.body);
    expect(otpBody.success).toBe(true);

    // 2. Verify with dev OTP (123456)
    const verifyRes = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      payload: { phone: '9876543210', otp: '123456', language: 'hi' },
    });
    expect(verifyRes.statusCode).toBe(200);
    const verifyBody = JSON.parse(verifyRes.body);
    expect(verifyBody.token).toBeDefined();
    expect(verifyBody.user.phone).toBe('9876543210');
  });

  it('POST /tts returns chunked audio URLs and metadata', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tts',
      payload: {
        text: 'नमस्ते। आपकी रिपोर्ट में हीमोग्लोबिन दस दशमलव चार है। कृपया डॉक्टर से मिलें।',
        language: 'hi',
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.audioUrls).toBeDefined();
    expect(body.audioUrls.length).toBeGreaterThan(0);
    expect(body.chunks).toBeDefined();
  });

  it('GET /appointments/slots returns generated time slots', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const res = await app.inject({
      method: 'GET',
      url: `/appointments/slots?date=${dateStr}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.hospital.name).toBe('Shree Satya Sai Hospital');
    expect(body.slots.length).toBeGreaterThan(0);
    expect(body.slots[0].time).toMatch(/^\d{2}:\d{2}$/);
  });
});
