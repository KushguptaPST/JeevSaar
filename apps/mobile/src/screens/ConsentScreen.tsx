import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Trash2, HeartPulse } from 'lucide-react-native';
import { Button } from '../design/components';
import { COLORS, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';

export const ConsentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setConsented } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    triggerHaptic('impactMedium');
    try {
      setConsented(true);
      // Attempt backend record if token exists, non-blocking
      try {
        await apiService.recordConsent(true, language);
      } catch (e) {
        // Will sync on login
      }
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={36} color={COLORS.primary} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>{t('consent.title')}</Text>
          <Text style={styles.summary}>{t('consent.summary')}</Text>

          <View style={styles.cardsList}>
            <View style={styles.pointCard}>
              <View style={styles.pointIconWrapper}>
                <HeartPulse size={22} color={COLORS.primary} />
              </View>
              <View style={styles.pointTextWrapper}>
                <Text style={styles.pointHeading}>Clear Health Explanations</Text>
                <Text style={styles.pointBody}>{t('consent.point1')}</Text>
              </View>
            </View>

            <View style={styles.pointCard}>
              <View style={styles.pointIconWrapper}>
                <Lock size={22} color={COLORS.primary} />
              </View>
              <View style={styles.pointTextWrapper}>
                <Text style={styles.pointHeading}>Automatic Privacy Redaction</Text>
                <Text style={styles.pointBody}>{t('consent.point2')}</Text>
              </View>
            </View>

            <View style={styles.pointCard}>
              <View style={styles.pointIconWrapper}>
                <Trash2 size={22} color={COLORS.primary} />
              </View>
              <View style={styles.pointTextWrapper}>
                <Text style={styles.pointHeading}>Automatic 30-Day Auto-Delete</Text>
                <Text style={styles.pointBody}>{t('consent.point3')}</Text>
              </View>
            </View>

            <View style={[styles.pointCard, styles.disclaimerCard]}>
              <Text style={styles.disclaimerText}>{t('consent.point4')}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            label={t('consent.acceptButton')}
            onPress={handleAccept}
            loading={loading}
            variant="primary"
          />
        </View>
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
  scrollContent: {
    paddingVertical: SPACING.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  cardsList: {
    gap: SPACING.md,
  },
  pointCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pointTextWrapper: {
    flex: 1,
  },
  pointHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  pointBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#92400E',
    fontWeight: '500',
  },
  bottomBar: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

