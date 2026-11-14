export interface TTSRequest {
  text: string;
  language: string; // e.g. 'hi', 'kn', 'ta' or 'hi-IN'
  speaker?: string;
  speed?: number; // 0.75, 1.0, 1.25
}

export interface AudioChunk {
  index: number;
  text: string;
  audioUrl: string;
  durationSec?: number;
  cached: boolean;
}

export interface TTSResponse {
  audioUrls: string[];
  chunks: AudioChunk[];
  totalChunks: number;
  language: string;
  speaker: string;
}
