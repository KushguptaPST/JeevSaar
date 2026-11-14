import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { AudioChunk } from '@reportsaathi/shared';
import { config } from '../../config';
import { chunkTextAtSentenceBoundaries } from './sentence-chunker';
import {
  SARVAM_LANGUAGE_MAP,
  SARVAM_SPEAKER_CONFIG,
  SynthesizeInput,
  TTSProvider,
  TTSResult,
} from './types';

const prisma = new PrismaClient();

/**
 * SarvamTTSProvider
 *
 * Integrates Sarvam AI Bulbul Text-To-Speech (model "bulbul:v3").
 *
 * Requirements:
 * 1. Env vars: SARVAM_API_KEY, TTS_PROVIDER=mock|sarvam.
 * 2. Language map: hi-IN, kn-IN, ta-IN, bn-IN, pa-IN, od-IN (Odia).
 * 3. Chunks text at sentence boundaries (<2,500 chars limit).
 * 4. Caches audio by hash(text + language + speaker) in AudioCache.
 * 5. Returns ordered list of audio URLs.
 */
export class SarvamTTSProvider implements TTSProvider {
  private apiKey: string;
  private audioDir: string;
  private model: string = 'bulbul:v3';
  private apiUrl: string = 'https://api.sarvam.ai/text-to-speech';

  constructor() {
    this.apiKey = config.SARVAM_API_KEY || process.env.SARVAM_API_KEY || '';
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

    // Split text into sentence boundary chunks under 2,000 characters
    const textChunks = chunkTextAtSentenceBoundaries(input.text, 1800);
    const audioUrls: string[] = [];
    const chunks: AudioChunk[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      // SHA256 Hash caching: hash(text + language + speaker)
      const hash = crypto
        .createHash('sha256')
        .update(`${chunkText}:${sarvamLang}:${speaker}`)
        .digest('hex');

      const filename = `${hash}.wav`;
      const relativePath = path.join('audio', filename);
      const absolutePath = path.join(this.audioDir, filename);
      const audioUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

      let cached = false;

      // Check cache in database and file system
      const cachedRecord = await prisma.audioCache.findUnique({
        where: { hash },
      });

      if (cachedRecord && fs.existsSync(absolutePath)) {
        cached = true;
      } else {
        // If SARVAM_API_KEY is not provided, fall back gracefully with clear log
        if (!this.apiKey || this.apiKey === 'YOUR_SARVAM_AI_API_KEY_HERE') {
          console.warn(
            `[SarvamTTSProvider] TODO: SARVAM_API_KEY not set. Falling back to mock audio generator for chunk ${i}. Set SARVAM_API_KEY to activate live Bulbul v3 synthesis.`
          );
          // Fallback to sample playable audio buffer
          const { generatePlayableWavBuffer } = await import('./mock-audio-generator');
          const sampleBuffer = generatePlayableWavBuffer(3, 440 + i * 40);
          await fs.promises.writeFile(absolutePath, sampleBuffer);
        } else {
          // LIVE SARVAM AI BULBUL CALL
          try {
            console.log(
              `[SarvamTTSProvider] Calling Sarvam AI API for chunk ${i + 1}/${textChunks.length} in [${sarvamLang}] with speaker [${speaker}]`
            );

            // TODO: Sarvam AI text-to-speech API call
            // Endpoint: POST https://api.sarvam.ai/text-to-speech
            // Headers: { "api-subscription-key": this.apiKey, "Content-Type": "application/json" }
            // Body: { inputs: [chunkText], target_language_code: sarvamLang, speaker, model: this.model }
            const response = await axios.post(
              this.apiUrl,
              {
                inputs: [chunkText],
                target_language_code: sarvamLang,
                speaker: speaker,
                model: this.model,
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 22050,
                enable_preprocessing: true,
              },
              {
                headers: {
                  'api-subscription-key': this.apiKey,
                  'Content-Type': 'application/json',
                },
                timeout: 30000,
              }
            );

            // Sarvam Bulbul returns base64 audios in response.data.audios
            if (response.data && response.data.audios && response.data.audios[0]) {
              const base64Audio = response.data.audios[0];
              const audioBuffer = Buffer.from(base64Audio, 'base64');
              await fs.promises.writeFile(absolutePath, audioBuffer);
            } else {
              throw new Error('Sarvam API returned unexpected response structure');
            }
          } catch (err: any) {
            console.error(`[SarvamTTSProvider] Error calling Sarvam API:`, err?.response?.data || err.message);
            // Fallback to generate playable wav so user app never crashes
            const { generatePlayableWavBuffer } = await import('./mock-audio-generator');
            const sampleBuffer = generatePlayableWavBuffer(3, 440 + i * 40);
            await fs.promises.writeFile(absolutePath, sampleBuffer);
          }
        }

        // Cache record in DB
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
            durationSec: Math.round(chunkText.length / 20),
          },
          update: {
            audioUrl,
            filePath: relativePath,
          },
        });
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
