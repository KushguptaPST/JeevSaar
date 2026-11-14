import { PrismaClient } from '@prisma/client';
import { CONFIGURED_HOSPITAL } from '@reportsaathi/shared';
import { generatePlayableWavBuffer } from '../src/providers/tts/mock-audio-generator';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ReportSaathi database...');

  // Ensure audio and upload directories exist
  const uploadDir = path.resolve(process.cwd(), './uploads');
  const audioDir = path.join(uploadDir, 'audio');
  const reportsDir = path.join(uploadDir, 'reports');
  const docsDir = path.join(uploadDir, 'documents');

  for (const d of [uploadDir, audioDir, reportsDir, docsDir]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  // Generate sample playable audio file
  const sampleAudioPath = path.join(audioDir, 'seed_sample_hindi.wav');
  const sampleWav = generatePlayableWavBuffer(3, 440);
  await fs.promises.writeFile(sampleAudioPath, sampleWav);

  // 1. Create or update test user
  const user = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      hasConsented: true,
      language: 'hi',
    },
    create: {
      phone: '9876543210',
      language: 'hi',
      textSize: 'normal',
      hasConsented: true,
      consents: {
        create: {
          version: '1.0',
          language: 'hi',
          accepted: true,
        },
      },
    },
  });

  console.log(`👤 Seed user ready: ${user.phone} (${user.id})`);

  // 2. Create sample report
  const existingReport = await prisma.report.findFirst({
    where: { userId: user.id },
  });

  if (!existingReport) {
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        filename: 'sample_cbc_lipid_report.pdf',
        fileUrl: '/uploads/reports/sample_cbc_lipid_report.pdf',
        storagePath: 'reports/sample_cbc_lipid_report.pdf',
        fileMimeType: 'application/pdf',
        fileSizeBytes: 245000,
        status: 'EXPLAINED',
        doctorVisitLevel: 'soon',
        reportDate: '2026-11-10',
        labName: 'Apollo Diagnostics Centre',
        patientNameStripped: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        values: {
          create: [
            {
              testName: 'Hemoglobin (Hb)',
              testNameEnglish: 'Hemoglobin (Hb)',
              value: '10.4',
              numericValue: 10.4,
              unit: 'g/dL',
              referenceRange: '12.0 - 15.5',
              status: 'low',
              category: 'Complete Blood Count (CBC)',
            },
            {
              testName: 'Total WBC Count',
              testNameEnglish: 'Total WBC Count',
              value: '7800',
              numericValue: 7800,
              unit: 'cells/mcL',
              referenceRange: '4000 - 11000',
              status: 'normal',
              category: 'Complete Blood Count (CBC)',
            },
            {
              testName: 'Platelet Count',
              testNameEnglish: 'Platelet Count',
              value: '140000',
              numericValue: 140000,
              unit: '/mcL',
              referenceRange: '150000 - 450000',
              status: 'low',
              category: 'Complete Blood Count (CBC)',
            },
            {
              testName: 'Total Cholesterol',
              testNameEnglish: 'Total Cholesterol',
              value: '238',
              numericValue: 238,
              unit: 'mg/dL',
              referenceRange: '< 200',
              status: 'high',
              category: 'Lipid Profile',
            },
            {
              testName: 'Fasting Blood Glucose',
              testNameEnglish: 'Fasting Blood Glucose',
              value: '112',
              numericValue: 112,
              unit: 'mg/dL',
              referenceRange: '70 - 99',
              status: 'high',
              category: 'Diabetes / Metabolic',
            },
          ],
        },
        explanations: {
          create: {
            language: 'hi',
            overallSummary:
              'आपकी रक्त जांच रिपोर्ट में हीमोग्लोबिन और प्लेटलेट्स सामान्य से थोड़े कम हैं, जबकि कोलेस्ट्रॉल और शुगर हल्का बढ़ा हुआ है। समय पर डॉक्टर से मिलकर संतुलित आहार और दिनचर्या पर चर्चा करें।',
            doctorVisitLevel: 'soon',
            doctorVisitReason: 'हीमोग्लोबिन और कोलेस्ट्रॉल सामान्य सीमा से बाहर हैं। डॉक्टर से परामर्श करें।',
            testsJson: [
              {
                name: 'हीमोग्लोबिन (Hb)',
                nameEnglish: 'Hemoglobin (Hb)',
                value: 10.4,
                unit: 'g/dL',
                printedRange: '12.0 - 15.5',
                status: 'low',
                whatItMeasures: 'यह लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो पूरे शरीर में ऑक्सीजन पहुंचाने का काम करता है।',
                whatYourResultMeans: 'आपका स्तर 10.4 है जो सामान्य रेंज (12.0 - 15.5) से थोड़ा कम है।',
                generalPrecautions: ['हरी पत्तेदार सब्जियां और दालें खाएं।', 'पर्याप्त आराम करें।'],
              },
              {
                name: 'टोटल कोलेस्ट्रॉल',
                nameEnglish: 'Total Cholesterol',
                value: 238,
                unit: 'mg/dL',
                printedRange: '< 200',
                status: 'high',
                whatItMeasures: 'यह रक्त में वसा (फैट) की कुल मात्रा को मापता है।',
                whatYourResultMeans: 'आपका मान 238 है, जो वांछित स्तर से ऊपर है।',
                generalPrecautions: ['तली-भुनी चीजें कम करें।', 'रोजाना 25 मिनट टहलें।'],
              },
            ],
            questionsJson: [
              'क्या मेरे हीमोग्लोबिन के लिए मुझे किसी विशेष आहार या जांच की आवश्यकता है?',
              'कोलेस्ट्रॉल को सामान्य करने के लिए क्या सावधानियां रखनी चाहिए?',
            ],
            spokenScript:
              'नमस्ते। आपकी रिपोर्ट में हीमोग्लोबिन दस दशमलव चार है, जो सामान्य से थोड़ा कम है। कोलेस्ट्रॉल दो सौ अड़तीस है जो सामान्य से अधिक है। कृपया अपने डॉक्टर से परामर्श लें।',
            disclaimer:
              'यह विवरण केवल सामान्य जानकारी के लिए है। किसी भी इलाज के लिए हमेशा अपने डॉक्टर से मिलें। आपात स्थिति में 112 डायल करें।',
          },
        },
      },
    });

    console.log(`📋 Seed report created: ${report.filename} (${report.id})`);
  }

  // 3. Create sample appointment
  const existingApt = await prisma.appointment.findFirst({
    where: { userId: user.id },
  });

  if (!existingApt) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const apt = await prisma.appointment.create({
      data: {
        bookingRef: 'APT-2611-DEMO',
        userId: user.id,
        hospitalId: CONFIGURED_HOSPITAL.id,
        hospitalName: CONFIGURED_HOSPITAL.name,
        departmentId: 'general-medicine',
        departmentName: 'General Medicine & OPD',
        date: dateStr,
        timeSlot: '10:30',
        patientName: 'Kush Kumar Gupta',
        patientAge: 45,
        patientPhone: '9876543210',
        status: 'CONFIRMED',
        documents: {
          create: {
            documentType: 'GOVERNMENT_PHOTO_ID',
            originalFilename: 'aadhaar_sample.pdf',
            filePath: 'documents/aadhaar_sample.pdf',
            fileUrl: '/uploads/documents/aadhaar_sample.pdf',
            fileMimeType: 'application/pdf',
            fileSizeBytes: 154000,
            verificationStatus: 'ACCEPTED',
          },
        },
      },
    });

    console.log(`📅 Seed appointment created: ${apt.bookingRef} on ${apt.date} at ${apt.timeSlot}`);
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
