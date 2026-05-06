import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { colors, spacing, borderRadius } from '../../theme';
import { TripPurpose } from '../../types';
import { PURPOSE_OPTIONS } from '../../utils/constants';

interface PurposeSelectorProps {
  value: TripPurpose;
  onChange: (value: TripPurpose) => void;
}

const purposeColors: Record<TripPurpose, { active: string; bg: string; activeBg: string }> = {
  private: { active: colors.purposePrivate, bg: colors.surface, activeBg: colors.purposePrivateLight },
  business: { active: colors.purposeBusiness, bg: colors.surface, activeBg: colors.purposeBusinessLight },
  commute: { active: colors.purposeCommute, bg: colors.surface, activeBg: colors.purposeCommuteLight },
};

export const PurposeSelector: React.FC<PurposeSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Typography variant="label" style={styles.label}>Fahrtzweck</Typography>
      <View style={styles.row}>
        {PURPOSE_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          const c = purposeColors[opt.value];
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.75}
              style={[
                styles.option,
                { backgroundColor: selected ? c.activeBg : c.bg },
                selected && { borderColor: c.active, borderWidth: 1.5 },
                !selected && styles.unselected,
              ]}
            >
              <Typography style={styles.emoji}>{opt.emoji}</Typography>
              <Typography
                variant="bodySmall"
                weight={selected ? 'semibold' : 'regular'}
                color={selected ? c.active : colors.textSecondary}
              >
                {opt.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  unselected: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 22 },
});
