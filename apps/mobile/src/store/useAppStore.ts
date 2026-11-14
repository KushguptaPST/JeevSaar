import { create } from 'zustand';
import { SupportedLanguage } from '@reportsaathi/shared';
import i18n from '../i18n';
import { appStorage } from '../services/storage';
import { TextSizeOption } from '../design/tokens';

interface AppState {
  language: SupportedLanguage;
  textSize: TextSizeOption;
  hasConsented: boolean;
  isFirstLaunch: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  setTextSize: (size: TextSizeOption) => void;
  setConsented: (consented: boolean) => void;
  completeFirstLaunch: () => void;
}

const savedLang = (appStorage.getString('app_language') as SupportedLanguage) || 'hi';
const savedTextSize = (appStorage.getString('app_text_size') as TextSizeOption) || 'normal';
const savedConsent = appStorage.getBoolean('app_consented');
const savedFirstLaunch = appStorage.getString('has_completed_onboarding') !== 'true';

export const useAppStore = create<AppState>((set) => ({
  language: savedLang,
  textSize: savedTextSize,
  hasConsented: savedConsent,
  isFirstLaunch: savedFirstLaunch,

  setLanguage: (lang: SupportedLanguage) => {
    appStorage.set('app_language', lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },

  setTextSize: (size: TextSizeOption) => {
    appStorage.set('app_text_size', size);
    set({ textSize: size });
  },

  setConsented: (consented: boolean) => {
    appStorage.setBoolean('app_consented', consented);
    set({ hasConsented: consented });
  },

  completeFirstLaunch: () => {
    appStorage.set('has_completed_onboarding', 'true');
    set({ isFirstLaunch: false });
  },
}));

