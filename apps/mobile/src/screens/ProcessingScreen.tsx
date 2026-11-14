import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileSearch, Sparkles, Volume2, AlertCircle } from 'lucide-react-native';
import { Button } from '../design/components';
import { COLORS, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';
import { useAudioStore } from '../store/useAudioStore';

export const ProcessingScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { setQueue } = useAudioStore();
  const file = route?.params?.file;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async () => {
    setError(null);
    setStep(1);

    try {
      // 1. Upload & Extract
      let reportId: string;
      if (file?.uri) {
        const uploadRes = await apiService.uploadReport(file);
        reportId = uploadRes.id;
      } else {
        // Fallback / dev mock ID
        const reportsRes = await apiService.getReports();
        reportId = reportsRes.reports[0]?.id || 'mock-report-id';
      }

      setStep(2);
      triggerHaptic('impactLight');

      // 2. Explain in user's chosen language
      const explanation = await apiService.explainReport(reportId, language);

      setStep(3);
      triggerHaptic('impactLight');

      // 3. Pre-synthesize spoken TTS audio chunks
      try {
        const ttsRes = await apiService.synthesizeTTS(explanation.spokenScript, language);
        if (ttsRes.audioUrls && ttsRes.audioUrls.length > 0) {
          await setQueue(ttsRes.audioUrls, 'Report Summary');
        }
      } catch (audioErr) {
        console.warn('TTS auto-synthesis notice:', audioErr);
      }

      triggerHaptic('notificationSuccess');
      // Navigate to Result screen
      navigation.replace('Result', { reportId, initialExplanation: explanation });
    } catch (err: any) {
      triggerHaptic('notificationError');
      setError(err?.response?.data?.message || err?.message || 'Processing failed. Please check your connection.');
    }
  };

  useEffect(() => {
    runPipeline();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconCircle}>
              <AlertCircle size={44} color={COLORS.urgent} />
            </View>
            <Text style={styles.errorTitle}>{t('processing.failed')}</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <Button
              label={t('common.retry')}
              onPress={runPipeline}
              variant="primary"
              style={{ width: '100%', marginTop: SPACING.lg }}
            />
            <Button
              label={t('common.back')}
              onPress={() => navigation.goBack()}
              variant="outline"
              style={{ width: '100%', marginTop: SPACING.sm }}
            />
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <View style={styles.iconBox}>
              {step === 1 && <FileSearch size={48} color={COLORS.primary} />}
              {step === 2 && <Sparkles size={48} color={COLORS.primary} />}
              {step === 3 && <Volume2 size={48} color={COLORS.primary} />}
            </View>

            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />

            <Text style={styles.stepTitle}>
              {step === 1 && t('processing.reading')}
              {step === 2 && t('processing.preparing')}
              {step === 3 && 'Creating your spoken audio...'}
            </Text>

            <Text style={styles.stepDesc}>
              {step === 1 && t('processing.readingDesc')}
              {step === 2 && t('processing.preparingDesc')}
              {step === 3 && 'Splitting speech into natural sentences for clear listening'}
            </Text>

            {/* Stepper Progress Bar */}
            <View style={styles.stepperContainer}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
            </View>
          </View>
        )}
      </View>
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
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.border,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.urgentBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.urgent,
    marginBottom: SPACING.xs,
  },
  errorDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

