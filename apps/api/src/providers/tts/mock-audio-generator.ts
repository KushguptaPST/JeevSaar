/**
 * Generates a valid standard 16-bit PCM WAV audio buffer.
 * Provides a playable, offline audio file for testing TrackPlayer queues,
 * scrubber progress, speed adjustments, and notification controls.
 */
export function generatePlayableWavBuffer(durationSeconds = 2, frequencyHz = 440): Buffer {
  const sampleRate = 22050;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const totalFileSize = 44 + dataSize;

  const buffer = Buffer.alloc(totalFileSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalFileSize - 8, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // 'data' Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Gentle tone wave samples
  let offset = 44;
  const volume = 0.25; // Gentle volume
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope to prevent audio click
    const attackDecay = Math.min(1, Math.min(t * 10, (durationSeconds - t) * 5));
    const sample = Math.sin(2 * Math.PI * frequencyHz * t) * volume * attackDecay;
    const int16Sample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(int16Sample, offset);
    offset += 2;
  }

  return buffer;
}
