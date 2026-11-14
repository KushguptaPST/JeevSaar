import {
  computeTestStatus,
  enforceDoctorVisitLevel,
  evaluateReportValues,
  parseNumeric,
  parseRange,
} from '../src/safety/engine';

describe('Safety Engine - Rules & Thresholds', () => {
  describe('parseNumeric', () => {
    it('parses integers and floats correctly', () => {
      expect(parseNumeric(14.5)).toBe(14.5);
      expect(parseNumeric('10.4')).toBe(10.4);
      expect(parseNumeric('7,800')).toBe(7800);
      expect(parseNumeric('150000 /mcL')).toBe(150000);
    });

    it('returns undefined for invalid strings', () => {
      expect(parseNumeric('Negative')).toBeUndefined();
      expect(parseNumeric('')).toBeUndefined();
    });
  });

  describe('parseRange', () => {
    it('parses dash-separated ranges', () => {
      expect(parseRange('12.0 - 15.5')).toEqual({ min: 12.0, max: 15.5 });
      expect(parseRange('70 to 99')).toEqual({ min: 70, max: 99 });
    });

    it('parses less-than and greater-than thresholds', () => {
      expect(parseRange('< 200')).toEqual({ min: 0, max: 200 });
      expect(parseRange('> 40')).toEqual({ min: 40, max: undefined });
    });
  });

  describe('computeTestStatus', () => {
    it('identifies low, normal, high status correctly', () => {
      expect(computeTestStatus(10.4, 12.0, 15.5).status).toBe('low');
      expect(computeTestStatus(13.5, 12.0, 15.5).status).toBe('normal');
      expect(computeTestStatus(16.5, 12.0, 15.5).status).toBe('high');
    });

    it('computes deviation percentage correctly', () => {
      // 10.4 vs min 12.0 -> ((12.0 - 10.4) / 12) * 100 = 13.3% -> round 13
      const res = computeTestStatus(10.4, 12.0, 15.5);
      expect(res.status).toBe('low');
      expect(res.deviationPercent).toBe(13);
    });
  });

  describe('evaluateReportValues & doctorVisit.level', () => {
    it('sets routine when all values are normal', () => {
      const result = evaluateReportValues([
        {
          testName: 'Hemoglobin',
          value: 14.0,
          unit: 'g/dL',
          referenceRange: '12.0 - 16.0',
        },
      ]);
      expect(result.doctorVisitLevel).toBe('routine');
      expect(result.urgentFlags).toHaveLength(0);
    });

    it('escalates to soon when a test deviates by >= 30%', () => {
      // Normal range: 70 - 100. Value: 140 (40% higher than max)
      const result = evaluateReportValues([
        {
          testName: 'Blood Glucose',
          value: 140,
          unit: 'mg/dL',
          referenceRange: '70 - 100',
        },
      ]);
      expect(result.doctorVisitLevel).toBe('soon');
    });

    it('escalates to urgent when a critical test is severely abnormal', () => {
      // Troponin elevation
      const result = evaluateReportValues([
        {
          testName: 'Cardiac Troponin I',
          value: 0.85,
          unit: 'ng/mL',
          referenceRange: '< 0.04',
        },
      ]);
      expect(result.doctorVisitLevel).toBe('urgent');
      expect(result.urgentFlags.length).toBeGreaterThan(0);
    });

    it('escalates to urgent when potassium is dangerously high', () => {
      const result = evaluateReportValues([
        {
          testName: 'Serum Potassium',
          value: 6.8,
          unit: 'mmol/L',
          referenceRange: '3.5 - 5.0',
        },
      ]);
      expect(result.doctorVisitLevel).toBe('urgent');
    });
  });

  describe('enforceDoctorVisitLevel', () => {
    it('allows LLM to raise severity from soon to urgent', () => {
      expect(enforceDoctorVisitLevel('soon', 'urgent')).toBe('urgent');
    });

    it('prevents LLM from lowering severity from urgent to routine or soon', () => {
      expect(enforceDoctorVisitLevel('urgent', 'routine')).toBe('urgent');
      expect(enforceDoctorVisitLevel('urgent', 'soon')).toBe('urgent');
      expect(enforceDoctorVisitLevel('soon', 'routine')).toBe('soon');
    });
  });
});
