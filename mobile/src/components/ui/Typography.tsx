import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[styles[variant], weight && styles[`weight_${weight}`], { color: color ?? undefined, textAlign: align }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize3xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    lineHeight: typography.fontSize3xl * typography.lineHeightTight,
  },
  h2: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    lineHeight: typography.fontSize2xl * typography.lineHeightTight,
  },
  h3: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightSemiBold,
    color: colors.text,
    lineHeight: typography.fontSizeXl * typography.lineHeightNormal,
  },
  body: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightRegular,
    color: colors.text,
    lineHeight: typography.fontSizeMd * typography.lineHeightNormal,
  },
  bodySmall: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightRegular,
    color: colors.textSecondary,
    lineHeight: typography.fontSizeSm * typography.lineHeightNormal,
  },
  caption: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightRegular,
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  weight_regular: { fontWeight: typography.fontWeightRegular },
  weight_medium: { fontWeight: typography.fontWeightMedium },
  weight_semibold: { fontWeight: typography.fontWeightSemiBold },
  weight_bold: { fontWeight: typography.fontWeightBold },
});
