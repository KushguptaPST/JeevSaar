import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { triggerHaptic } from '../../services/haptics';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../tokens';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('impactLight');
    onPress();
  };

  const getContainerStyle = (pressed: boolean) => {
    const base: ViewStyle[] = [styles.base];

    if (size === 'large') {
      base.push(styles.sizeLarge);
    } else {
      base.push(styles.sizeMedium);
    }

    switch (variant) {
      case 'primary':
        base.push(pressed ? styles.primaryPressed : styles.primary);
        break;
      case 'secondary':
        base.push(pressed ? styles.secondaryPressed : styles.secondary);
        break;
      case 'outline':
        base.push(pressed ? styles.outlinePressed : styles.outline);
        break;
      case 'danger':
        base.push(pressed ? styles.dangerPressed : styles.danger);
        break;
    }

    if (disabled) {
      base.push(styles.disabled);
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
        return COLORS.textInverse;
      case 'secondary':
      case 'outline':
        return COLORS.primary;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.label, { color: getTextColor() }, labelStyle]}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  sizeMedium: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
  },
  sizeLarge: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xxl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  secondary: {
    backgroundColor: COLORS.primaryLight,
  },
  secondaryPressed: {
    backgroundColor: '#CCEDE6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlinePressed: {
    backgroundColor: COLORS.primaryLight,
  },
  danger: {
    backgroundColor: COLORS.urgent,
  },
  dangerPressed: {
    backgroundColor: '#B91C1C',
  },
  disabled: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
});

