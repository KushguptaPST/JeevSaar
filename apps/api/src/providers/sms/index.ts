import { config } from '../../config';

export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<boolean>;
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    console.log(`[MockSmsProvider] 📲 Sent OTP [${otp}] to phone [${phone}] (Dev default: 123456)`);
    return true;
  }
}

export class ProductionSmsProviderStub implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    // TODO: Plug in real SMS provider (e.g. MSG91, Twilio, Fast2SMS) using provider API key
    console.log(`[ProductionSmsProviderStub] Sending real SMS to ${phone}`);
    return true;
  }
}

export const smsProvider: SmsProvider =
  config.SMS_PROVIDER === 'mock' ? new MockSmsProvider() : new ProductionSmsProviderStub();
