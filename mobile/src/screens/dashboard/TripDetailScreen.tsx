import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { PurposeBadge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { TripMap } from '../../components/trip/TripMap';
import { useTripDetail, useDeleteTrip } from '../../hooks/useTrips';
import { MainTabParamList } from '../../navigation/MainTabs';
import { colors, spacing } from '../../theme';
import {
  formatDate, formatTime, formatKm, formatDuration, formatAddress, purposeEmoji,
} from '../../utils/formatters';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ TripDetail: { id: string } }, 'TripDetail'>;
};

export const TripDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const { data: trip, isLoading } = useTripDetail(id);
  const deleteTrip = useDeleteTrip();
  const [showShortest, setShowShortest] = useState(true);

  if (isLoading || !trip) return <LoadingSpinner fullScreen message="Lade Fahrtdetails…" />;

  const handleDelete = () => {
    Alert.alert(
      'Fahrt löschen',
      'Möchtest du diese Fahrt unwiderruflich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip.mutateAsync(trip._id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const startAddr = formatAddress(trip.startLocation?.address, trip.startLocation?.latitude);
  const endAddr = trip.endLocation
    ? formatAddress(trip.endLocation.address, trip.endLocation?.latitude)
    : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Custom header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Fahrtdetails</Typography>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <TripMap
            routePoints={trip.routePoints}
            shortestRoutePolyline={trip.shortestRoutePolyline}
            showShortest={showShortest}
            style={styles.map}
            interactive
          />

          {/* Map legend */}
          {trip.shortestRoutePolyline && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: colors.mapRoute }]} />
                <Typography variant="caption">Gefahrene Route</Typography>
              </View>
              <TouchableOpacity
                style={styles.legendItem}
                onPress={() => setShowShortest(!showShortest)}
              >
                <View style={[styles.legendDashed, { borderColor: colors.mapShortest }]} />
                <Typography variant="caption" color={showShortest ? colors.text : colors.textMuted}>
                  Kürzeste Route {showShortest ? '' : '(ausgeblendet)'}
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Purpose & Date */}
        <View style={styles.headerRow}>
          <View>
            <Typography variant="h3">{formatDate(trip.startTime)}</Typography>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              {formatTime(trip.startTime)} – {formatTime(trip.endTime)}
            </Typography>
          </View>
          <PurposeBadge purpose={trip.purpose} />
        </View>

        {/* Distance comparison */}
        <Card style={styles.distanceCard}>
          <View style={styles.distanceRow}>
            <DistanceStat
              icon="speedometer"
              label="Gefahrene Strecke"
              value={formatKm(trip.distanceKm)}
              color={colors.primary}
            />
            {trip.shortestRouteKm !== null && (
              <>
                <View style={styles.divider} />
                <DistanceStat
                  icon="map"
                  label="Kürzeste Route"
                  value={formatKm(trip.shortestRouteKm)}
                  color={colors.textSecondary}
                  subtitle="(laut Google Maps)"
                />
              </>
            )}
            <View style={styles.divider} />
            <DistanceStat
              icon="time"
              label="Dauer"
              value={formatDuration(trip.durationMinutes)}
              color={colors.secondary}
            />
          </View>
        </Card>

        {/* Route details */}
        <Card style={styles.routeCard}>
          <Typography variant="label" style={styles.cardTitle}>Route</Typography>
          <RouteRow icon="radio-button-on" color={colors.mapStart} label="Start" value={startAddr} sub={formatTime(trip.startTime)} />
          <View style={styles.routeConnector} />
          <RouteRow icon="location" color={colors.mapEnd} label="Ziel" value={endAddr} sub={formatTime(trip.endTime)} />
        </Card>

        {/* Note */}
        {trip.note && (
          <Card>
            <Typography variant="label" style={styles.cardTitle}>Notiz</Typography>
            <Typography variant="body" color={colors.textSecondary}>{trip.note}</Typography>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <Typography variant="label" style={styles.cardTitle}>Details</Typography>
          <MetaRow label="Kennzeichen" value={`🚗 ${trip.userId}`} />
          <MetaRow label="Fahrtzweck" value={`${purposeEmoji[trip.purpose]} ${trip.purpose}`} />
          <MetaRow label="Streckenpunkte" value={`${trip.routePoints.length} GPS-Punkte`} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const DistanceStat: React.FC<{ icon: string; label: string; value: string; color: string; subtitle?: string }> = ({
  icon, label, value, color, subtitle,
}) => (
  <View style={styles.distanceStat}>
    <Ionicons name={icon as never} size={20} color={color} />
    <Typography variant="h3" color={color}>{value}</Typography>
    <Typography variant="caption" align="center">{label}</Typography>
    {subtitle && <Typography variant="caption" color={colors.textMuted} align="center">{subtitle}</Typography>}
  </View>
);

const RouteRow: React.FC<{ icon: string; color: string; label: string; value: string; sub: string }> = ({
  icon, color, label, value, sub,
}) => (
  <View style={styles.routeRow}>
    <Ionicons name={icon as never} size={18} color={color} />
    <View style={styles.routeInfo}>
      <Typography variant="caption" color={colors.textMuted}>{label}</Typography>
      <Typography variant="body" weight="medium" numberOfLines={2}>{value}</Typography>
      <Typography variant="caption" color={colors.textMuted}>{sub}</Typography>
    </View>
  </View>
);

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.metaRow}>
    <Typography variant="bodySmall" color={colors.textMuted} style={styles.metaLabel}>{label}</Typography>
    <Typography variant="bodySmall" weight="medium">{value}</Typography>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs },
  deleteBtn: { padding: spacing.xs },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  mapContainer: { gap: spacing.sm },
  map: { height: 260 },
  legend: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendLine: { width: 24, height: 3, borderRadius: 2 },
  legendDashed: {
    width: 24,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  distanceCard: {},
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  distanceStat: { alignItems: 'center', gap: 3, flex: 1 },
  divider: { width: 1, height: 60, backgroundColor: colors.border },
  routeCard: { gap: spacing.sm },
  cardTitle: { marginBottom: spacing.sm },
  routeConnector: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 9,
  },
  routeRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  routeInfo: { flex: 1, gap: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: { flex: 1 },
});
