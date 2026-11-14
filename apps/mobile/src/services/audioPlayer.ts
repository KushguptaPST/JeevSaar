import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
} from 'react-native-track-player';
import { MOBILE_CONFIG } from '../config';

let isSetup = false;

export async function setupTrackPlayer(): Promise<boolean> {
  if (isSetup) return true;

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    isSetup = true;
    return true;
  } catch (err) {
    console.warn('[TrackPlayer] Setup notice (using fallback):', err);
    return false;
  }
}

export async function loadAudioQueue(
  audioUrls: string[],
  title = 'Report Explanation',
  artist = 'ReportSaathi'
) {
  await setupTrackPlayer();

  try {
    await TrackPlayer.reset();

    const tracks = audioUrls.map((url, idx) => {
      // Resolve relative URL to server host
      const fullUrl = url.startsWith('http')
        ? url
        : `${MOBILE_CONFIG.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

      return {
        id: `chunk_${idx}`,
        url: fullUrl,
        title: `${title} (Part ${idx + 1} of ${audioUrls.length})`,
        artist,
        duration: 3,
      };
    });

    await TrackPlayer.add(tracks);
    return true;
  } catch (err) {
    console.warn('[TrackPlayer] loadAudioQueue fallback:', err);
    return false;
  }
}

export async function playAudio() {
  try {
    await TrackPlayer.play();
  } catch (e) {
    // fallback
  }
}

export async function pauseAudio() {
  try {
    await TrackPlayer.pause();
  } catch (e) {
    // fallback
  }
}

export async function setAudioRate(rate: number) {
  try {
    await TrackPlayer.setRate(rate);
  } catch (e) {
    // fallback
  }
}

export async function resetAudio() {
  try {
    await TrackPlayer.reset();
  } catch (e) {
    // fallback
  }
}

