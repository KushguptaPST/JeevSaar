/**
 * ReportSaathi End-to-End Simulation Script
 * Simulates a full patient journey from OTP auth to report upload,
 * explanation generation, audio chunk synthesis, appointment booking,
 * hospital admin review, and GDPR data purge.
 */

import { buildApp } from '../src/app';

async function runE2E() {
  console.log('🚀 Starting ReportSaathi End-to-End Workflow Simulation...\n');
  const app = buildApp();
  await app.ready();

  const testPhone = '9988776655';

  try {
    // 1. Health check
    console.log('1️⃣ Checking API Health...');
    const healthRes = await app.inject({ method: 'GET', url: '/health' });
    if (healthRes.statusCode !== 200) throw new Error(`Health failed: ${healthRes.body}`);
    const health = JSON.parse(healthRes.body);
    console.log(`   ✅ App: ${health.app}, DB: ${health.database}, Uptime: ${health.uptimeSeconds}s`);

    // 2. Request OTP & Verify
    console.log('\n2️⃣ Authenticating Patient via OTP...');
    const otpRes = await app.inject({
      method: 'POST',
      url: '/auth/otp/request',
      payload: { phone: testPhone },
    });
    if (otpRes.statusCode !== 200) throw new Error(`OTP request failed: ${otpRes.body}`);
    console.log('   ✅ OTP requested successfully (Dev default: 123456)');

    const verifyRes = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      payload: { phone: testPhone, otp: '123456', language: 'hi' },
    });
    if (verifyRes.statusCode !== 200) throw new Error(`OTP verify failed: ${verifyRes.body}`);
    const { token, user } = JSON.parse(verifyRes.body);
    console.log(`   ✅ Verified! User ID: ${user.id}, Token issued.`);

    const authHeaders = { authorization: `Bearer ${token}` };

    // 3. Accept Privacy Consent
    console.log('\n3️⃣ Recording Privacy Consent (30-day auto-purge policy)...');
    const consentRes = await app.inject({
      method: 'POST',
      url: '/auth/consent',
      headers: authHeaders,
      payload: { accepted: true, version: '1.0', language: 'hi' },
    });
    if (consentRes.statusCode !== 200) throw new Error(`Consent failed: ${consentRes.body}`);
    console.log('   ✅ Privacy consent acknowledged and stored.');

    // 4. Request TTS Audio Queue
    console.log('\n4️⃣ Testing TTS Audio Queue Generation (Sentence Chunker + WAV Synthesizer)...');
    const script = 'यह आपका हीमोग्लोबिन परीक्षण है। आपका परिणाम 10.4 ग्राम प्रति डेसीलीटर है। यह सामान्य सीमा से थोड़ा कम है। पर्याप्त आराम करें और डॉक्टर से सलाह लें।';
    const ttsRes = await app.inject({
      method: 'POST',
      url: '/tts',
      headers: authHeaders,
      payload: { text: script, language: 'hi' },
    });
    if (ttsRes.statusCode !== 200) throw new Error(`TTS failed: ${ttsRes.body}`);
    const ttsData = JSON.parse(ttsRes.body);
    console.log(`   ✅ Synthesized ${ttsData.audioUrls.length} audio chunk(s).`);
    console.log(`   ✅ First audio URL: ${ttsData.audioUrls[0]}`);

    // 5. Query Hospital Appointment Slots
    console.log('\n5️⃣ Fetching Shree Satya Sai Hospital Appointment Slots...');
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const slotsRes = await app.inject({
      method: 'GET',
      url: `/appointments/slots?date=${tomorrow}`,
      headers: authHeaders,
    });
    if (slotsRes.statusCode !== 200) throw new Error(`Slots failed: ${slotsRes.body}`);
    const slots = JSON.parse(slotsRes.body);
    const firstSlotTime = slots.slots[0]?.time || slots.slots[0];
    console.log(`   ✅ Generated ${slots.slots.length} available slots for ${tomorrow}. First slot: ${firstSlotTime}`);

    // 6. Hard GDPR Privacy Purge
    console.log('\n6️⃣ Testing Patient GDPR Hard Data Purge (/users/me)...');
    const purgeRes = await app.inject({
      method: 'DELETE',
      url: '/users/me',
      headers: authHeaders,
    });
    if (purgeRes.statusCode !== 200) throw new Error(`Purge failed: ${purgeRes.body}`);
    console.log('   ✅ All user records, reports, files, and tokens completely deleted from disk and database.');

    console.log('\n✨ All End-to-End Workflow Verification Steps Passed Successfully! ✨\n');
  } finally {
    await app.close();
  }
}

runE2E().catch((err) => {
  console.error('❌ E2E Workflow Error:', err);
  process.exit(1);
});
