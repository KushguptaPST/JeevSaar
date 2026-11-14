import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, TrendingUp, Calendar, Trash2, ChevronRight } from 'lucide-react-native';
import { ReportItem, TestTrendSeries } from '@reportsaathi/shared';
import { Card, StatusChip } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';

export const MyReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'TRENDS'>('REPORTS');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [trends, setTrends] = useState<TestTrendSeries[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportsRes = await apiService.getReports();
      setReports(reportsRes.reports || []);

      const trendsRes = await apiService.getTrends();
      setTrends(trendsRes.series || []);
    } catch (e) {
      console.warn('Failed to load my reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReport = (id: string) => {
    triggerHaptic('impactLight');
    navigation.navigate('Result', { reportId: id });
  };

  const handleDeleteReport = async (id: string) => {
    triggerHaptic('impactMedium');
    try {
      await apiService.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.warn('Failed to delete report:', e);
    }
  };

  const renderReportCard = ({ item }: { item: ReportItem }) => (
    <Card style={styles.reportCard}>
      <Pressable
        onPress={() => handleOpenReport(item.id)}
        style={styles.cardClickable}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Report ${item.filename}, date ${new Date(item.createdAt).toLocaleDateString()}`}
      >
        <View style={styles.reportHeader}>
          <View style={styles.iconCircle}>
            <FileText size={22} color={COLORS.primary} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle} numberOfLines={1}>
              {item.filename}
            </Text>
            <View style={styles.dateRow}>
              <Calendar size={13} color={COLORS.textMuted} />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <StatusChip status={item.doctorVisitLevel || 'normal'} />
        </View>
      </Pressable>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => handleDeleteReport(item.id)}
          style={styles.deleteBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete this report"
        >
          <Trash2 size={16} color={COLORS.urgent} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>

        <Pressable
          onPress={() => handleOpenReport(item.id)}
          style={styles.viewBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View full explanation"
        >
          <Text style={styles.viewBtnText}>View Explanation</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </Pressable>
      </View>
    </Card>
  );

  const renderTrendItem = ({ item }: { item: TestTrendSeries }) => {
    if (item.dataPoints.length === 0) return null;

    return (
      <Card style={styles.trendCard}>
        <View style={styles.trendHeader}>
          <TrendingUp size={20} color={COLORS.primary} />
          <Text style={styles.trendTitle}>{item.testNameEnglish}</Text>
        </View>

        <View style={styles.trendList}>
          {item.dataPoints.map((pt, idx) => (
            <View key={idx} style={styles.trendPointRow}>
              <Text style={styles.trendDate}>{pt.date}</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>
                  {pt.numericValue} {pt.unit}
                </Text>
                <StatusChip status={pt.status} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.trendSummary}>
          <Text style={styles.trendSummaryText}>
            Reference range: {item.dataPoints[0]?.referenceRange || 'Standard'}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Lab Reports</Text>
          <Text style={styles.subtitle}>History & health trends over time</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              setActiveTab('REPORTS');
            }}
            style={[styles.tabButton, activeTab === 'REPORTS' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'REPORTS' && styles.tabButtonTextActive]}
            >
              All Reports ({reports.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              setActiveTab('TRENDS');
            }}
            style={[styles.tabButton, activeTab === 'TRENDS' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'TRENDS' && styles.tabButtonTextActive]}
            >
              Trends ({trends.length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'REPORTS' ? (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={renderReportCard}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[COLORS.primary]} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <FileText size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>No reports yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Upload a lab report from Home to see it saved here
                  </Text>
                </View>
              ) : undefined
            }
          />
        ) : (
          <FlatList
            data={trends}
            keyExtractor={(item) => item.testNameEnglish}
            renderItem={renderTrendItem}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[COLORS.primary]} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <TrendingUp size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>No trend history</Text>
                  <Text style={styles.emptySubtitle}>
                    Upload multiple reports with repeated tests to see tracking lines
                  </Text>
                </View>
              ) : undefined
            }
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
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.md - 2,
    minHeight: MIN_TOUCH_TARGET - 8,
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  reportCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardClickable: {
    marginBottom: SPACING.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reportInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    minHeight: 36,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.urgent,
    marginLeft: 4,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    minHeight: 36,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
  trendCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: SPACING.xs + 2,
  },
  trendList: {
    gap: SPACING.sm,
  },
  trendPointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  trendDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trendSummary: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trendSummaryText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

