import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../tokens';

export interface OfflineNoticeProps {
  isOffline?: boolean;
  message?: string;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  isOffline = false,
  message = 'Offline Mode: Showing your saved reports and cached audio explanations.',
}) => {
  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <View style={styles.iconCircle}>
        <WifiOff size={16} color={COLORS.primary} strokeWidth={2.2} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
