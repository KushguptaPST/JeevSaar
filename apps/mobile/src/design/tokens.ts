import { Platform } from 'react-native';

export type TextSizeOption = 'normal' | 'large' | 'extra-large';

export type SupportedFontScript = 'en' | 'hi' | 'kn' | 'ta' | 'bn' | 'or' | 'pa';

export const FONT_FAMILIES: Record<SupportedFontScript, string> = {
  en: 'NotoSans-Regular',
  hi: 'NotoSansDevanagari-Regular',
  kn: 'NotoSansKannada-Regular',
  ta: 'NotoSansTamil-Regular',
  bn: 'NotoSansBengali-Regular',
  or: 'NotoSansOriya-Regular',
  pa: 'NotoSansGurmukhi-Regular',
};

export function getFontFamilyForScript(lang: string = 'en'): string {
  const code = (lang.split('-')[0] || 'en') as SupportedFontScript;
  return FONT_FAMILIES[code] || FONT_FAMILIES.en;
}

export const COLORS = {
  // Brand & Primary
  primary: '#0F766E',       // Deep teal (WCAG AAA compliant on white)
  primaryDark: '#115E59',   // Darker teal for active/pressed
  primaryLight: '#E6F4F1',  // Mint tint for subtle highlights
  primaryBorder: '#99F6E4',

  // Backgrounds & Neutrals
  background: '#F7FAF9',    // Off-white, calm & elder-friendly
  surface: '#FFFFFF',       // Pure white cards
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Text
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',     // Slate 400
  textInverse: '#FFFFFF',

  // Clinical Status Colors (Always paired with icons and text!)
  normal: '#16A34A',        // Green
  normalBg: '#DCFCE7',
  normalBorder: '#86EFAC',

  lowHigh: '#D97706',       // Amber / Orange
  lowHighBg: '#FEF3C7',
  lowHighBorder: '#FCD34D',

  urgent: '#DC2626',        // Red
  urgentBg: '#FEE2E2',
  urgentBorder: '#FCA5A5',

  unknown: '#64748B',
  unknownBg: '#F1F5F9',
  unknownBorder: '#CBD5E1',

  // Audio Player
  playerBg: '#0F766E',
  playerProgress: '#2DD4BF',
  playerTrack: 'rgba(255, 255, 255, 0.3)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  card: 18,
  pill: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHigh: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

/**
 * Returns scaled font sizes based on user's text size preference.
 * Supports Normal, Large, and Extra Large.
 */
export function getTypography(textSize: TextSizeOption = 'normal') {
  let scale = 1.0;
  if (textSize === 'large') scale = 1.15;
  if (textSize === 'extra-large') scale = 1.3;

  return {
    h1: {
      fontSize: Math.round(26 * scale),
      lineHeight: Math.round(34 * scale),
      fontWeight: '700' as const,
      color: COLORS.textPrimary,
    },
    h2: {
      fontSize: Math.round(22 * scale),
      lineHeight: Math.round(28 * scale),
      fontWeight: '700' as const,
      color: COLORS.textPrimary,
    },
    h3: {
      fontSize: Math.round(18 * scale),
      lineHeight: Math.round(24 * scale),
      fontWeight: '600' as const,
      color: COLORS.textPrimary,
    },
    bodyLarge: {
      fontSize: Math.round(17 * scale),
      lineHeight: Math.round(26 * scale),
      fontWeight: '400' as const,
      color: COLORS.textPrimary,
    },
    body: {
      fontSize: Math.round(16 * scale),
      lineHeight: Math.round(24 * scale),
      fontWeight: '400' as const,
      color: COLORS.textPrimary,
    },
    caption: {
      fontSize: Math.round(14 * scale),
      lineHeight: Math.round(20 * scale),
      fontWeight: '400' as const,
      color: COLORS.textSecondary,
    },
    small: {
      fontSize: Math.round(12 * scale),
      lineHeight: Math.round(16 * scale),
      fontWeight: '500' as const,
      color: COLORS.textMuted,
    },
    button: {
      fontSize: Math.round(16 * scale),
      lineHeight: Math.round(22 * scale),
      fontWeight: '600' as const,
    },
  };
}

export const MIN_TOUCH_TARGET = 48; // 48dp minimum for elder & a11y compliance

