import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SupportedLanguage } from '@reportsaathi/shared';

import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ta from './locales/ta.json';
import bn from './locales/bn.json';
import or from './locales/or.json';
import pa from './locales/pa.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  ta: { translation: ta },
  bn: { translation: bn },
  or: { translation: or },
  pa: { translation: pa },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'hi', // Default to Hindi per prompt
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
} as any);

export function changeLanguage(lang: SupportedLanguage) {
  return i18n.changeLanguage(lang);
}

export default i18n;

