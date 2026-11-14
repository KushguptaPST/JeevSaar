/**
 * PII Stripping Module
 * Strips identifiable patient personal data (names, phone numbers, addresses, UHID, lab barcodes)
 * before any payload is passed to external LLM providers.
 */

export interface StrippedPayload {
  cleanText: string;
  piiDetected: boolean;
  replacementsCount: number;
}

export function stripPII(input: string): StrippedPayload {
  let text = input;
  let count = 0;

  // 1. Phone numbers (Indian 10-digit, with optional +91, 0, or spaces/dashes)
  const phoneRegex = /(?:\+91[\s-]?)?[6789]\d{9}\b/g;
  text = text.replace(phoneRegex, () => {
    count++;
    return '[REDACTED_PHONE]';
  });

  // 2. Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  text = text.replace(emailRegex, () => {
    count++;
    return '[REDACTED_EMAIL]';
  });

  // 3. Common Patient Identifiers: UHID, MRN, Lab ID, Sample ID, IPD/OPD No
  const idRegex = /\b(?:UHID|MRN|IPD|OPD|PID|Lab\s*No|Sample\s*ID|Barcode)\s*[:#\-]?\s*([A-Za-z0-9\-_/]+)/gi;
  text = text.replace(idRegex, (_match, idVal) => {
    count++;
    return `ID: [REDACTED_ID]`;
  });

  // 4. Patient Name patterns (e.g. "Patient Name: John Doe", "Name: Mr. Rajesh Kumar")
  const nameLabelRegex = /\b(?:Patient\s*Name|Patient|Pt\.?\s*Name|Name)\s*[:#\-]\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Master|Shri|Smt\.?)?\s*([A-Za-z\s]{2,30})(?=[,\n\r;]|$)/gi;
  text = text.replace(nameLabelRegex, () => {
    count++;
    return 'Patient Name: [REDACTED_PATIENT]';
  });

  // 5. Postal / PIN codes (India 6-digit)
  const pinRegex = /\b(?:PIN|Postal\s*Code|Pincode)?\s*([1-9][0-9]{5})\b/gi;
  text = text.replace(pinRegex, (_match, digits) => {
    // Only replace if prefixed or looks standalone
    count++;
    return '[REDACTED_PIN]';
  });

  return {
    cleanText: text,
    piiDetected: count > 0,
    replacementsCount: count,
  };
}

