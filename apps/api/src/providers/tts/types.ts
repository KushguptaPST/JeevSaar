import { AudioChunk, SupportedLanguage } from '@reportsaathi/shared';

export interface SynthesizeInput {
  text: string;
  language: SupportedLanguage | string;
  speaker?: string;
}

export interface TTSResult {
  audioUrls: string[];
  chunks: AudioChunk[];
  totalChunks: number;
  language: string;
  speaker: string;
}

export interface TTSProvider {
  synthesize(input: SynthesizeInput): Promise<TTSResult>;
}

export interface SarvamSpeakerConfig {
  defaultSpeaker: string;
  supportedSpeakers: string[];
}

export const SARVAM_LANGUAGE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  or: 'od-IN', // Sarvam official language code for Odia
  od: 'od-IN',
  'or-IN': 'od-IN',
  pa: 'pa-IN',
  en: 'en-IN',
};

export const SARVAM_SPEAKER_CONFIG: Record<string, SarvamSpeakerConfig> = {
  'hi-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya', 'aditi', 'arvind'] },
  'kn-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya', 'aditi'] },
  'ta-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya', 'aditi'] },
  'bn-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya', 'aditi'] },
  'od-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya'] },
  'pa-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya'] },
  'en-IN': { defaultSpeaker: 'ananya', supportedSpeakers: ['ananya', 'aditi'] },
};
