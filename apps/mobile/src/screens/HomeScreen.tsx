import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, CalendarPlus, ChevronRight, FileHeart } from 'lucide-react-native';
import { ReportItem } from '@reportsaathi/shared';
import { Card, StatusChip } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { user } = useAuthStore();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReports();
      setReports(data.reports || []);
    } catch (e) {
      // non-fatal in offline mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUnderstandReport = () => {
    triggerHaptic('impactMedium');
    navigation.navigate('Upload');
  };

  const handleBookAppointment = () => {
    triggerHaptic('impactMedium');
    navigation.navigate('BookAppointment');
  };

  const handleOpenReport = (report: ReportItem) => {
    triggerHaptic('impactLight');
    navigation.navigate('Result', { reportId: report.id });
  };

  const renderRecentReport = ({ item }: { item: ReportItem }) => (
    <Pressable
      onPress={() => handleOpenReport(item)}
      style={styles.recentItem}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Report ${item.filename}, status ${item.status}`}
    >
      <View style={styles.recentIconWrapper}>
        <FileText size={20} color={COLORS.primary} />
      </View>
      <View style={styles.recentDetails}>
        <Text style={styles.recentFilename} numberOfLines={1}>
          {item.filename}
        </Text>
        <Text style={styles.recentDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <StatusChip status={item.doctorVisitLevel || 'normal'} />
      <ChevronRight size={18} color={COLORS.textMuted} style={{ marginLeft: SPACING.xs }} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.howAreYou}>{t('home.howAreYou')}</Text>
          </View>
        </View>

        <FlatList
          data={reports.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={renderRecentReport}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchReports} colors={[COLORS.primary]} />
          }
          ListHeaderComponent={
            <View style={styles.actionsContainer}>
              {/* Big Action 1: Understand My Report */}
              <Pressable
                onPress={handleUnderstandReport}
                style={styles.bigActionCard}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Understand my lab report. Upload photo or PDF"
              >
                <View style={styles.bigActionIconWrapper}>
                  <FileHeart size={32} color={COLORS.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.bigActionTextWrapper}>
                  <Text style={styles.bigActionTitle}>{t('home.actionUnderstand')}</Text>
                  <Text style={styles.bigActionDesc}>{t('home.actionUnderstandDesc')}</Text>
                </View>
                <View style={styles.actionArrow}>
                  <ChevronRight size={22} color={COLORS.primary} />
                </View>
              </Pressable>

              {/* Big Action 2: Book Hospital Appointment */}
              <Pressable
                onPress={handleBookAppointment}
                style={[styles.bigActionCard, styles.bigActionCardSecondary]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Book hospital appointment at Shree Satya Sai Hospital"
              >
                <View style={[styles.bigActionIconWrapper, styles.secondaryIconWrapper]}>
                  <CalendarPlus size={32} color="#0369A1" strokeWidth={2.5} />
                </View>
                <View style={styles.bigActionTextWrapper}>
                  <Text style={[styles.bigActionTitle, { color: '#0369A1' }]}>
                    {t('home.actionAppointment')}
                  </Text>
                  <Text style={styles.bigActionDesc}>{t('home.actionAppointmentDesc')}</Text>
                </View>
                <View style={styles.actionArrow}>
                  <ChevronRight size={22} color="#0369A1" />
                </View>
              </Pressable>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.recentReports')}</Text>
                {reports.length > 0 && (
                  <Pressable onPress={() => navigation.navigate('MyReports')}>
                    <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <Card style={styles.emptyCard}>
                <FileText size={36} color={COLORS.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>{t('home.noReports')}</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Understand My Report" above to get started
                </Text>
              </Card>
            ) : undefined
          }
          contentContainerStyle={styles.listContent}
        />
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
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  howAreYou: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  actionsContainer: {
    marginBottom: SPACING.lg,
  },
  bigActionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: 90,
  },
  bigActionCardSecondary: {
    borderColor: '#BAE6FD',
  },
  bigActionIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  secondaryIconWrapper: {
    backgroundColor: '#E0F2FE',
  },
  bigActionTextWrapper: {
    flex: 1,
  },
  bigActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  bigActionDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  actionArrow: {
    marginLeft: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  recentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recentDetails: {
    flex: 1,
  },
  recentFilename: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  recentDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});

