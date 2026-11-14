export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'bn' | 'or' | 'pa';

export interface LanguageInfo {
  code: SupportedLanguage;
  nameEnglish: string;
  nativeName: string;
  scriptName: string;
  sarvamCode: string; // e.g. hi-IN, kn-IN, od-IN
  defaultSpeaker: string;
  sampleGreeting: string; // Used for preview / audio test
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  hi: {
    code: 'hi',
    nameEnglish: 'Hindi',
    nativeName: 'हिन्दी',
    scriptName: 'Devanagari',
    sarvamCode: 'hi-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'नमस्ते! मैं रिपोर्ट साथी हूँ, आपकी रिपोर्ट समझाने के लिए।',
  },
  kn: {
    code: 'kn',
    nameEnglish: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    scriptName: 'Kannada',
    sarvamCode: 'kn-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ವರದಿಯನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.',
  },
  ta: {
    code: 'ta',
    nameEnglish: 'Tamil',
    nativeName: 'தமிழ்',
    scriptName: 'Tamil',
    sarvamCode: 'ta-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'வணக்கம்! உங்கள் மருத்துவ அறிக்கையை எளிமையாக விளக்க நான் உதவுகிறேன்.',
  },
  bn: {
    code: 'bn',
    nameEnglish: 'Bengali',
    nativeName: 'বাংলা',
    scriptName: 'Bengali',
    sarvamCode: 'bn-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'নমস্কার! আপনার মেডিকেল রিপোর্টটি সহজ ভাষায় বোঝানোর জন্য আমি আছি।',
  },
  or: {
    code: 'or',
    nameEnglish: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    scriptName: 'Oriya',
    sarvamCode: 'od-IN', // Sarvam uses od-IN for Odia (alias or-IN also handled)
    defaultSpeaker: 'ananya',
    sampleGreeting: 'ନମସ୍କାର! ଆପଣଙ୍କ ମେଡିକାଲ ରିପୋର୍ଟ ସରଳ ଭାଷାରେ ବୁଝାଇବା ପାଇଁ ମୁଁ ପ୍ରସ୍ତୁତ।',
  },
  pa: {
    code: 'pa',
    nameEnglish: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    scriptName: 'Gurmukhi',
    sarvamCode: 'pa-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡੀ ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਨੂੰ ਸਰਲ ਤਰੀਕੇ ਨਾਲ ਸਮਝਾਉਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ।',
  },
  en: {
    code: 'en',
    nameEnglish: 'English',
    nativeName: 'English',
    scriptName: 'Latin',
    sarvamCode: 'en-IN',
    defaultSpeaker: 'ananya',
    sampleGreeting: 'Hello! I am ReportSaathi, here to explain your lab report in simple terms.',
  },
};

export const LANGUAGE_LIST = Object.values(SUPPORTED_LANGUAGES);

export function getLanguageInfo(code: string): LanguageInfo {
  if (code in SUPPORTED_LANGUAGES) {
    return SUPPORTED_LANGUAGES[code as SupportedLanguage];
  }
  return SUPPORTED_LANGUAGES.en;
}
