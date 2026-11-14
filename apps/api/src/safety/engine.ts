import {
  DoctorVisitLevel,
  ExtractedReportValue,
  TestStatus,
  criticalThresholds,
} from '@reportsaathi/shared';

export interface EvaluatedTestValue extends ExtractedReportValue {
  testNameEnglish: string;
  status: TestStatus;
  numericValue?: number;
  minRange?: number;
  maxRange?: number;
  deviationPercent?: number;
  isCritical: boolean;
  criticalReason?: string;
}

export interface RulesEngineResult {
  evaluatedTests: EvaluatedTestValue[];
  doctorVisitLevel: DoctorVisitLevel;
  doctorVisitReason: string;
  urgentFlags: string[];
  soonFlags: string[];
}

export function parseNumeric(value: number | string): number | undefined {
  if (typeof value === 'number') return isNaN(value) ? undefined : value;
  const cleaned = value.replace(/,/g, '').trim();
  const match = cleaned.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return undefined;
  const num = parseFloat(match[0]);
  return isNaN(num) ? undefined : num;
}

export function parseRange(rangeStr: string): { min?: number; max?: number } {
  const cleaned = rangeStr.trim().toLowerCase();
  if (!cleaned) return {};

  // Pattern: "< 200" or "<= 200"
  const lessThanMatch = cleaned.match(/^<(=)?\s*([0-9.]+)/);
  if (lessThanMatch) {
    const maxVal = parseFloat(lessThanMatch[2]);
    return { min: 0, max: maxVal };
  }

  // Pattern: "> 40" or ">= 40"
  const greaterThanMatch = cleaned.match(/^>(=)?\s*([0-9.]+)/);
  if (greaterThanMatch) {
    const minVal = parseFloat(greaterThanMatch[2]);
    return { min: minVal, max: undefined };
  }

  // Pattern: "12.0 - 15.5" or "12.0 to 15.5" or "70-99"
  const dashMatch = cleaned.match(/([0-9.]+)\s*(?:-|to)\s*([0-9.]+)/);
  if (dashMatch) {
    const minVal = parseFloat(dashMatch[1]);
    const maxVal = parseFloat(dashMatch[2]);
    return { min: minVal, max: maxVal };
  }

  return {};
}

export function computeTestStatus(
  numericVal: number | undefined,
  minRange?: number,
  maxRange?: number
): { status: TestStatus; deviationPercent?: number } {
  if (numericVal === undefined) {
    return { status: 'unknown' };
  }

  if (minRange !== undefined && maxRange !== undefined) {
    if (numericVal < minRange) {
      const dev = ((minRange - numericVal) / (minRange || 1)) * 100;
      return { status: 'low', deviationPercent: Math.round(dev) };
    }
    if (numericVal > maxRange) {
      const dev = ((numericVal - maxRange) / (maxRange || 1)) * 100;
      return { status: 'high', deviationPercent: Math.round(dev) };
    }
    return { status: 'normal', deviationPercent: 0 };
  }

  if (minRange !== undefined && maxRange === undefined) {
    // e.g. HDL > 40
    if (numericVal < minRange) {
      const dev = ((minRange - numericVal) / (minRange || 1)) * 100;
      return { status: 'low', deviationPercent: Math.round(dev) };
    }
    return { status: 'normal', deviationPercent: 0 };
  }

  if (maxRange !== undefined && minRange === undefined) {
    // e.g. Cholesterol < 200
    if (numericVal > maxRange) {
      const dev = ((numericVal - maxRange) / (maxRange || 1)) * 100;
      return { status: 'high', deviationPercent: Math.round(dev) };
    }
    return { status: 'normal', deviationPercent: 0 };
  }

  return { status: 'unknown' };
}

export function evaluateReportValues(rawValues: ExtractedReportValue[]): RulesEngineResult {
  const defaultThreshold = criticalThresholds.defaultDeviationThresholdPercent || 30;
  const criticalList = criticalThresholds.criticalTests || [];

  const evaluatedTests: EvaluatedTestValue[] = [];
  const urgentFlags: string[] = [];
  const soonFlags: string[] = [];

  for (const raw of rawValues) {
    const numeric = parseNumeric(raw.value);
    const { min, max } = parseRange(raw.referenceRange);
    const { status, deviationPercent } = computeTestStatus(numeric, min, max);

    let isCritical = false;
    let criticalReason: string | undefined;

    // Check critical thresholds list by alias matching
    const testNameLower = raw.testName.toLowerCase();
    const matchedCrit = criticalList.find((crit) => {
      if (testNameLower.includes(crit.testKey.toLowerCase())) return true;
      return crit.aliases?.some((alias) => testNameLower.includes(alias.toLowerCase()));
    });

    if (matchedCrit && numeric !== undefined) {
      if (matchedCrit.alwaysUrgentIfAboveMax && max !== undefined && numeric > max) {
        isCritical = true;
        criticalReason = matchedCrit.emergencyAdvice || `${raw.testName} is critically elevated`;
        urgentFlags.push(criticalReason);
      } else if (matchedCrit.criticalMin !== undefined && numeric < matchedCrit.criticalMin) {
        isCritical = true;
        criticalReason = matchedCrit.emergencyAdvice || `${raw.testName} is critically low (${raw.value} ${raw.unit})`;
        urgentFlags.push(criticalReason);
      } else if (matchedCrit.criticalMax !== undefined && numeric > matchedCrit.criticalMax) {
        isCritical = true;
        criticalReason = matchedCrit.emergencyAdvice || `${raw.testName} is critically high (${raw.value} ${raw.unit})`;
        urgentFlags.push(criticalReason);
      }
    }

    // Check standard percentage deviation (> 30% -> soon)
    if (!isCritical && deviationPercent && deviationPercent >= defaultThreshold && status !== 'normal') {
      const flag = `${raw.testName} is ${deviationPercent}% outside standard reference range`;
      soonFlags.push(flag);
    }

    evaluatedTests.push({
      ...raw,
      testNameEnglish: raw.testName,
      status,
      numericValue: numeric,
      minRange: min,
      maxRange: max,
      deviationPercent,
      isCritical,
      criticalReason,
    });
  }

  let doctorVisitLevel: DoctorVisitLevel = 'routine';
  let doctorVisitReason = 'All test values appear within standard limits. Continue routine care.';

  if (urgentFlags.length > 0) {
    doctorVisitLevel = 'urgent';
    doctorVisitReason = `Critical value detected: ${urgentFlags.join('; ')}. Please consult a doctor immediately.`;
  } else if (soonFlags.length > 0) {
    doctorVisitLevel = 'soon';
    doctorVisitReason = `One or more tests are outside the printed reference range: ${soonFlags.slice(0, 2).join('; ')}. Schedule a consultation soon.`;
  } else {
    // If any status is low/high even without 30% dev
    const abnormalCount = evaluatedTests.filter((t) => t.status === 'low' || t.status === 'high').length;
    if (abnormalCount > 0) {
      doctorVisitLevel = 'soon';
      doctorVisitReason = `${abnormalCount} test(s) show slight variation from standard range. Review with your doctor on your next visit.`;
    }
  }

  return {
    evaluatedTests,
    doctorVisitLevel,
    doctorVisitReason,
    urgentFlags,
    soonFlags,
  };
}

export function enforceDoctorVisitLevel(
  ruleLevel: DoctorVisitLevel,
  llmLevel: DoctorVisitLevel
): DoctorVisitLevel {
  const hierarchy: Record<DoctorVisitLevel, number> = {
    routine: 1,
    soon: 2,
    urgent: 3,
  };

  // Rule: LLM can raise the level, but never lower it
  return hierarchy[llmLevel] > hierarchy[ruleLevel] ? llmLevel : ruleLevel;
}
