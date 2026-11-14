import 'react-native-gesture-handler/jestSetup';

// Mock Lucide icons for fast, error-free testing
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_, iconName) => {
        const MockIcon = (props) => <View testID={`icon-${iconName}`} {...props} />;
        MockIcon.displayName = String(iconName);
        return MockIcon;
      },
    }
  );
});

// Mock TrackPlayer
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn().mockResolvedValue(true),
  setRepeatMode: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue(true),
  play: jest.fn().mockResolvedValue(true),
  pause: jest.fn().mockResolvedValue(true),
  reset: jest.fn().mockResolvedValue(true),
  setRate: jest.fn().mockResolvedValue(true),
  skipToNext: jest.fn().mockResolvedValue(true),
  skipToPrevious: jest.fn().mockResolvedValue(true),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  registerPlaybackService: jest.fn(),
  Capability: { Play: 1, Pause: 2, SkipToNext: 3, SkipToPrevious: 4, SeekTo: 5 },
  Event: { RemotePlay: 'playback-play', RemotePause: 'playback-pause' },
  State: { Playing: 'playing', Paused: 'paused', Idle: 'idle' },
  AppKilledPlaybackBehavior: { StopPlaybackAndRemoveNotification: 'stop' },
  RepeatMode: { Off: 'off' },
}));

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  createChannel: jest.fn().mockResolvedValue('channel_id'),
  createTriggerNotification: jest.fn().mockResolvedValue('notif_id'),
  displayNotification: jest.fn().mockResolvedValue('notif_id'),
  AuthorizationStatus: { AUTHORIZED: 1 },
  AndroidImportance: { HIGH: 4 },
  TriggerType: { TIMESTAMP: 0 },
}));

// Mock Haptic Feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: jest.fn().mockReturnValue({
      getString: jest.fn((k) => store.get(k)),
      set: jest.fn((k, v) => store.set(k, String(v))),
      getBoolean: jest.fn((k) => store.get(k) === 'true'),
      setBoolean: jest.fn((k, v) => store.set(k, String(v))),
      remove: jest.fn((k) => store.delete(k)),
      clearAll: jest.fn(() => store.clear()),
    }),
  };
});

// Mock Keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue({ password: 'mock-jwt-token' }),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

// Mock Image Picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock Document Picker
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
}));
