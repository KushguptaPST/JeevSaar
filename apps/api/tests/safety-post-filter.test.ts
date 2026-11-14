import {
  applySafeFallback,
  hasEmergencyKeywords,
  inspectTextForSafetyViolations,
  validateExplanationOutput,
} from '../src/safety/post-filter';
import { stripPII } from '../src/safety/pii-strip';
import { Explanation } from '@reportsaathi/shared';

describe('Safety Post-Filter & PII Redaction', () => {
  describe('stripPII', () => {
    it('redacts 10-digit Indian phone numbers', () => {
      const input = 'Patient phone: 9876543210 or +919876543210';
      const result = stripPII(input);
      expect(result.piiDetected).toBe(true);
      expect(result.cleanText).not.toContain('9876543210');
      expect(result.cleanText).toContain('[REDACTED_PHONE]');
    });

    it('redacts patient names and hospital UHID/MRN barcodes', () => {
      const input = 'Patient Name: Rajesh Sharma, UHID: BLR-984210, Lab No: 49201';
      const result = stripPII(input);
      expect(result.cleanText).not.toContain('Rajesh Sharma');
      expect(result.cleanText).not.toContain('BLR-984210');
      expect(result.cleanText).toContain('[REDACTED_PATIENT]');
      expect(result.cleanText).toContain('[REDACTED_ID]');
    });
  });

  describe('inspectTextForSafetyViolations', () => {
    it('detects dosage patterns (e.g. 500mg, 10ml, 1 tablet)', () => {
      const text = 'You can take 500mg paracetamol twice daily';
      const violations = inspectTextForSafetyViolations(text, 'testField');
      expect(violations.some((v) => v.type === 'DOSAGE_PATTERN')).toBe(true);
      expect(violations.some((v) => v.type === 'DENYLIST_MEDICINE')).toBe(true);
    });

    it('detects banned claim words like "cure" or "guaranteed"', () => {
      const text = 'This diet is a guaranteed cure for diabetes';
      const violations = inspectTextForSafetyViolations(text, 'testField');
      expect(violations.some((v) => v.type === 'DISALLOWED_CLAIM')).toBe(true);
    });

    it('passes safe general lifestyle and precautionary advice', () => {
      const text = 'Drink plenty of warm water, eat fresh green vegetables and rest well.';
      const violations = inspectTextForSafetyViolations(text, 'testField');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Emergency Symptoms Detection', () => {
    it('flags chest pain or trouble breathing as emergency', () => {
      expect(hasEmergencyKeywords('Patient reported severe chest pain and dizziness')).toBe(true);
      expect(hasEmergencyKeywords('सांस लेने में तकलीफ हो रही है')).toBe(true);
      expect(hasEmergencyKeywords('Mild cold and sneezes')).toBe(false);
    });
  });

  describe('applySafeFallback', () => {
    it('substitutes violating sections with safe verified fallback message in user language', () => {
      const invalidExplanation: Explanation = {
        language: 'hi',
        overallSummary: 'This cure is guaranteed with 500mg tablets.',
        doctorVisit: { level: 'routine', reason: 'Routine follow-up' },
        tests: [
          {
            name: 'Sugar',
            nameEnglish: 'Glucose',
            value: 200,
            unit: 'mg/dL',
            printedRange: '70-99',
            status: 'high',
            whatItMeasures: 'Blood sugar',
            whatYourResultMeans: 'Take 500mg metformin daily.',
            generalPrecautions: ['Take 10ml syrup'],
          },
        ],
        questionsForDoctor: [],
        spokenScript: 'Take medicine daily.',
        disclaimer: 'Medical disclaimer',
      };

      const fallback = applySafeFallback(invalidExplanation, 'hi');
      const reCheck = validateExplanationOutput(fallback);
      expect(reCheck.isValid).toBe(true);
      expect(fallback.tests[0].whatYourResultMeans).toContain('डॉक्टर');
    });
  });
});
