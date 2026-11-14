import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  Calendar,
  AlertOctagon,
  ChevronRight,
  FileText,
  Share2,
} from 'lucide-react-native';
import { Explanation, TestExplanationItem } from '@reportsaathi/shared';
import {
  AudioPlayerBar,
  Button,
  Card,
  DoctorVisitBanner,
  TestCard,
} from '../design/components';
import { COLORS, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';
import { useAudioStore } from '../store/useAudioStore';

export const ResultScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const {
    isPlaying,
    speed,
    progressPercent,
    togglePlayPause,
    changeSpeed,
    setQueue,
    playSnippet,
    activeSnippetTestName,
  } = useAudioStore();

  const reportId = route?.params?.reportId;
  const initialExplanation = route?.params?.initialExplanation;

  const [explanation, setExplanation] = useState<Explanation | null>(
    initialExplanation || null
  );
  const [loading, setLoading] = useState(!initialExplanation);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    if (!initialExplanation && reportId) {
      loadExplanation();
    }
  }, [reportId]);

  const loadExplanation = async () => {
    setLoading(true);
    try {
      const data = await apiService.explainReport(reportId, language);
      setExplanation(data);

      // Preload audio queue
      try {
        const tts = await apiService.synthesizeTTS(data.spokenScript, language);
        if (tts.audioUrls) {
          await setQueue(tts.audioUrls, 'Report Summary');
        }
      } catch (e) {
        // non-fatal
      }
    } catch (err) {
      console.warn('Failed to fetch explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Show sticky player when scrolled past the top hero player
    if (offsetY > 320 && !isScrolledDown) {
      setIsScrolledDown(true);
    } else if (offsetY <= 320 && isScrolledDown) {
      setIsScrolledDown(false);
    }
  };

  const handlePlayIndividualSnippet = async (test: TestExplanationItem) => {
    triggerHaptic('impactLight');
    const snippetText = `${test.name}. Your result is ${test.value} ${test.unit}. ${test.whatYourResultMeans}`;
    try {
      const res = await apiService.synthesizeTTS(snippetText, language);
      if (res.audioUrls && res.audioUrls[0]) {
        await playSnippet(res.audioUrls[0], test.name);
      }
    } catch (e) {
      console.warn('Individual snippet TTS error:', e);
    }
  };

  const handleBookAppointment = () => {
    triggerHaptic('impactMedium');
    navigation.navigate('BookAppointment', { linkedReportId: reportId });
  };

  const handleShareQuestions = async () => {
    if (!explanation?.questionsForDoctor || explanation.questionsForDoctor.length === 0) return;
    triggerHaptic('impactLight');
    const header = 'Questions for my Doctor (ReportSaathi):\n\n';
    const formatted = explanation.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
    try {
      await Share.share({
        title: 'Questions for Doctor',
        message: `${header}${formatted}\n\nGenerated with ReportSaathi`,
      });
    } catch (e) {
      console.warn('Share questions error:', e);
    }
  };

  if (loading || !explanation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your explanation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Doctor Visit Banner (routine / soon / urgent) */}
          <DoctorVisitBanner
            level={explanation.doctorVisit.level}
            reason={explanation.doctorVisit.reason}
          />

          {/* 2. Overall Summary Card (<= 60 words) */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <FileText size={18} color={COLORS.primary} />
              <Text style={styles.summaryTitle}>{t('result.summaryHeading')}</Text>
            </View>
            <Text style={styles.summaryBody}>{explanation.overallSummary}</Text>
          </Card>

          {/* 3. Primary Audio Player Bar (large Listen button, scrubber, speeds) */}
          <AudioPlayerBar
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            speed={speed}
            onChangeSpeed={changeSpeed}
            progressPercent={progressPercent}
            title="Listen to Spoken Explanation"
          />

          {/* 4. Test Cards Breakdown */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>{t('result.testsHeading')}</Text>
          </View>

          {explanation.tests.map((test, index) => (
            <TestCard
              key={`${test.nameEnglish || test.name}_${index}`}
              test={test}
              onPlayAudioSnippet={handlePlayIndividualSnippet}
              isPlayingSnippet={isPlaying && activeSnippetTestName === test.name}
            />
          ))}

          {/* 5. Questions to ask your doctor */}
          {explanation.questionsForDoctor && explanation.questionsForDoctor.length > 0 && (
            <Card style={styles.questionsCard}>
              <View style={styles.questionsHeader}>
                <View style={styles.questionsTitleRow}>
                  <HelpCircle size={20} color={COLORS.primary} />
                  <Text style={styles.questionsTitle}>{t('result.questionsHeading')}</Text>
                </View>
                <Button
                  label="Share"
                  variant="outline"
                  size="small"
                  onPress={handleShareQuestions}
                  accessibilityLabel="Share questions for doctor"
                />
              </View>
              {explanation.questionsForDoctor.map((q, idx) => (
                <View key={idx} style={styles.questionItem}>
                  <Text style={styles.questionBullet}>?</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* 6. Book Appointment Shortcut */}
          <Card style={styles.appointmentShortcutCard}>
            <View style={styles.appointmentShortcutLeft}>
              <View style={styles.appointmentIconCircle}>
                <Calendar size={24} color="#0369A1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.appointmentShortcutTitle}>Need to see a Doctor?</Text>
                <Text style={styles.appointmentShortcutSub}>
                  Book OPD appointment at Shree Satya Sai Hospital
                </Text>
              </View>
            </View>
            <Button
              label="Book Appointment"
              onPress={handleBookAppointment}
              variant="primary"
              style={styles.appointmentShortcutBtn}
            />
          </Card>

          {/* 7. Persistent Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <AlertOctagon size={18} color={COLORS.textMuted} />
            <Text style={styles.disclaimerText}>{explanation.disclaimer}</Text>
          </View>
        </ScrollView>

        {/* Sticky Mini Audio Player when scrolled */}
        {isScrolledDown && (
          <AudioPlayerBar
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            speed={speed}
            onChangeSpeed={changeSpeed}
            progressPercent={progressPercent}
            isSticky={true}
          />
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
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBody: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  questionsCard: {
    backgroundColor: '#F8FAFC',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  questionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs + 2,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xs + 2,
  },
  questionBullet: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    flex: 1,
  },
  appointmentShortcutCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    marginBottom: SPACING.lg,
  },
  appointmentShortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appointmentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  appointmentShortcutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },
  appointmentShortcutSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appointmentShortcutBtn: {
    backgroundColor: '#0284C7',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

