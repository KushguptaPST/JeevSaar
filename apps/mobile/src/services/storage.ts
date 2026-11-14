import { createMMKV, MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

let mmkvInstance: MMKV | null = null;
try {
  mmkvInstance = createMMKV();
} catch (e) {
  // Fallback for tests or unlinked environments
}

const memoryStore = new Map<string, string>();

export const appStorage = {
  getString(key: string): string | undefined {
    if (mmkvInstance) {
      return mmkvInstance.getString(key);
    }
    return memoryStore.get(key);
  },

  set(key: string, value: string): void {
    if (mmkvInstance) {
      mmkvInstance.set(key, value);
    } else {
      memoryStore.set(key, value);
    }
  },

  getBoolean(key: string): boolean {
    if (mmkvInstance) {
      return mmkvInstance.getBoolean(key) ?? false;
    }
    return memoryStore.get(key) === 'true';
  },

  setBoolean(key: string, value: boolean): void {
    if (mmkvInstance) {
      mmkvInstance.set(key, value);
    } else {
      memoryStore.set(key, String(value));
    }
  },

  delete(key: string): void {
    if (mmkvInstance) {
      mmkvInstance.remove(key);
    } else {
      memoryStore.delete(key);
    }
  },

  clearAll(): void {
    if (mmkvInstance) {
      mmkvInstance.clearAll();
    } else {
      memoryStore.clear();
    }
  },
};

// Secure Auth Token via Keychain
export const secureStorage = {
  async saveToken(token: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword('auth_token', token, {
        service: 'com.reportsaathi.auth',
      });
      return true;
    } catch (e) {
      appStorage.set('fallback_auth_token', token);
      return true;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'com.reportsaathi.auth',
      });
      if (credentials) {
        return credentials.password;
      }
      return appStorage.getString('fallback_auth_token') || null;
    } catch (e) {
      return appStorage.getString('fallback_auth_token') || null;
    }
  },

  async clearToken(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: 'com.reportsaathi.auth',
      });
    } catch (e) {
      // ignore
    }
    appStorage.delete('fallback_auth_token');
  },
};

