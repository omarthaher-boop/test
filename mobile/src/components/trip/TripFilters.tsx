import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { TripFilter, DateRange } from '../../types';
import { TRIP_FILTERS } from '../../utils/constants';
import {
  startOfMonth, subMonths, startOfYear, endOfDay, startOfDay, format, parseISO,
} from 'date-fns';

interface TripFiltersProps {
  activeFilter: TripFilter;
  customRange?: DateRange;
  onFilterChange: (filter: TripFilter, range?: DateRange) => void;
}

export const TripFilters: React.FC<TripFiltersProps> = ({
  activeFilter,
  customRange,
  onFilterChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const applyCustomRange = () => {
    if (!fromDate || !toDate) {
      Alert.alert('Fehler', 'Bitte Von- und Bis-Datum eingeben (JJJJ-MM-TT).');
      return;
    }
    onFilterChange('custom', {
      from: startOfDay(parseISO(fromDate)),
      to: endOfDay(parseISO(toDate)),
    });
    setShowDatePicker(false);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {TRIP_FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                if (f.key === 'custom') {
                  setShowDatePicker(true);
                } else {
                  onFilterChange(f.key as TripFilter);
                }
              }}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.75}
            >
              {f.key === 'custom' && (
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={active ? colors.textInverse : colors.textSecondary}
                  style={styles.chipIcon}
                />
              )}
              <Typography
                variant="bodySmall"
                weight={active ? 'semibold' : 'regular'}
                color={active ? colors.textInverse : colors.textSecondary}
              >
                {f.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Custom date range modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Typography variant="h3" style={styles.modalTitle}>Zeitraum wählen</Typography>

            <Typography variant="label" style={styles.dateLabel}>Von (JJJJ-MM-TT)</Typography>
            <View style={styles.dateInput}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <Typography
                variant="body"
                color={fromDate ? colors.text : colors.textMuted}
                style={styles.dateText}
                onPress={() => {}}
              >
                {fromDate || 'JJJJ-MM-TT'}
              </Typography>
            </View>

            <Typography variant="label" style={styles.dateLabel}>Bis (JJJJ-MM-TT)</Typography>
            <View style={styles.dateInput}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <Typography
                variant="body"
                color={toDate ? colors.text : colors.textMuted}
                style={styles.dateText}
              >
                {toDate || 'JJJJ-MM-TT'}
              </Typography>
            </View>

            {/* Quick date presets inside modal */}
            <View style={styles.presets}>
              {[
                { label: 'Dieser Monat', from: format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') },
                { label: 'Letzter Monat', from: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), to: format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'yyyy-MM-dd') },
                { label: 'Dieses Jahr', from: format(startOfYear(new Date()), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.preset}
                  onPress={() => { setFromDate(p.from); setToDate(p.to); }}
                >
                  <Typography variant="bodySmall" color={colors.primary}>{p.label}</Typography>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Abbrechen" onPress={() => setShowDatePicker(false)} variant="ghost" size="sm" />
              <Button title="Anwenden" onPress={applyCustomRange} size="sm" />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: { marginRight: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  modalTitle: { marginBottom: spacing.lg },
  dateLabel: { marginBottom: spacing.xs },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dateText: { flex: 1 },
  presets: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.lg },
  preset: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
});
