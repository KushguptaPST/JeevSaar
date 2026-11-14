import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function triggerHaptic(type: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationError' = 'impactLight') {
  try {
    ReactNativeHapticFeedback.trigger(type, options);
  } catch (e) {
    // Graceful fallback for simulator / unlinked environments
  }
}

