import { ExtractedReportValue } from '@reportsaathi/shared';

export interface ReportExtractor {
  extract(fileBuffer: Buffer, mimeType: string, filename?: string): Promise<ExtractedReportValue[]>;
}

export class MockReportExtractor implements ReportExtractor {
  async extract(_fileBuffer: Buffer, _mimeType: string, _filename?: string): Promise<ExtractedReportValue[]> {
    // Realistic CBC + Lipid Panel sample test fixture
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
