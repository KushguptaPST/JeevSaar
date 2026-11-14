import { Explanation, TestStatus } from '../schemas/explanation';

export interface ExtractedReportValue {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  rawText?: string;
  category?: string;
}

export interface ReportItem {
  id: string;
  userId: string;
  filename: string;
  fileUrl: string;
  fileMimeType: string;
  fileSizeBytes: number;
  reportDate?: string;
  labName?: string;
  patientNameStripped?: boolean;
  status: 'UPLOADED' | 'EXTRACTED' | 'EXPLAINED' | 'FAILED';
  doctorVisitLevel?: string;
  createdAt: string;
  updatedAt: string;
  values?: ExtractedReportValue[];
  latestExplanation?: Explanation;
}

export interface TestTrendPoint {
  reportId: string;
  date: string;
  numericValue: number;
  unit: string;
  referenceRange: string;
  status: TestStatus;
}

export interface TestTrendSeries {
  testNameEnglish: string;
  dataPoints: TestTrendPoint[];
  normalMin?: number;
  normalMax?: number;
}
