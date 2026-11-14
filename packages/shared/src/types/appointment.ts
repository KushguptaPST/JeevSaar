export type AppointmentStatus =
  | 'PENDING_VERIFICATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TimeSlot {
  time: string; // e.g. "09:30"
  available: boolean;
  date: string; // e.g. "2026-11-15"
}

export interface CreateAppointmentInput {
  hospitalId: string;
  departmentId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  patientName: string;
  patientAge: number;
  patientPhone: string;
  documentType: string;
  notes?: string;
  linkedReportId?: string;
}

export interface AppointmentDocument {
  id: string;
  appointmentId: string;
  originalFilename: string;
  fileMimeType: string;
  fileSizeBytes: number;
  documentType: string;
  verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  fileUrl: string;
  createdAt: string;
}

export interface AppointmentItem {
  id: string;
  bookingRef: string;
  userId: string;
  hospitalName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  document?: AppointmentDocument;
  createdAt: string;
  reminderSent: boolean;
}

export interface AdminReviewInput {
  status: 'CONFIRMED' | 'REJECTED';
  rejectionReason?: string;
}
