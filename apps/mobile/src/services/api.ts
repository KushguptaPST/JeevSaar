import axios from 'axios';
import {
  Explanation,
  ReportItem,
  SupportedLanguage,
  TTSResponse,
} from '@reportsaathi/shared';
import { MOBILE_CONFIG } from '../config';
import { secureStorage } from './storage';

export const apiClient = axios.create({
  baseURL: MOBILE_CONFIG.apiBaseUrl,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth
  async requestOtp(phone: string) {
    const res = await apiClient.post('/auth/otp/request', { phone });
    return res.data;
  },

  async verifyOtp(phone: string, otp: string, language?: string) {
    const res = await apiClient.post('/auth/otp/verify', { phone, otp, language });
    if (res.data?.token) {
      await secureStorage.saveToken(res.data.token);
    }
    return res.data;
  },

  async recordConsent(accepted: boolean, language: string) {
    const res = await apiClient.post('/auth/consent', {
      accepted,
      version: '1.0',
      language,
    });
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Reports
  async uploadReport(file: { uri: string; name: string; type: string }) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const res = await apiClient.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getReports(): Promise<{ reports: ReportItem[] }> {
    const res = await apiClient.get('/reports');
    return res.data;
  },

  async getReport(id: string) {
    const res = await apiClient.get(`/reports/${id}`);
    return res.data;
  },

  async deleteReport(id: string) {
    const res = await apiClient.delete(`/reports/${id}`);
    return res.data;
  },

  async explainReport(id: string, language: SupportedLanguage): Promise<Explanation> {
    const res = await apiClient.post(`/reports/${id}/explain`, { language });
    return res.data;
  },

  async getTrends() {
    const res = await apiClient.get('/reports/trends');
    return res.data;
  },

  // TTS Speech
  async synthesizeTTS(text: string, language: string, speaker?: string): Promise<TTSResponse> {
    const res = await apiClient.post('/tts', { text, language, speaker });
    return res.data;
  },

  // Appointments
  async getAppointmentSlots(date: string) {
    const res = await apiClient.get(`/appointments/slots?date=${date}`);
    return res.data;
  },

  async bookAppointment(formData: FormData) {
    const res = await apiClient.post('/appointments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getAppointments() {
    const res = await apiClient.get('/appointments');
    return res.data;
  },

  async cancelAppointment(id: string) {
    const res = await apiClient.delete(`/appointments/${id}`);
    return res.data;
  },

  // Privacy & Data Purge
  async deleteMyData() {
    const res = await apiClient.delete('/users/me');
    await secureStorage.clearToken();
    return res.data;
  },
};

