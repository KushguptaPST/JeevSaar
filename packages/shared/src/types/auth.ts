export interface User {
  id: string;
  phone: string;
  language: string;
  textSize: 'normal' | 'large' | 'extra-large';
  hasConsented: boolean;
  createdAt: string;
}

export interface RequestOtpInput {
  phone: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  devOtp?: string; // In dev, returns 123456
}

export interface VerifyOtpInput {
  phone: string;
  otp: string;
  language?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RecordConsentInput {
  accepted: boolean;
  version: string;
  language: string;
}
