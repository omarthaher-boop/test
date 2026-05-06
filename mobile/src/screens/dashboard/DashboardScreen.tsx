import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { TripCard } from '../../components/trip/TripCard';
import { TripFilters } from '../../components/trip/TripFilters';
import { useTrips } from '../../hooks/useTrips';
import { useAuthStore } from '../../store/authStore';
import { TripFilter, DateRange, Trip } from '../../types';
import { colors, spacing } from '../../theme';
import { format, subMonths, startOfMonth, startOfYear, endOfDay, startOfDay } from 'date-fns';

const getDateRange = (filter: TripFilter, custom?: DateRange): { from?: string; to?: string } => {
  const now = new Date();
  switch (filter) {
    case 'month':
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    case '3months':
      return {
        from: format(subMonths(now, 3), "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    case '6months':
      return {
        from: format(subMonths(now, 6), "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    case 'year':
      return {
        from: format(startOfYear(now), "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    case 'custom':
      if (!custom) return {};
      return {
        from: format(startOfDay(custom.from), "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(endOfDay(custom.to), "yyyy-MM-dd'T'HH:mm:ss"),
      };
    default:
      return {};
  }
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<TripFilter>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const dateParams = getDateRange(filter, customRange);
  const { data, isLoading, refetch, isRefetching } = useTrips(dateParams);

  const trips = data?.data ?? [];

  const handleFilterChange = useCallback((f: TripFilter, range?: DateRange) => {
    setFilter(f);
    if (range) setCustomRange(range);
  }, []);

  const totalKm = trips.reduce((sum, t) => sum + (t.distanceKm ?? 0), 0);

  const renderHeader = () => (
    <View>
      {/* Page header */}
      <View style={styles.header}>
        <View>
          <Typography variant="h2">Fahrten</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Guten Tag, {user?.name?.split(' ')[0]}
          </Typography>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Export')}
          style={styles.exportBtn}
        >
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      {trips.length > 0 && (
        <View style={styles.summaryRow}>
          <SummaryChip icon="car" value={`${trips.length}`} label="Fahrten" />
          <SummaryChip icon="speedometer" value={`${totalKm.toFixed(0)} km`} label="Gesamt" />
          <SummaryChip
            icon="briefcase"
            value={`${trips.filter((t) => t.purpose === 'business').length}`}
            label="Geschäftl."
          />
        </View>
      )}

      {/* Filters */}
      <TripFilters
        activeFilter={filter}
        customRange={customRange}
        onFilterChange={handleFilterChange}
      />

      <Typography variant="label" style={styles.sectionLabel}>
        {trips.length} {trips.length === 1 ? 'Fahrt' : 'Fahrten'} gefunden
      </Typography>
    </View>
  );

  if (isLoading) return <LoadingSpinner fullScreen message="Lade Fahrten…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => navigation.navigate('TripDetail', { id: item._id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const SummaryChip: React.FC<{ icon: string; value: string; label: string }> = ({
  icon, value, label,
}) => (
  <View style={styles.summaryChip}>
    <Ionicons name={icon as never} size={18} color={colors.primary} />
    <Typography variant="body" weight="bold">{value}</Typography>
    <Typography variant="caption">{label}</Typography>
  </View>
);

const EmptyState: React.FC = () => (
  <View style={styles.empty}>
    <Ionicons name="car-outline" size={56} color={colors.textMuted} />
    <Typography variant="body" weight="semibold" color={colors.textSecondary} align="center">
      Keine Fahrten gefunden
    </Typography>
    <Typography variant="bodySmall" color={colors.textMuted} align="center">
      Wechsle den Filter oder starte deine erste Fahrt.
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
  },
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
