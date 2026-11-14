# ReportSaathi (रिफ़ोर्ट साथी)

> **A Free, Elder-Friendly Mobile Application for Explaining Medical Lab Reports in Indic Languages & Connecting with Hospitals.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88+-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4.28+-black?logo=fastify)](https://fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22+-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 1. Overview & Working Title

- **Working Title Constant**: `REPORT_SAATHI_APP_NAME = "ReportSaathi"` (defined in [`packages/shared/src/config/app.ts`](packages/shared/src/config/app.ts)).
- **Mission**: Millions of people in India receive lab test reports printed strictly in English medical terminology. ReportSaathi bridges this critical literacy gap:
  1. The patient uploads a lab report (photo or PDF).
  2. Selects their mother tongue from 7 supported languages.
  3. Receives a **simple written explanation** and a **spoken voice explanation (TTS)** of every test: what it measures, whether their value is low, normal, or high versus the **range printed on their report**, general precautions, and when to see a doctor.
  4. Features single-hospital OPD appointment booking with document upload verification for **Shree Satya Sai Hospital**.

---

## 2. Supported Languages & Audio Voices

| Language | Script | App UI | Spoken Audio Code | Default Speaker |
| :--- | :--- | :---: | :---: | :---: |
| **Hindi** (हिन्दी) | Devanagari | ✅ | `hi-IN` | `meera` |
| **Kannada** (ಕನ್ನಡ) | Kannada | ✅ | `kn-IN` | `dhanya` |
| **Tamil** (தமிழ்) | Tamil | ✅ | `ta-IN` | `aravind` |
| **Bengali** (বাংলা) | Bengali | ✅ | `bn-IN` | `ishani` |
| **Odia** (ଓଡ଼ିଆ) | Odia | ✅ | `od-IN` (`or-IN`) | `tapan` |
| **Punjabi** (ਪੰਜਾਬੀ) | Gurmukhi | ✅ | `pa-IN` | `simran` |
| **English** | Latin | ✅ | `en-IN` | `arvind` |

*Note*: Local font assets for all 7 scripts (`Noto Sans`, `Noto Sans Devanagari`, `Bengali`, `Tamil`, `Kannada`, `Oriya`, `Gurmukhi`) are bundled directly into `apps/mobile/src/assets/fonts/` and Android native assets.

---

## 3. Monorepo Architecture

```
JeevSaar/
├── apps/
│   ├── api/                    # Node.js + Fastify + TypeScript backend
│   │   ├── prisma/             # PostgreSQL schema, migrations, and seed script
│   │   ├── src/
│   │   │   ├── plugins/        # JWT auth, rate-limit, and multipart handling
│   │   │   ├── providers/      # Extractor, LLM, TTS (Sarvam stub + Mock), SMS, Storage
│   │   │   ├── routes/         # /auth, /reports, /tts, /appointments, /admin, /users/me
│   │   │   ├── safety/         # Clinical rules engine, PII redaction, post-filter
│   │   │   └── services/       # 30-day audio cache pruner & maintenance
│   │   └── tests/              # Jest unit & integration test suites
│   │
│   └── mobile/                 # React Native CLI (bare workflow, Hermes, Android-first)
│       ├── android/            # Native Gradle build, assets/fonts, AndroidManifest
│       ├── ios/                # CocoaPods Podfile & Xcode workspace
│       ├── src/
│       │   ├── design/         # Elder-friendly design system (tokens + accessible components)
│       │   ├── i18n/           # i18next bundles in 7 Indic languages
│       │   ├── navigation/     # React Navigation (Native Stack + Bottom Tabs)
│       │   ├── screens/        # 10 complete application screens
│       │   ├── services/       # TrackPlayer, Notifee notifications, Axios API, MMKV
│       │   └── store/          # Zustand global state (App, Auth, Audio)
│       └── __tests__/          # React Native Testing Library test suites
│
└── packages/
    └── shared/                 # Shared types, Zod schemas, constants, hospital config
        ├── src/config/         # App constants, Hospital directory, Doctor thresholds
        └── src/schemas/        # Zod validation schema for Explanation JSON
```

---

## 4. Getting Started & Local Development

### 4.1 Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10.x`
- **JDK**: Java 17 (recommended: `temurin-17`)
- **Android SDK**: Android SDK Platform 34/35 with Build Tools and Android Emulator configured
- **Docker**: For running PostgreSQL locally

### 4.2 Clone & Install
```bash
git clone https://github.com/KushguptaPST/JeevSaar.git
cd JeevSaar

# Install all workspace dependencies
npm install

# Build shared types and schemas
npm run build:shared
```

### 4.3 Database Setup
Start PostgreSQL container via docker-compose:
```bash
docker-compose up -d postgres
```
*(If running Postgres locally on port 5432 or 5433, configure `DATABASE_URL` in `apps/api/.env`)*

Synchronize schema and run seed data:
```bash
cd apps/api
npx prisma db push
npm run prisma:seed
cd ../..
```
*Seed script creates sample user (`9876543210`), CBC report, explanation records, and appointment.*

### 4.4 Start the Backend API
```bash
npm run dev:api
```
The Fastify server starts on `http://localhost:4000`.
- Health check: `http://localhost:4000/health`
- Metrics: `http://localhost:4000/metrics`
- Hospital Desk Admin Portal: `http://localhost:4000/admin` (Default PIN: `4321`)

---

## 5. Running the Mobile App (Android & iOS)

### 5.1 Android Emulator Networking & Cleartext Notice
> ⚠️ **IMPORTANT NETWORK NOTE FOR ANDROID**:
> - The Android Emulator accesses the host development machine at **`http://10.0.2.2:4000`** (NOT `localhost`). This is preconfigured in `apps/mobile/src/config/index.ts`.
> - Cleartext HTTP traffic is explicitly permitted for debug builds only via `android:usesCleartextTraffic="true"` in [`apps/mobile/android/app/src/main/AndroidManifest.xml`](apps/mobile/android/app/src/main/AndroidManifest.xml).

### 5.2 Start Metro Bundler
In a separate terminal:
```bash
npm run start:mobile
```

### 5.3 Run on Android Emulator
```bash
npm run android
```

### 5.4 Run on Physical Android Device
1. Connect device via USB with USB Debugging enabled.
2. Verify connection: `adb devices`.
3. Reverse port so device can reach your local Fastify backend:
   ```bash
   adb reverse tcp:4000 tcp:4000
   ```
4. Build and install:
   ```bash
   npm run android
   ```

### 5.5 Build a Signed Release APK / AAB
```bash
cd apps/mobile/android

# Build universal Release APK
./gradlew assembleRelease

# Build Google Play App Bundle (AAB)
./gradlew bundleRelease
```
Output artifacts:
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- AAB: `apps/mobile/android/app/build/outputs/bundle/release/app-release.aab`

---

## 6. Running Tests & Automated Verification

### 6.1 Run All Tests Across Monorepo
```bash
npm test
```
Runs:
- API Unit & Integration Tests: `npm run test:api` (25 tests passing: Rules engine, PII strip, Post-filter fallbacks, Cache pruner, and REST endpoints).
- Mobile Unit & Screen Tests: `npm run test:mobile` (6 tests passing: Result screen, 7-language i18n switching, and App boot).

### 6.2 Run Automated End-to-End Simulation
```bash
npm run test:e2e
```
Simulates full patient flow from OTP login -> Consent -> Lab report upload -> TTS audio queue synthesis -> Appointment slot query -> GDPR data deletion.

---

## 7. Production Checklist & Placeholder Replacement

Every third-party service sits behind a tested interface with a working offline MOCK as default. Before deploying to real users, update the following placeholders:

| Component | File Location | Development Mock Default | Production Setup |
| :--- | :--- | :--- | :--- |
| **Hospital Details** | `packages/shared/src/config/hospital.ts` | Shree Satya Sai Hospital (Demo) | Hospital legal name, official address, OPD hours, and emergency line. |
| **Critical Thresholds** | `packages/shared/src/config/critical-thresholds.json` | Baseline thresholds (see `CLINICAL_THRESHOLDS_GUIDE.md`) | **Must be reviewed and signed off by a licensed MD physician** for your hospital's lab machines. |
| **Medicine Denylist** | `packages/shared/src/config/medicine-denylist.json` | 60+ common pharmaceuticals & claim words | Expand with hospital formulary to prevent LLM prescription hallucination. |
| **Sarvam AI TTS** | `apps/api/src/providers/tts/sarvam-tts.provider.ts` | `TTS_PROVIDER="mock"` (generates PCM WAVs) | Set `TTS_PROVIDER="sarvam"` and `SARVAM_API_KEY="your-key"` (Model: `bulbul:v3`). |
| **TTS Speakers** | `packages/shared/src/types/languages.ts` | Default Indic speakers (`meera`, `dhanya`, `aravind`, etc.) | Adjust default voices according to user testing. |
| **SMS Gateway** | `apps/api/src/providers/sms/index.ts` | `MockSmsProvider` (Dev OTP: `123456`) | Plug in Twilio, Gupshup, or AWS SNS SMS API. |
| **Cloud Storage** | `apps/api/src/providers/storage/index.ts` | `LocalStorageProvider` (`/uploads/`) | Plug in AWS S3 or Google Cloud Storage client. |

---

## 8. Clinical Safety Rules (System Prompt)

The exact runtime safety rules enforced across all LLM explanations:
```text
You explain lab reports to people with low health literacy, in the requested language, using very simple words and short sentences. You are NOT a doctor.
RULES:
1. Use ONLY the values and printed reference ranges given. Never invent values or ranges.
2. Never diagnose. Say what a result can generally mean, never what the person 'has'.
3. Never name medicines, supplements, doses, or treatments, and never say anything can be 'cured'. Only general precautions (food, rest, water, activity), kept simple and safe.
4. If any value is seriously abnormal or the rules engine marks the report 'soon' or 'urgent', say clearly and early to meet a doctor (today for 'urgent'), and keep precautions minimal.
5. If you are unsure, or the report is unreadable or incomplete, say so and advise seeing a doctor. Do not guess.
6. Always say a doctor must decide any treatment. In emergency symptoms (chest pain, trouble breathing, fainting, heavy bleeding), tell the person to call 112 or go to the nearest hospital now.
7. Be calm and kind. Do not scare. Do not give false comfort.
8. Write everything in {language}. Keep test names also in English in brackets. Output only valid JSON per the schema.
```

---

## 9. License

This project is open-source under the [Apache 2.0 License](LICENSE).
