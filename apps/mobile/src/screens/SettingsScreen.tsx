import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Type,
  Trash2,
  Info,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { getLanguageInfo } from '@reportsaathi/shared';
import { Button, Card } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING, TextSizeOption } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { MOBILE_CONFIG } from '../config';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, textSize, setTextSize } = useAppStore();
  const { logout } = useAuthStore();

  const [deleting, setDeleting] = useState(false);

  const langInfo = getLanguageInfo(language);

  const handleSelectTextSize = (size: TextSizeOption) => {
    triggerHaptic('impactLight');
    setTextSize(size);
  };

  const handleChangeLanguage = () => {
    triggerHaptic('impactLight');
    navigation.navigate('LanguagePicker', { fromSettings: true });
  };

  const handleDeleteData = () => {
    triggerHaptic('impactHeavy');
    Alert.alert(
      t('settings.deleteData'),
      t('settings.deleteDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await apiService.deleteMyData();
              await logout();
              Alert.alert('Data Purged', 'All your data has been permanently deleted.');
              navigation.reset({
                index: 0,
                routes: [{ name: 'LanguagePicker' }],
              });
            } catch (e) {
              Alert.alert('Error', 'Unable to delete data. Please check your connection.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    triggerHaptic('impactMedium');
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Language Option */}
          <Text style={styles.sectionHeader}>{t('settings.language')}</Text>
          <Card style={styles.card}>
            <Pressable
              onPress={handleChangeLanguage}
              style={styles.rowClickable}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Change app language. Current: ${langInfo.nativeName}`}
            >
              <View style={styles.iconCircle}>
                <Globe size={22} color={COLORS.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{langInfo.nativeName}</Text>
                <Text style={styles.rowSubtitle}>{langInfo.nameEnglish}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </Pressable>
          </Card>

          {/* 2. Text Size Option */}
          <Text style={styles.sectionHeader}>{t('settings.textSize')}</Text>
          <Card style={styles.card}>
            <View style={styles.textSizeRow}>
              {(['normal', 'large', 'extra-large'] as TextSizeOption[]).map((sz) => {
                const isSelected = textSize === sz;
                const label =
                  sz === 'normal'
                    ? t('settings.textSizeNormal')
                    : sz === 'large'
                    ? t('settings.textSizeLarge')
                    : t('settings.textSizeExtraLarge');

                return (
                  <Pressable
                    key={sz}
                    onPress={() => handleSelectTextSize(sz)}
                    style={[styles.textSizePill, isSelected && styles.textSizePillActive]}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Text size ${label}`}
                  >
                    {isSelected && <Check size={14} color={COLORS.primary} style={{ marginRight: 4 }} />}
                    <Text
                      style={[styles.textSizeLabel, isSelected && styles.textSizeLabelActive]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* 3. Privacy & Hard Data Purge */}
          <Text style={styles.sectionHeader}>Privacy & Data Protection</Text>
          <Card style={[styles.card, styles.dangerCard]}>
            <Pressable
              onPress={handleDeleteData}
              disabled={deleting}
              style={styles.rowClickable}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('settings.deleteData')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Trash2 size={22} color={COLORS.urgent} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: COLORS.urgent }]}>
                  {t('settings.deleteData')}
                </Text>
                <Text style={styles.rowSubtitle}>
                  Permanently deletes account, reports, files, and audio
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.urgent} />
            </Pressable>
          </Card>

          {/* 4. About & Medical Disclaimer */}
          <Text style={styles.sectionHeader}>{t('settings.about')}</Text>
          <Card style={styles.card}>
            <View style={styles.aboutRow}>
              <Info size={20} color={COLORS.primary} />
              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                <Text style={styles.aboutTitle}>{MOBILE_CONFIG.appName}</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0 &bull; Build 101</Text>
                <Text style={styles.aboutDesc}>
                  Free medical lab report simplifier for non-English speakers.
                </Text>
              </View>
            </View>

            <View style={styles.disclaimerBox}>
              <View style={styles.disclaimerTitleRow}>
                <ShieldAlert size={16} color="#B45309" />
                <Text style={styles.disclaimerHeading}>Medical Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                ReportSaathi uses clinical rules and AI assistance to explain lab values in plain
                language. It is NOT a medical diagnosis and cannot prescribe treatments. Always consult
                a licensed medical practitioner. In medical emergencies, call 112 immediately.
              </Text>
            </View>
          </Card>

          <Button
            label={t('settings.logout')}
            variant="outline"
            onPress={handleLogout}
            icon={<LogOut size={18} color={COLORS.primary} />}
            style={styles.logoutBtn}
          />
        </ScrollView>
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
  scrollContent: {
    paddingBottom: SPACING.huge,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs + 2,
  },
  card: {
    padding: SPACING.md,
  },
  dangerCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  rowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
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
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  textSizeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  textSizePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH_TARGET,
  },
  textSizePillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  textSizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  textSizeLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  aboutVersion: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  aboutDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  disclaimerHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#78350F',
  },
  logoutBtn: {
    marginTop: SPACING.xl,
  },
});

