import { Platform } from 'react-native';
import { APP_CONFIG, CONFIGURED_HOSPITAL } from '@reportsaathi/shared';

// Android emulator connects to the host machine at 10.0.2.2.
// Real device connects via LAN IP (e.g. http://192.168.1.x:4000).
// Cleartext HTTP is explicitly permitted in debug builds in AndroidManifest.xml.
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const MOBILE_CONFIG = {
  appName: APP_CONFIG.appName,
  workingTitle: APP_CONFIG.workingTitle,
  apiBaseUrl: DEFAULT_HOST,
  hospital: CONFIGURED_HOSPITAL,
  retentionDays: APP_CONFIG.retentionDays,
  emergencyNumber: APP_CONFIG.emergencyNumber,
};

