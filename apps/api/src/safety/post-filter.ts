import { medicineDenylist, Explanation, SupportedLanguage } from '@reportsaathi/shared';

export interface FilterViolation {
  type: 'DOSAGE_PATTERN' | 'DENYLIST_MEDICINE' | 'DISALLOWED_CLAIM';
  match: string;
  field: string;
}

export interface PostFilterResult {
  isValid: boolean;
  violations: FilterViolation[];
}

export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  'trouble breathing',
  'shortness of breath',
  'fainting',
  'unconscious',
  'heavy bleeding',
  'severe bleeding',
  'stroke symptoms',
  'seizure',
  'छाती में दर्द',
  'सांस लेने में तकलीफ',
  'बेहोशी',
  'अधिक रक्तस्राव',
];

export function hasEmergencyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export const EMERGENCY_112_ADVICE: Record<SupportedLanguage, string> = {
  hi: 'आपातकालीन चेतावनी: यदि आपको छाती में तेज दर्द, सांस लेने में गंभीर तकलीफ, बेहोशी या भारी रक्तस्राव हो रहा है, तो तुरंत 112 डायल करें या नजदीकी आपातकालीन कक्ष (Emergency) में जाएं।',
  kn: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಎದೆನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ತೀವ್ರ ರಕ್ತಸ್ರಾವವಿದ್ದರೆ, ತಕ್ಷಣ 112 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.',
  ta: 'அவசர எச்சரிக்கை: நெஞ்சு வலி, மூச்சுத் திணறல் அல்லது மயக்கம் ஏற்பட்டால், உடனடியாக 112 ஐ அழைக்கவும் அல்லது மருத்துவமனைக்குச் செல்லவும்.',
  bn: 'জরুরি সতর্কতা: যদি বুকে ব্যথা, শ্বাসকষ্ট বা অচেতন হওয়ার লক্ষণ থাকে, তবে অবিলম্বে ১১২ ডায়াল করুন বা নিকটস্থ হাসপাতালে যান।',
  or: 'ଜରୁରୀ ସୂଚନା: ଯଦି ଛାତିରେ ଯନ୍ତ୍ରଣା, ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ କିମ୍ବା ମୂର୍ଚ୍ଛା ଅନୁଭବ ହୁଏ, ତୁରନ୍ତ ୧୧୨ କୁ କଲ କରନ୍ତୁ କିମ୍ବା ଡାକ୍ତରଖାନାକୁ ଯାଆନ୍ତୁ।',
  pa: 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਜੇਕਰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ, ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ ਜਾਂ ਬੇਹੋਸ਼ੀ ਹੈ, ਤਾਂ ਤੁਰੰਤ 112 ਡਾਇਲ ਕਰੋ ਜਾਂ ਨੇੜਲੇ ਹਸਪਤਾਲ ਜਾਓ।',
  en: 'EMERGENCY NOTICE: If you experience chest pain, difficulty breathing, fainting, or heavy bleeding, call 112 or go to the nearest emergency room immediately.',
};

export const SAFE_FALLBACK_TEXT: Record<SupportedLanguage, { summary: string; precaution: string }> = {
  hi: {
    summary: 'आपकी रिपोर्ट में दिए गए परिणाम को केवल एक योग्य डॉक्टर ही पूरी तरह देखकर सही सलाह दे सकते हैं। किसी भी घरेलू दवा या उपाय से पहले डॉक्टर से मिलें।',
    precaution: 'पर्याप्त पानी पिएं, हल्का भोजन लें और जल्द से जल्द अपने डॉक्टर से परामर्श करें।',
  },
  kn: {
    summary: 'ನಿಮ್ಮ ವರದಿಯನ್ನು ವೈದ್ಯರು ಸಂಪೂರ್ಣವಾಗಿ ಪರಿಶೀಲಿಸುವುದು ಅಗತ್ಯ. ಯಾವುದೇ ಸ್ವಯಂ ಔಷಧೋಪಚಾರ ಮಾಡಬೇಡಿ.',
    precaution: 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ, ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
  },
  ta: {
    summary: 'உங்கள் பரிசோதனை முடிவுகளை ஒரு தகுதிவாய்ந்த மருத்துவரிடம் காட்டி ஆலோசனை பெறுவதே பாதுகாப்பானது.',
    precaution: 'போதுமான தண்ணீர் குடிக்கவும், ஓய்வெடுக்கவும், மருத்துவரை அணுகவும்.',
  },
  bn: {
    summary: 'আপনার রিপোর্টটি একজন যোগ্যতাসম্পন্ন চিকিৎসকের সাথে আলোচনা করে পরামর্শ নেওয়া জরুরি।',
    precaution: 'পর্যাপ্ত জল পান করুন, বিশ্রাম নিন এবং চিকিৎসকের পরামর্শ নিন।',
  },
  or: {
    summary: 'ଆପଣଙ୍କ ରିପୋର୍ଟ ସମ୍ପର୍କରେ ଡାକ୍ତରଙ୍କ ସହ ପରାମର୍ଶ କରିବା ସର୍ବୋତ୍ତମ ଅଟେ। ନିଜେ କୌଣସି ଔଷଧ ନିଅନ୍ତୁ ନାହିଁ।',
    precaution: 'ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ, ବିଶ୍ରାମ ନିଅନ୍ତୁ ଏବଂ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।',
  },
  pa: {
    summary: 'ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਦੀ ਸਹੀ ਜਾਂਚ ਸਿਰਫ ਇੱਕ ਡਾਕਟਰ ਹੀ ਕਰ ਸਕਦਾ ਹੈ। ਕੋਈ ਵੀ ਦਵਾਈ ਆਪਣੇ ਆਪ ਨਾ ਲਵੋ।',
    precaution: 'ਪਾਣੀ ਵੱਧ ਪੀਓ, ਆਰਾਮ ਕਰੋ ਅਤੇ ਆਪਣੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
  },
  en: {
    summary: 'This test requires clinical correlation. Only a qualified physician can interpret these values in the context of your overall health and history.',
    precaution: 'Stay well-hydrated, rest adequately, and schedule an appointment with a registered medical practitioner.',
  },
};

const DOSAGE_REGEX = /\b\d+\.?\d*\s*(mg|ml|mcg|gm|tablet|tablets|capsule|capsules|injection|syrup|drop|drops)\b/i;

export function inspectTextForSafetyViolations(text: string, fieldName: string): FilterViolation[] {
  const violations: FilterViolation[] = [];
  const lower = text.toLowerCase();

  // 1. Check dosage pattern
  const dosageMatch = text.match(DOSAGE_REGEX);
  if (dosageMatch) {
    violations.push({
      type: 'DOSAGE_PATTERN',
      match: dosageMatch[0],
      field: fieldName,
    });
  }

  // 2. Check disallowed words ("cure", "guaranteed")
  for (const word of medicineDenylist.disallowedWords) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
      violations.push({
        type: 'DISALLOWED_CLAIM',
        match: word,
        field: fieldName,
      });
    }
  }

  // 3. Check medicine denylist
  for (const med of medicineDenylist.disallowedMedicines) {
    if (new RegExp(`\\b${med}\\b`, 'i').test(lower)) {
      violations.push({
        type: 'DENYLIST_MEDICINE',
        match: med,
        field: fieldName,
      });
    }
  }

  return violations;
}

export function validateExplanationOutput(explanation: Explanation): PostFilterResult {
  const violations: FilterViolation[] = [];

  violations.push(...inspectTextForSafetyViolations(explanation.overallSummary, 'overallSummary'));
  violations.push(...inspectTextForSafetyViolations(explanation.doctorVisit.reason, 'doctorVisit.reason'));
  violations.push(...inspectTextForSafetyViolations(explanation.spokenScript, 'spokenScript'));

  for (let i = 0; i < explanation.tests.length; i++) {
    const test = explanation.tests[i];
    violations.push(...inspectTextForSafetyViolations(test.whatYourResultMeans, `tests[${i}].whatYourResultMeans`));
    for (let j = 0; j < test.generalPrecautions.length; j++) {
      violations.push(
        ...inspectTextForSafetyViolations(test.generalPrecautions[j], `tests[${i}].generalPrecautions[${j}]`)
      );
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

export function applySafeFallback(explanation: Explanation, language: SupportedLanguage): Explanation {
  const fallback = SAFE_FALLBACK_TEXT[language] || SAFE_FALLBACK_TEXT.en;

  const sanitized = { ...explanation };
  sanitized.overallSummary = `${explanation.overallSummary} ${fallback.summary}`.slice(0, 480);

  sanitized.tests = sanitized.tests.map((test) => {
    const cleanTest = { ...test };
    const violations = inspectTextForSafetyViolations(cleanTest.whatYourResultMeans, 'whatYourResultMeans');
    if (violations.length > 0) {
      cleanTest.whatYourResultMeans = fallback.summary;
    }
    cleanTest.generalPrecautions = [fallback.precaution];
    return cleanTest;
  });

  return sanitized;
}

