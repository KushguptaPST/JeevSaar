import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle2, PhoneCall } from 'lucide-react-native';
import { DoctorVisitLevel } from '@reportsaathi/shared';
import { COLORS, RADIUS, SPACING } from '../tokens';

export interface DoctorVisitBannerProps {
  level: DoctorVisitLevel | string;
  reason: string;
  emergencyNumber?: string;
}

export const DoctorVisitBanner: React.FC<DoctorVisitBannerProps> = ({
  level,
  reason,
  emergencyNumber = '112',
}) => {
  const normalizedLevel = (level || 'routine').toLowerCase() as DoctorVisitLevel;

  const getConfig = () => {
    switch (normalizedLevel) {
      case 'urgent':
        return {
          title: 'See a Doctor Promptly (Today)',
          subtitle: 'Critical values require professional evaluation',
          bgColor: COLORS.urgentBg,
          borderColor: COLORS.urgentBorder,
          accentColor: '#B91C1C',
          textColor: '#7F1D1D',
          Icon: AlertCircle,
          isUrgent: true,
        };
      case 'soon':
        return {
          title: 'Schedule a Doctor Visit Soon',
          subtitle: 'Some values differ from the printed range',
          bgColor: COLORS.lowHighBg,
          borderColor: COLORS.lowHighBorder,
          accentColor: '#B45309',
          textColor: '#78350F',
          Icon: AlertTriangle,
          isUrgent: false,
        };
      case 'routine':
      default:
        return {
          title: 'Routine Health Care',
          subtitle: 'Values generally appear within standard ranges',
          bgColor: COLORS.normalBg,
          borderColor: COLORS.normalBorder,
          accentColor: '#15803D',
          textColor: '#14532D',
          Icon: CheckCircle2,
          isUrgent: false,
        };
    }
  };

  const config = getConfig();
  const { Icon } = config;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Doctor consultation guidance: ${config.title}. ${reason}`}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: config.accentColor }]}>
          <Icon size={20} color={COLORS.textInverse} strokeWidth={2.5} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={[styles.title, { color: config.textColor }]}>{config.title}</Text>
          <Text style={[styles.subtitle, { color: config.textColor }]}>{config.subtitle}</Text>
        </View>
      </View>

      <Text style={[styles.reason, { color: config.textColor }]}>{reason}</Text>

      {config.isUrgent && (
        <View style={styles.emergencyRow}>
          <PhoneCall size={16} color="#B91C1C" strokeWidth={2.5} />
          <Text style={styles.emergencyText}>
            Severe chest pain or breathing difficulty? Call{' '}
            <Text style={styles.emergencyNum}>{emergencyNumber}</Text> immediately.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 1,
  },
  reason: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emergencyText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    marginLeft: SPACING.xs + 2,
    flex: 1,
  },
  emergencyNum: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});

