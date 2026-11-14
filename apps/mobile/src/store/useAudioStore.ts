import { create } from 'zustand';
import {
  loadAudioQueue,
  pauseAudio,
  playAudio,
  resetAudio,
  setAudioRate,
} from '../services/audioPlayer';

interface AudioState {
  audioUrls: string[];
  isPlaying: boolean;
  speed: number;
  progressPercent: number;
  currentChunkIndex: number;
  totalChunks: number;
  activeSnippetTestName: string | null;

  setQueue: (urls: string[], title?: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  changeSpeed: (newSpeed: number) => Promise<void>;
  seekProgress: (percent: number) => void;
  playSnippet: (url: string, testName: string) => Promise<void>;
  stopAudio: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioUrls: [],
  isPlaying: false,
  speed: 1.0,
  progressPercent: 0,
  currentChunkIndex: 0,
  totalChunks: 0,
  activeSnippetTestName: null,

  setQueue: async (urls: string[], title?: string) => {
    set({
      audioUrls: urls,
      totalChunks: urls.length,
      currentChunkIndex: 0,
      progressPercent: 0,
      activeSnippetTestName: null,
    });
    if (urls.length > 0) {
      await loadAudioQueue(urls, title);
    }
  },

  togglePlayPause: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await pauseAudio();
      set({ isPlaying: false });
    } else {
      await playAudio();
      set({ isPlaying: true });
    }
  },

  changeSpeed: async (newSpeed: number) => {
    await setAudioRate(newSpeed);
    set({ speed: newSpeed });
  },

  seekProgress: (percent: number) => {
    set({ progressPercent: percent });
  },

  playSnippet: async (url: string, testName: string) => {
    await loadAudioQueue([url], `Explanation: ${testName}`);
    await playAudio();
    set({
      isPlaying: true,
      activeSnippetTestName: testName,
      totalChunks: 1,
      currentChunkIndex: 0,
      progressPercent: 0,
    });
  },

  stopAudio: async () => {
    await resetAudio();
    set({ isPlaying: false, progressPercent: 0, activeSnippetTestName: null });
  },
}));

