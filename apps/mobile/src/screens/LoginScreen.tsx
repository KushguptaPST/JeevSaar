import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Smartphone, KeyRound } from 'lucide-react-native';
import { Button } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState('9876543210'); // Pre-filled with dev seed phone for instant test
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      triggerHaptic('notificationError');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    triggerHaptic('impactLight');

    try {
      const res = await apiService.requestOtp(phone.trim());
      setStep('OTP');
      // In dev, pre-fill with dev OTP 123456 or prompt user
      if (res.devOtp) {
        setOtp(res.devOtp);
      }
      triggerHaptic('notificationSuccess');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
      triggerHaptic('notificationError');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP');
      triggerHaptic('notificationError');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    triggerHaptic('impactMedium');

    try {
      const res = await apiService.verifyOtp(phone.trim(), otp.trim(), language);
      setAuth(res.user, res.token);
      triggerHaptic('notificationSuccess');
      navigation.replace('MainTabs');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Incorrect OTP. Try 123456 in dev mode.');
      triggerHaptic('notificationError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            {step === 'PHONE' ? (
              <Smartphone size={32} color={COLORS.primary} strokeWidth={2.5} />
            ) : (
              <KeyRound size={32} color={COLORS.primary} strokeWidth={2.5} />
            )}
          </View>

          <Text style={styles.title}>
            {step === 'PHONE' ? t('auth.title') : t('auth.otpTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'PHONE'
              ? t('auth.subtitle')
              : t('auth.otpSubtitle', { phone })}
          </Text>

          {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

          {step === 'PHONE' ? (
            <View style={styles.inputContainer}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('auth.phonePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                accessible={true}
                accessibilityLabel="10-digit mobile number input"
              />
            </View>
          ) : (
            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                accessible={true}
                accessibilityLabel="6-digit verification code"
                autoFocus={true}
              />
            </View>
          )}

          <Button
            label={step === 'PHONE' ? t('auth.sendOtp') : t('auth.verifyOtp')}
            onPress={step === 'PHONE' ? handleRequestOtp : handleVerifyOtp}
            loading={loading}
            style={styles.actionBtn}
          />

          {step === 'OTP' && (
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive OTP? </Text>
              <Text
                style={styles.resendLink}
                onPress={handleRequestOtp}
                accessible={true}
                accessibilityRole="button"
              >
                {t('auth.resend')}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  content: {
    paddingVertical: SPACING.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  errorBanner: {
    backgroundColor: COLORS.urgentBg,
    color: COLORS.urgent,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: MIN_TOUCH_TARGET + 8,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  countryCodeBadge: {
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    marginRight: SPACING.md,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  otpInputContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: MIN_TOUCH_TARGET + 12,
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 10,
    color: COLORS.primaryDark,
    textAlign: 'center',
    width: '100%',
  },
  actionBtn: {
    marginTop: SPACING.sm,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

