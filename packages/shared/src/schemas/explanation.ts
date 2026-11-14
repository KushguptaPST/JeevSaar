import { z } from 'zod';

export const TestStatusEnum = z.enum(['low', 'normal', 'high', 'unknown']);
export type TestStatus = z.infer<typeof TestStatusEnum>;

export const DoctorVisitLevelEnum = z.enum(['routine', 'soon', 'urgent']);
export type DoctorVisitLevel = z.infer<typeof DoctorVisitLevelEnum>;

export const TestExplanationItemSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  nameEnglish: z.string().min(1, 'English test name is required'),
  value: z.union([z.number(), z.string()]),
  unit: z.string().default(''),
  printedRange: z.string().default(''),
  status: TestStatusEnum,
  whatItMeasures: z.string().min(1, 'Description of what test measures is required'),
  whatYourResultMeans: z.string().min(1, 'Explanation of result is required'),
  generalPrecautions: z.array(z.string()).default([]),
});
export type TestExplanationItem = z.infer<typeof TestExplanationItemSchema>;

export const DoctorVisitSchema = z.object({
  level: DoctorVisitLevelEnum,
  reason: z.string().min(1, 'Reason for visit recommendation is required'),
});
export type DoctorVisit = z.infer<typeof DoctorVisitSchema>;

export const ExplanationSchema = z.object({
  language: z.string().min(2),
  overallSummary: z.string().min(1).max(500),
  doctorVisit: DoctorVisitSchema,
  tests: z.array(TestExplanationItemSchema).min(1, 'At least one test must be explained'),
  questionsForDoctor: z.array(z.string()).default([]),
  spokenScript: z.string().min(10, 'Spoken audio script is required'),
  disclaimer: z.string().min(10, 'Medical disclaimer is required'),
});

export type Explanation = z.infer<typeof ExplanationSchema>;
