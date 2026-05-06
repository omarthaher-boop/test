import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { TripPurpose } from '../../types';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.primary,
  backgroundColor = colors.primaryLight,
  size = 'md',
  style,
}) => {
  return (
    <View style={[styles.base, styles[size], { backgroundColor }, style]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color }]}>{label}</Text>
    </View>
  );
};

const purposeConfig: Record<TripPurpose, { color: string; bg: string; label: string }> = {
  private: { color: colors.purposePrivate, bg: colors.purposePrivateLight, label: 'Privat' },
  business: { color: colors.purposeBusiness, bg: colors.purposeBusinessLight, label: 'Geschäftlich' },
  commute: { color: colors.purposeCommute, bg: colors.purposeCommuteLight, label: 'Arbeitsweg' },
};

interface PurposeBadgeProps {
  purpose: TripPurpose;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const PurposeBadge: React.FC<PurposeBadgeProps> = ({ purpose, size = 'md', style }) => {
  const config = purposeConfig[purpose];
  return (
    <Badge
      label={config.label}
      color={config.color}
      backgroundColor={config.bg}
      size={size}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  md: {
    paddingVertical: spacing.xs - 1,
    paddingHorizontal: spacing.sm + 2,
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 2,
  },
  text: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemiBold,
  },
  textSm: {
    fontSize: typography.fontSizeXs,
  },
});
