import { ExtractedReportValue } from '@reportsaathi/shared';

export interface ReportExtractor {
  extract(fileBuffer: Buffer, mimeType: string, filename?: string): Promise<ExtractedReportValue[]>;
}

export class MockReportExtractor implements ReportExtractor {
  async extract(_fileBuffer: Buffer, _mimeType: string, filename?: string): Promise<ExtractedReportValue[]> {
    const lowerName = (filename || '').toLowerCase();

    // 1. Thyroid Profile Fixture
    if (lowerName.includes('thyroid') || lowerName.includes('tsh')) {
      return [
        {
          testName: 'Thyroid Stimulating Hormone (TSH)',
          value: 6.8,
          unit: 'uIU/mL',
          referenceRange: '0.35 - 4.94',
          category: 'Thyroid Profile',
          rawText: 'TSH (Ultrasensitive) ... 6.80 uIU/mL ... [0.35 - 4.94]',
        },
        {
          testName: 'Total Thyroxine (T4)',
          value: 8.2,
          unit: 'ug/dL',
          referenceRange: '4.87 - 11.72',
          category: 'Thyroid Profile',
          rawText: 'Total T4 ... 8.20 ug/dL ... [4.87 - 11.72]',
        },
        {
          testName: 'Total Triiodothyronine (T3)',
          value: 1.1,
          unit: 'ng/mL',
          referenceRange: '0.80 - 2.00',
          category: 'Thyroid Profile',
          rawText: 'Total T3 ... 1.10 ng/mL ... [0.80 - 2.00]',
        },
      ];
    }

    // 2. Renal / Kidney Function Test (KFT) Fixture
    if (lowerName.includes('kidney') || lowerName.includes('renal') || lowerName.includes('kft')) {
      return [
        {
          testName: 'Serum Creatinine',
          value: 1.6,
          unit: 'mg/dL',
          referenceRange: '0.7 - 1.3',
          category: 'Renal Function Test',
          rawText: 'Serum Creatinine (Modified Jaffe) ... 1.60 mg/dL ... [0.70 - 1.30]',
        },
        {
          testName: 'Blood Urea Nitrogen (BUN)',
          value: 28,
          unit: 'mg/dL',
          referenceRange: '7 - 20',
          category: 'Renal Function Test',
          rawText: 'BUN ... 28.0 mg/dL ... [7.0 - 20.0]',
        },
        {
          testName: 'Serum Uric Acid',
          value: 7.4,
          unit: 'mg/dL',
          referenceRange: '3.5 - 7.2',
          category: 'Renal Function Test',
          rawText: 'Serum Uric Acid ... 7.4 mg/dL ... [3.5 - 7.2]',
        },
        {
          testName: 'Serum Potassium',
          value: 4.8,
          unit: 'mEq/L',
          referenceRange: '3.5 - 5.1',
          category: 'Electrolytes',
          rawText: 'Serum Potassium (ISE) ... 4.8 mEq/L ... [3.5 - 5.1]',
        },
      ];
    }

    // 3. Liver Function Test (LFT) Fixture
    if (lowerName.includes('liver') || lowerName.includes('lft')) {
      return [
        {
          testName: 'SGPT / ALT (Alanine Aminotransferase)',
          value: 62,
          unit: 'U/L',
          referenceRange: '7 - 56',
          category: 'Liver Function Test',
          rawText: 'SGPT / ALT ... 62 U/L ... [7 - 56]',
        },
        {
          testName: 'SGOT / AST (Aspartate Aminotransferase)',
          value: 48,
          unit: 'U/L',
          referenceRange: '10 - 40',
          category: 'Liver Function Test',
          rawText: 'SGOT / AST ... 48 U/L ... [10 - 40]',
        },
        {
          testName: 'Total Bilirubin',
          value: 1.1,
          unit: 'mg/dL',
          referenceRange: '0.2 - 1.2',
          category: 'Liver Function Test',
          rawText: 'Total Bilirubin ... 1.1 mg/dL ... [0.2 - 1.2]',
        },
        {
          testName: 'Alkaline Phosphatase (ALP)',
          value: 105,
          unit: 'U/L',
          referenceRange: '44 - 147',
          category: 'Liver Function Test',
          rawText: 'Alkaline Phosphatase ... 105 U/L ... [44 - 147]',
        },
      ];
    }

    // 4. Default: Realistic CBC + Lipid Panel sample test fixture
    return [
      {
        testName: 'Hemoglobin (Hb)',
        value: 10.4,
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5',
        category: 'Complete Blood Count (CBC)',
        rawText: 'Hemoglobin (Hb) ... 10.4 g/dL ... [12.0 - 15.5]',
      },
      {
        testName: 'Total WBC Count',
        value: 7800,
        unit: 'cells/mcL',
        referenceRange: '4000 - 11000',
        category: 'Complete Blood Count (CBC)',
        rawText: 'Total Leucocyte Count ... 7800 /cumm ... [4000 - 11000]',
      },
      {
        testName: 'Platelet Count',
        value: 140000,
        unit: '/mcL',
        referenceRange: '150000 - 450000',
        category: 'Complete Blood Count (CBC)',
        rawText: 'Platelet Count ... 1.40 Lakhs/cumm ... [1.50 - 4.50 Lakhs]',
      },
      {
        testName: 'RBC Count',
        value: 4.1,
        unit: 'million/mcL',
        referenceRange: '3.8 - 5.2',
        category: 'Complete Blood Count (CBC)',
        rawText: 'Red Blood Cell Count ... 4.10 mill/cumm ... [3.80 - 5.20]',
      },
      {
        testName: 'Total Cholesterol',
        value: 238,
        unit: 'mg/dL',
        referenceRange: '< 200',
        category: 'Lipid Profile',
        rawText: 'Total Cholesterol ... 238 mg/dL ... Desirable: < 200',
      },
      {
        testName: 'HDL Cholesterol (Good)',
        value: 46,
        unit: 'mg/dL',
        referenceRange: '> 40',
        category: 'Lipid Profile',
        rawText: 'HDL Cholesterol ... 46 mg/dL ... Normal: > 40',
      },
      {
        testName: 'LDL Cholesterol (Bad)',
        value: 154,
        unit: 'mg/dL',
        referenceRange: '< 100',
        category: 'Lipid Profile',
        rawText: 'LDL Cholesterol (Calculated) ... 154 mg/dL ... Desirable: < 100',
      },
      {
        testName: 'Triglycerides',
        value: 190,
        unit: 'mg/dL',
        referenceRange: '< 150',
        category: 'Lipid Profile',
        rawText: 'Serum Triglycerides ... 190 mg/dL ... Normal: < 150',
      },
      {
        testName: 'Fasting Blood Glucose',
        value: 112,
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        category: 'Diabetes / Metabolic',
        rawText: 'Fasting Blood Sugar (FBS) ... 112 mg/dL ... [70.0 - 99.0]',
      },
    ];
  }
}

export class VisionOcrReportExtractorStub implements ReportExtractor {
  async extract(fileBuffer: Buffer, mimeType: string, filename?: string): Promise<ExtractedReportValue[]> {
    // TODO: Plug in Google Cloud Document AI / Google Cloud Vision API / AWS Textract
    console.log(`[VisionOcrReportExtractorStub] Extracting from ${filename} (${mimeType}, ${fileBuffer.length} bytes)`);
    const fallback = new MockReportExtractor();
    return fallback.extract(fileBuffer, mimeType, filename);
  }
}

export const reportExtractor: ReportExtractor = new MockReportExtractor();
