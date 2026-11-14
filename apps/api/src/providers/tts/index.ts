import { config } from '../../config';
import { MockTTSProvider } from './mock-tts.provider';
import { SarvamTTSProvider } from './sarvam-tts.provider';
import { TTSProvider } from './types';

export * from './types';
export * from './sentence-chunker';
export * from './mock-audio-generator';
export * from './mock-tts.provider';
export * from './sarvam-tts.provider';

export function getTTSProvider(): TTSProvider {
  if (config.TTS_PROVIDER === 'sarvam') {
    return new SarvamTTSProvider();
  }
  return new MockTTSProvider();
}

export const ttsProvider: TTSProvider = getTTSProvider();
