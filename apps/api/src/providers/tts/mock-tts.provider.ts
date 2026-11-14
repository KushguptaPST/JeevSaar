import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AudioChunk } from '@reportsaathi/shared';
import { config } from '../../config';
import { generatePlayableWavBuffer } from './mock-audio-generator';
import { chunkTextAtSentenceBoundaries } from './sentence-chunker';
import { SARVAM_LANGUAGE_MAP, SARVAM_SPEAKER_CONFIG, SynthesizeInput, TTSProvider, TTSResult } from './types';

const prisma = new PrismaClient();

export class MockTTSProvider implements TTSProvider {
  private audioDir: string;

  constructor() {
    this.audioDir = path.join(config.uploadAbsoluteDir, 'audio');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async synthesize(input: SynthesizeInput): Promise<TTSResult> {
    const rawLang = input.language || 'hi';
    const sarvamLang = SARVAM_LANGUAGE_MAP[rawLang] || 'hi-IN';
    const speakerConfig = SARVAM_SPEAKER_CONFIG[sarvamLang] || { defaultSpeaker: 'ananya' };
    const speaker = input.speaker || speakerConfig.defaultSpeaker;

    // Split text into safe chunks under 2,000 characters
    const textChunks = chunkTextAtSentenceBoundaries(input.text);
    const audioUrls: string[] = [];
    const chunks: AudioChunk[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      const hash = crypto
        .createHash('sha256')
        .update(`${chunkText}:${sarvamLang}:${speaker}`)
        .digest('hex');

      const filename = `${hash}.wav`;
      const relativePath = path.join('audio', filename);
      const absolutePath = path.join(this.audioDir, filename);
      const audioUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

      let cached = false;

      // 1. Check database cache
      try {
        const existingRecord = await prisma.audioCache.findUnique({
          where: { hash },
        });

        if (existingRecord && fs.existsSync(absolutePath)) {
          cached = true;
        } else {
          // Generate realistic playable WAV audio sample
          const durationSec = Math.max(2, Math.min(6, Math.round(chunkText.length / 25)));
          const audioBuffer = generatePlayableWavBuffer(durationSec, 440 + i * 40);
          await fs.promises.writeFile(absolutePath, audioBuffer);

          await prisma.audioCache.upsert({
            where: { hash },
            create: {
              hash,
              text: chunkText,
              language: sarvamLang,
              speaker,
              audioUrl,
              filePath: relativePath,
              mimeType: 'audio/wav',
              durationSec,
            },
            update: {
              audioUrl,
              filePath: relativePath,
            },
          });
        }
      } catch (err) {
        console.warn(`[MockTTSProvider] Cache check warning for chunk ${i}:`, err);
        if (!fs.existsSync(absolutePath)) {
          const audioBuffer = generatePlayableWavBuffer(3, 440);
          await fs.promises.writeFile(absolutePath, audioBuffer);
        }
      }

      audioUrls.push(audioUrl);
      chunks.push({
        index: i,
        text: chunkText,
        audioUrl,
        durationSec: 3,
        cached,
      });
    }

    return {
      audioUrls,
      chunks,
      totalChunks: chunks.length,
      language: sarvamLang,
      speaker,
    };
  }
}
