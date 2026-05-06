import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { PurposeBadge } from '../ui/Badge';
import { Trip } from '../../types';
import { formatDate, formatTime, formatKm, formatDuration, formatAddress } from '../../utils/formatters';
import { colors, spacing } from '../../theme';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const startAddr = formatAddress(trip.startLocation?.address, trip.startLocation?.latitude);
  const endAddr = trip.endLocation
    ? formatAddress(trip.endLocation.address, trip.endLocation.latitude)
    : '…';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.card}>
        {/* Top row: date + purpose badge */}
        <View style={styles.topRow}>
          <Typography variant="label">{formatDate(trip.startTime)}</Typography>
          <PurposeBadge purpose={trip.purpose} size="sm" />
        </View>

        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.routeLeft}>
            <View style={styles.dot} />
            <View style={styles.routeLine} />
            <View style={[styles.dot, styles.dotEnd]} />
          </View>
          <View style={styles.routeAddresses}>
            <Typography variant="body" weight="medium" numberOfLines={1}>{startAddr}</Typography>
            <View style={styles.addressSpacer} />
            <Typography variant="body" weight="medium" numberOfLines={1} color={colors.textSecondary}>
              {endAddr}
            </Typography>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatItem icon="speedometer-outline" value={formatKm(trip.distanceKm)} label="Gefahren" />
          {trip.shortestRouteKm !== null && (
            <StatItem icon="map-outline" value={formatKm(trip.shortestRouteKm)} label="Kürzeste" color={colors.textMuted} />
          )}
          <StatItem icon="time-outline" value={formatDuration(trip.durationMinutes)} label="Dauer" />
          <StatItem
            icon="alarm-outline"
            value={`${formatTime(trip.startTime)} – ${formatTime(trip.endTime)}`}
            label="Zeit"
          />
        </View>

        {/* Note */}
        {trip.note && (
          <View style={styles.noteRow}>
            <Ionicons name="document-text-outline" size={13} color={colors.textMuted} />
            <Typography variant="caption" style={styles.noteText} numberOfLines={2}>
              {trip.note}
            </Typography>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const StatItem: React.FC<{ icon: string; value: string; label: string; color?: string }> = ({
  icon, value, label, color,
}) => (
  <View style={styles.stat}>
    <Ionicons name={icon as never} size={14} color={color ?? colors.textSecondary} />
    <Typography variant="bodySmall" weight="semibold" color={color ?? colors.text}>
      {value}
    </Typography>
    <Typography variant="caption">{label}</Typography>
  </View>
);

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  routeLeft: {
    alignItems: 'center',
    paddingTop: 3,
    width: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  dotEnd: { backgroundColor: colors.danger },
  routeLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  routeAddresses: { flex: 1, justifyContent: 'space-between', gap: spacing.sm },
  addressSpacer: { height: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: { alignItems: 'center', gap: 2 },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: spacing.xs,
  },
  noteText: { flex: 1 },
});
