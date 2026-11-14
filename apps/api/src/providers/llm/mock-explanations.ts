import { DoctorVisitLevel, Explanation, SupportedLanguage } from '@reportsaathi/shared';
import { EvaluatedTestValue } from '../../safety/engine';

export function generateCannedExplanation(
  language: SupportedLanguage,
  evaluatedTests: EvaluatedTestValue[],
  doctorLevel: DoctorVisitLevel,
  doctorReason: string
): Explanation {
  switch (language) {
    case 'hi':
      return {
        language: 'hi',
        overallSummary: 'आपकी रक्त जांच रिपोर्ट में हीमोग्लोबिन और प्लेटलेट्स सामान्य से थोड़े कम हैं, जबकि कोलेस्ट्रॉल और शुगर हल्का बढ़ा हुआ है। समय पर डॉक्टर से मिलकर संतुलित आहार और दिनचर्या पर चर्चा करें।',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'हीमोग्लोबिन (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'यह लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो पूरे शरीर में ऑक्सीजन पहुंचाने का काम करता है।',
            whatYourResultMeans: 'आपका स्तर 10.4 है जो सामान्य रेंज (12.0 - 15.5) से थोड़ा कम है। इससे शरीर में थकान या कमजोरी महसूस हो सकती है।',
            generalPrecautions: [
              'हरी पत्तेदार सब्जियां, चुकंदर, अनार और दालें भोजन में शामिल करें।',
              'पर्याप्त विश्राम करें और बिना डॉक्टर से पूछे कोई दवा न लें।',
            ],
          },
          {
            name: 'टोटल कोलेस्ट्रॉल',
            nameEnglish: 'Total Cholesterol',
            value: 238,
            unit: 'mg/dL',
            printedRange: '< 200',
            status: 'high',
            whatItMeasures: 'यह रक्त में वसा (फैट) की कुल मात्रा को मापता है।',
            whatYourResultMeans: 'आपका मान 238 है, जो वांछित स्तर (200 से कम) से ऊपर है। इसका अर्थ है कि रक्त में वसा का स्तर बढ़ा हुआ है।',
            generalPrecautions: [
              'तली-भुनी चीजें, मक्खन और अधिक तेल का उपयोग कम करें।',
              'प्रतिदिन 25-30 मिनट हल्का टहलें।',
            ],
          },
          {
            name: 'फास्टिंग ब्लड शुगर',
            nameEnglish: 'Fasting Blood Glucose',
            value: 112,
            unit: 'mg/dL',
            printedRange: '70 - 99',
            status: 'high',
            whatItMeasures: 'खाली पेट रक्त में शर्करा (ग्लूकोज) की मात्रा को दर्शाता है।',
            whatYourResultMeans: 'आपका परिणाम 112 है, जो सामान्य 70-99 से कुछ अधिक है। इसे प्री-डायबिटीज की श्रेणी में माना जाता है।',
            generalPrecautions: [
              'मीठे पेय, चीनी और मैदे से बनी चीजों से परहेज करें।',
              'समय पर भोजन करें और पानी खूब पिएं।',
            ],
          },
        ],
        questionsForDoctor: [
          'क्या मेरे हीमोग्लोबिन के लिए मुझे किसी विशेष जांच या आहार योजना की जरूरत है?',
          'कोलेस्ट्रॉल को सामान्य सीमा में लाने के लिए कौन से व्यायाम उपयुक्त रहेंगे?',
          'मुझे अपनी अगली शुगर और लिपिड जांच कितने दिनों बाद करानी चाहिए?',
        ],
        spokenScript: 'नमस्ते। आपकी लैब रिपोर्ट का संक्षिप्त विवरण इस प्रकार है। आपका हीमोग्लोबिन दस दशमलव चार ग्राम है, जो सामान्य रेंज बारह से पंद्रह के मुकाबले थोड़ा कम है। टोटल कोलेस्ट्रॉल दो सौ अड़तीस मिलीग्राम है, जो दो सौ से कम होना चाहिए। खाली पेट रक्त शुगर एक सौ बारह है जो सामान्य से थोड़ी अधिक है। किसी भी दवा की आवश्यकता है या नहीं, इसका निर्णय आपके डॉक्टर ही करेंगे। कृपया समय निकालकर डॉक्टर से परामर्श करें।',
        disclaimer: 'यह विवरण केवल सामान्य स्वास्थ्य जागरूकता और रिपोर्ट को सरल भाषा में समझने के लिए है। यह कोई चिकित्सीय निदान या उपचार सलाह नहीं है। किसी भी स्वास्थ्य समस्या में हमेशा अपने डॉक्टर से मिलें। आपात स्थिति में तुरंत 112 डायल करें।',
      };

    case 'kn':
      return {
        language: 'kn',
        overallSummary: 'ನಿಮ್ಮ ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿಯಲ್ಲಿ ಹಿಮೋಗ್ಲೋಬಿನ್ ಸ್ವಲ್ಪ ಕಡಿಮೆಯಾಗಿದೆ ಮತ್ತು ಕೊಲೆಸ್ಟ್ರಾಲ್ ಸಾಮಾನ್ಯ ಮಟ್ಟಕ್ಕಿಂತ ತುಸು ಹೆಚ್ಚಾಗಿದೆ. ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ ಸೂಕ್ತ ಸಲಹೆ ಪಡೆಯಿರಿ.',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'ಹಿಮೋಗ್ಲೋಬಿನ್ (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'ಇದು ದೇಹದ ಜೀವಕೋಶಗಳಿಗೆ ಆಮ್ಲಜನಕವನ್ನು ಸಾಗಿಸುವ ರಕ್ತದ ಪ್ರೋಟೀನ್ ಆಗಿದೆ.',
            whatYourResultMeans: 'ನಿಮ್ಮ ಫಲಿತಾಂಶ 10.4 ಆಗಿದ್ದು, ಸಾಮಾನ್ಯ ಪ್ರಮಾಣಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗಿದೆ. ಇದು ಲಘು ಆಯಾಸ ಉಂಟುಮಾಡಬಹುದು.',
            generalPrecautions: [
              'ಹಸಿರು ತರಕಾರಿಗಳು, ದಾಳಿಂಬೆ ಮತ್ತು ಸೊಪ್ಪುಗಳನ್ನು ಆಹಾರದಲ್ಲಿ ಸೇರಿಸಿ.',
              'ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
            ],
          },
          {
            name: 'ಒಟ್ಟು ಕೊಲೆಸ್ಟ್ರಾಲ್',
            nameEnglish: 'Total Cholesterol',
            value: 238,
            unit: 'mg/dL',
            printedRange: '< 200',
            status: 'high',
            whatItMeasures: 'ರಕ್ತದಲ್ಲಿರುವ ಕೊಬ್ಬಿನ ಒಟ್ಟು ಪ್ರಮಾಣವನ್ನು ಇದು ಸೂಚಿಸುತ್ತದೆ.',
            whatYourResultMeans: 'ನಿಮ್ಮ ಮಟ್ಟ 238 ಆಗಿದ್ದು, 200 ಕ್ಕಿಂತ ಕಡಿಮೆಯಿರಬೇಕಿತ್ತು. ಕೊಬ್ಬಿನ ಮಟ್ಟ ಹೆಚ್ಚಾಗಿದೆ.',
            generalPrecautions: [
              'ಎಣ್ಣೆಯುಕ್ತ ಆಹಾರ ಕಡಿಮೆ ಮಾಡಿ.',
              'ದಿನವೂ ನಿಯಮಿತ ನಡಿಗೆ ಅಭ್ಯಾಸ ಮಾಡಿ.',
            ],
          },
        ],
        questionsForDoctor: [
          'ನನ್ನ ಹಿಮೋಗ್ಲೋಬಿನ್ ಹೆಚ್ಚಿಸಲು ಯಾವ ಆಹಾರ ಕ್ರಮ ಪಾಲಿಸಬೇಕು?',
          'ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿಯಂತ್ರಣಕ್ಕೆ ಯಾವುದೇ ಹೆಚ್ಚಿನ ಪರೀಕ್ಷೆ ಅಗತ್ಯವಿದೆಯೇ?',
        ],
        spokenScript: 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ವರದಿಯಲ್ಲಿ ಹಿಮೋಗ್ಲೋಬಿನ್ ಹತ್ತು ಬಿಂದು ನಾಲ್ಕು ಇದೆ. ಇದು ಸಾಮಾನ್ಯ ಹನ್ನೆರಡಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗಿದೆ. ಕೊಲೆಸ್ಟ್ರಾಲ್ ಇನ್ನೂರ ಮೂವತ್ತೆಂಟು ಇದೆ. ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ ಸಲಹೆ ಪಡೆಯಿರಿ.',
        disclaimer: 'ಈ ಮಾಹಿತಿಯು ಸಾಮಾನ್ಯ ತಿಳುವಳಿಕೆಗಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯಲ್ಲ. ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ 112 ಗೆ ಕರೆ ಮಾಡಿ.',
      };

    case 'ta':
      return {
        language: 'ta',
        overallSummary: 'உங்கள் இரத்த பரிசோதனை அறிக்கையில் ஹீமோகுளோபின் சற்று குறைவாகவும், கொலஸ்ட்ரால் சற்று அதிகமாகவும் உள்ளது. மருத்துவரை சந்தித்து ஆலோசனை பெறவும்.',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'ஹீமோகுளோபின் (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'உடலில் ஆக்ஸிஜனை எடுத்துச் செல்லும் இரத்த சிவப்பணு புரதம் இது.',
            whatYourResultMeans: 'உங்கள் அளவு 10.4 ஆகும், இது இயல்பான அளவை விட சற்று குறைவு.',
            generalPrecautions: ['கீரை, பீட்ரூட், பேரீச்சம்பழம் சாப்பிடவும்.', 'நன்கு ஓய்வெடுக்கவும்.'],
          },
        ],
        questionsForDoctor: ['ஹீமோகுளோபின் அளவை சீராக்க என்ன செய்ய வேண்டும்?'],
        spokenScript: 'வணக்கம். உங்கள் அறிக்கையில் ஹீமோகுளோபின் பத்து புள்ளி நான்கு உள்ளது, இது இயல்பை விட குறைவு. கொலஸ்ட்ரால் சற்று அதிகரித்துள்ளது. மருத்துவரை அணுகவும்.',
        disclaimer: 'இது ஒரு பொதுவான வழிகாட்டல் மட்டுமே, மருத்துவ சிகிச்சை அல்ல. அவசரத்திற்கு 112 ஐ அழைக்கவும்.',
      };

    case 'bn':
      return {
        language: 'bn',
        overallSummary: 'আপনার রক্তের রিপোর্টে হিমোগ্লোবিন সামান্য কম এবং কোলেস্টেরল কিছুটা বেশি দেখা যাচ্ছে। ডাক্তারের সাথে পরামর্শ করে সঠিক খাদ্যতালিকা অনুসরণ করুন।',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'হিমোগ্লোবিন (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'এটি রক্তে অক্সিজেন বহনকারী একটি গুরুত্বপূর্ণ প্রোটিন।',
            whatYourResultMeans: 'আপনার মাত্রা ১০.৪, যা স্বাভাবিকের চেয়ে কিছুটা কম।',
            generalPrecautions: ['শাকসবজি এবং পুষ্টিকর খাবার গ্রহণ করুন।', 'পরিমিত বিশ্রাম নিন।'],
          },
        ],
        questionsForDoctor: ['হিমোগ্লোবিন বাড়াতে আমার কী ধরনের খাদ্যাভ্যাস দরকার?'],
        spokenScript: 'নমস্কার। আপনার রক্তের রিপোর্টে হিমোগ্লোবিনের মাত্রা দশ দশমিক চার, যা স্বাভাবিকের চেয়ে কম। অনুগ্রহ করে ডাক্তারের সাথে পরামর্শ করুন।',
        disclaimer: 'এই তথ্য শুধুমাত্র সাধারণ সচেতনতার জন্য। কোনো চিকিৎসা পরামর্শ নয়। জরুরি অবস্থায় ১১২ তে কল করুন।',
      };

    case 'or':
      return {
        language: 'or',
        overallSummary: 'ଆପଣଙ୍କ ରକ୍ତ ପରୀକ୍ଷା ରିପୋର୍ଟରେ ହିମୋଗ୍ଲୋବିନ ସାମାନ୍ୟ କମ ଏବଂ କୋଲେଷ୍ଟ୍ରଲ ଅଧିକ ଅଛି। ଡାକ୍ତରଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'ହିମୋଗ୍ଲୋବିନ (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'ଏହା ଶରୀରରେ ଅମ୍ଳଜାନ ପହଞ୍ଚାଉଥିବା ରକ୍ତ କଣିକା ପ୍ରୋଟିନ।',
            whatYourResultMeans: 'ଆପଣଙ୍କ ସ୍ତର ୧୦.୪ ଅଛି ଯାହା ସାଧାରଣ ଠାରୁ କମ।',
            generalPrecautions: ['ଶାଗ, ଡାଳିମ୍ବ ଏବଂ ପୁଷ୍ଟିକର ଖାଦ୍ୟ ଖାଆନ୍ତୁ।', 'ପର୍ଯ୍ୟାପ୍ତ ବିଶ୍ରାମ ନିଅନ୍ତୁ।'],
          },
        ],
        questionsForDoctor: ['ହିମୋଗ୍ଲୋବିନ ବୃଦ୍ଧି ପାଇଁ ମୋତେ କେଉଁ ଖାଦ୍ୟ ଖାଇବାକୁ ପଡିବ?'],
        spokenScript: 'ନମସ୍କାର। ଆପଣଙ୍କ ରିପୋର୍ଟରେ ହିମୋଗ୍ଲୋବିନ ଦଶ ଦଶମିକ ଚାରି ଅଛି, ଯାହା ସାଧାରଣ ଠାରୁ କମ। ଦୟାକରି ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
        disclaimer: 'ଏହା କେବଳ ସାଧାରଣ ସୂଚନା ପାଇଁ ଅଟେ। ଜରୁରୀ ପରିସ୍ଥିତିରେ ୧୧୨ କୁ କଲ କରନ୍ତୁ।',
      };

    case 'pa':
      return {
        language: 'pa',
        overallSummary: 'ਤੁਹਾਡੀ ਖੂਨ ਦੀ ਰਿਪੋਰਟ ਵਿੱਚ ਹੀਮੋਗਲੋਬਿਨ ਕੁਝ ਘੱਟ ਹੈ ਅਤੇ ਕੋਲੈਸਟ੍ਰੋਲ ਥੋੜ੍ਹਾ ਵਧਿਆ ਹੋਇਆ ਹੈ। ਆਪਣੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'ਹੀਮੋਗਲੋਬਿਨ (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'ਇਹ ਖੂਨ ਦਾ ਪ੍ਰੋਟੀਨ ਹੈ ਜੋ ਸਰੀਰ ਵਿੱਚ ਆਕਸੀਜਨ ਪਹੁੰਚਾਉਂਦਾ ਹੈ।',
            whatYourResultMeans: 'ਤੁਹਾਡਾ ਪੱਧਰ 10.4 ਹੈ ਜੋ ਆਮ ਨਾਲੋਂ ਘੱਟ ਹੈ।',
            generalPrecautions: ['ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਅਤੇ ਫਲ ਖਾਓ।', 'ਆਰਾਮ ਕਰੋ ਅਤੇ ਪਾਣੀ ਜ਼ਿਆਦਾ ਪੀਓ।'],
          },
        ],
        questionsForDoctor: ['ਹੀਮੋਗਲੋਬਿਨ ਨੂੰ ਠੀਕ ਕਰਨ ਲਈ ਕੀ ਖੁਰਾਕ ਲੈਣੀ ਚਾਹੀਦੀ ਹੈ?'],
        spokenScript: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਵਿੱਚ ਹੀਮੋਗਲੋਬਿਨ ਦਸ ਪੁਆਇੰਟ ਚਾਰ ਹੈ, ਜੋ ਆਮ ਨਾਲੋਂ ਘੱਟ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।',
        disclaimer: 'ਇਹ ਜਾਣਕਾਰੀ ਸਿਰਫ ਸਮਝਣ ਲਈ ਹੈ। ਕਿਸੇ ਐਮਰਜੈਂਸੀ ਵਿੱਚ 112 ਡਾਇਲ ਕਰੋ।',
      };

    case 'en':
    default:
      return {
        language: 'en',
        overallSummary: 'Your lab report shows slightly lower hemoglobin and mildly elevated total cholesterol and fasting glucose. Schedule a consultation with your physician to discuss balanced nutrition and routine follow-up.',
        doctorVisit: {
          level: doctorLevel,
          reason: doctorReason,
        },
        tests: [
          {
            name: 'Hemoglobin (Hb)',
            nameEnglish: 'Hemoglobin (Hb)',
            value: 10.4,
            unit: 'g/dL',
            printedRange: '12.0 - 15.5',
            status: 'low',
            whatItMeasures: 'Hemoglobin is the oxygen-carrying protein inside red blood cells.',
            whatYourResultMeans: 'Your value is 10.4 g/dL, which is below the printed standard reference range (12.0 - 15.5). This can generally cause mild tiredness or low stamina.',
            generalPrecautions: [
              'Include iron-rich foods such as spinach, beetroot, lentils, and pomegranate.',
              'Ensure adequate sleep and hydration.',
            ],
          },
          {
            name: 'Total Cholesterol',
            nameEnglish: 'Total Cholesterol',
            value: 238,
            unit: 'mg/dL',
            printedRange: '< 200',
            status: 'high',
            whatItMeasures: 'Measures total amount of fats/lipids circulating in the blood.',
            whatYourResultMeans: 'Your result of 238 mg/dL is higher than the desirable threshold of under 200 mg/dL.',
            generalPrecautions: [
              'Limit deep-fried items, saturated fats, and processed snacks.',
              'Aim for 20-30 minutes of brisk daily walking.',
            ],
          },
          {
            name: 'Fasting Blood Glucose',
            nameEnglish: 'Fasting Blood Glucose',
            value: 112,
            unit: 'mg/dL',
            printedRange: '70 - 99',
            status: 'high',
            whatItMeasures: 'Reflects blood sugar levels after an overnight fast.',
            whatYourResultMeans: 'Your level of 112 mg/dL is above the normal fasting ceiling of 99 mg/dL.',
            generalPrecautions: [
              'Cut down on sweetened beverages, refined flours, and direct sugar.',
              'Maintain consistent meal timings.',
            ],
          },
        ],
        questionsForDoctor: [
          'What dietary plan or repeat test do you recommend for my hemoglobin level?',
          'How can I safely bring my cholesterol levels back to normal range?',
          'When should I repeat my fasting blood sugar test?',
        ],
        spokenScript: 'Hello. Here is a simple explanation of your blood test results. Your hemoglobin is ten point four grams per deciliter, which is slightly below the standard range of twelve to fifteen point five. Your total cholesterol is two hundred and thirty-eight milligrams per deciliter, which is above the desirable level of two hundred. Your fasting blood sugar is one hundred and twelve, which is slightly higher than normal. Please consult your doctor to discuss these results and any necessary lifestyle steps.',
        disclaimer: 'This explanation is for educational awareness only and does not constitute medical diagnosis or treatment advice. Always consult a qualified physician. In case of emergency symptoms such as chest pain or breathing difficulty, call 112 immediately.',
      };
  }
}
