import {
  DoctorVisitLevel,
  Explanation,
  ExplanationSchema,
  SupportedLanguage,
  getLanguageInfo,
} from '@reportsaathi/shared';
import { EvaluatedTestValue, enforceDoctorVisitLevel } from '../../safety/engine';
import { stripPII } from '../../safety/pii-strip';
import { applySafeFallback, validateExplanationOutput } from '../../safety/post-filter';
import { generateCannedExplanation } from './mock-explanations';
import { getSystemPrompt } from './system-prompt';
import { config } from '../../config';

export interface ExplanationLLM {
  generateExplanation(
    evaluatedTests: EvaluatedTestValue[],
    language: SupportedLanguage,
    rulesDoctorLevel: DoctorVisitLevel,
    rulesDoctorReason: string
  ): Promise<Explanation>;
}

export class MockExplanationLLM implements ExplanationLLM {
  async generateExplanation(
    evaluatedTests: EvaluatedTestValue[],
    language: SupportedLanguage,
    rulesDoctorLevel: DoctorVisitLevel,
    rulesDoctorReason: string
  ): Promise<Explanation> {
    const rawExplanation = generateCannedExplanation(
      language,
      evaluatedTests,
      rulesDoctorLevel,
      rulesDoctorReason
    );

    // Enforce doctor visit level: LLM can raise, never lower
    rawExplanation.doctorVisit.level = enforceDoctorVisitLevel(
      rulesDoctorLevel,
      rawExplanation.doctorVisit.level
    );

    // Validate with Zod
    const validated = ExplanationSchema.parse(rawExplanation);

    // Run Safety Post-filter
    const postFilter = validateExplanationOutput(validated);
    if (!postFilter.isValid) {
      return applySafeFallback(validated, language);
    }

    return validated;
  }
}

export class RealLLMExplanationProviderStub implements ExplanationLLM {
  async generateExplanation(
    evaluatedTests: EvaluatedTestValue[],
    language: SupportedLanguage,
    rulesDoctorLevel: DoctorVisitLevel,
    rulesDoctorReason: string
  ): Promise<Explanation> {
    const langInfo = getLanguageInfo(language);
    const systemPrompt = getSystemPrompt(langInfo.nameEnglish);

    // Strip PII before serializing
    const sanitizedTests = evaluatedTests.map((t) => ({
      testName: stripPII(t.testName).cleanText,
      value: t.value,
      unit: t.unit,
      printedRange: t.referenceRange,
      status: t.status,
    }));

    console.log(
      `[RealLLMExplanationProviderStub] Prompt prepared for language ${langInfo.nameEnglish}. System prompt length: ${systemPrompt.length}, tests count: ${sanitizedTests.length}`
    );

    // Fall back to Mock in development / offline mode
    const mock = new MockExplanationLLM();
    return mock.generateExplanation(evaluatedTests, language, rulesDoctorLevel, rulesDoctorReason);
  }
}

export const explanationLLM: ExplanationLLM =
  config.LLM_PROVIDER === 'mock'
    ? new MockExplanationLLM()
    : new RealLLMExplanationProviderStub();
