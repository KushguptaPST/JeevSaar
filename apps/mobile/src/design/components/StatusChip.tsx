import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../tokens';

export type ClinicalStatus = 'normal' | 'low' | 'high' | 'urgent' | 'unknown';

export interface StatusChipProps {
  status: ClinicalStatus | string;
  customLabel?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, customLabel }) => {
  const normalized = (status || 'unknown').toLowerCase();

  const getConfig = () => {
    switch (normalized) {
      case 'normal':
        return {
          label: customLabel || 'Normal',
          bgColor: COLORS.normalBg,
          borderColor: COLORS.normalBorder,
          textColor: '#15803D',
          Icon: Check,
        };
      case 'low':
        return {
          label: customLabel || 'Low',
          bgColor: COLORS.lowHighBg,
          borderColor: COLORS.lowHighBorder,
          textColor: '#B45309',
          Icon: AlertTriangle,
        };
      case 'high':
        return {
          label: customLabel || 'High',
          bgColor: COLORS.lowHighBg,
          borderColor: COLORS.lowHighBorder,
          textColor: '#B45309',
          Icon: AlertTriangle,
        };
      case 'urgent':
      case 'needs attention':
      case 'needs_attention':
        return {
          label: customLabel || 'Needs Attention',
          bgColor: COLORS.urgentBg,
          borderColor: COLORS.urgentBorder,
          textColor: '#B91C1C',
          Icon: AlertCircle,
        };
      default:
        return {
          label: customLabel || 'Review',
          bgColor: COLORS.unknownBg,
          borderColor: COLORS.unknownBorder,
          textColor: COLORS.textSecondary,
          Icon: HelpCircle,
        };
    }
  };

  const config = getConfig();
  const { Icon } = config;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Test Status: ${config.label}`}
    >
      <Icon size={14} color={config.textColor} strokeWidth={2.5} style={styles.icon} />
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

