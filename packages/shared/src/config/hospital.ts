export interface HospitalConfig {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  workingHours: {
    start: string; // e.g. "09:00"
    end: string;   // e.g. "17:00"
    slotDurationMinutes: number;
    daysOfWeek: number[]; // 1 = Mon ... 6 = Sat
  };
  departments: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  acceptedDocumentTypes: Array<{
    id: string;
    label: string;
    description: string;
    required: boolean;
  }>;
}

export const CONFIGURED_HOSPITAL: HospitalConfig = {
  id: 'satya-sai-main',
  name: 'Shree Satya Sai Hospital',
  address: 'Plot 12, Health City Enclave, Super Specialty Wing',
  city: 'Bengaluru / New Delhi',
  phone: '+91-1800-425-724',
  email: 'appointments@satyasaihospital.org',
  workingHours: {
    start: '09:00',
    end: '17:00',
    slotDurationMinutes: 30,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
  },
  departments: [
    {
      id: 'general-medicine',
      name: 'General Medicine & OPD',
      description: 'Routine check-ups, fever, diabetes & lifestyle management',
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart health, chest discomfort, blood pressure monitoring',
    },
    {
      id: 'hematology',
      name: 'Hematology',
      description: 'Blood disorders, anemia, platelets & CBC follow-ups',
    },
    {
      id: 'endocrinology',
      name: 'Endocrinology',
      description: 'Thyroid, diabetes HbA1c, hormonal evaluations',
    },
    {
      id: 'nephrology',
      name: 'Nephrology',
      description: 'Kidney function, creatinine and electrolytes check',
    },
    {
      id: 'gastroenterology',
      name: 'Gastroenterology',
      description: 'Liver function, digestive issues, lipid management',
    },
  ],
  acceptedDocumentTypes: [
    {
      id: 'GOVERNMENT_PHOTO_ID',
      label: 'Government Photo ID',
      description: 'Aadhaar Card, Voter ID, Passport, or Driving License',
      required: false,
    },
    {
      id: 'DOCTOR_PRESCRIPTION',
      label: "Doctor's Referral / Prescription",
      description: 'Recent OPD slip, referral letter, or prescription from a clinic',
      required: false,
    },
    {
      id: 'RECENT_MEDICAL_REPORT',
      label: 'Recent Lab / Diagnostic Report',
      description: 'Lab test result, ultrasound/X-ray summary from the last 90 days',
      required: false,
    },
  ],
};
