import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TripMap } from '../../components/trip/TripMap';
import { PurposeSelector } from '../../components/trip/PurposeSelector';
import { useActiveTrip } from '../../hooks/useActiveTrip';
import { useTripStore } from '../../store/tripStore';
import { TripPurpose } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';
import { formatDuration, formatKm } from '../../utils/formatters';

export const TrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isRecording, routePoints, loading, startTrip, stopTrip } = useActiveTrip();
  const { startTime } = useTripStore();

  const [purpose, setPurpose] = useState<TripPurpose>('private');
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [showStopForm, setShowStopForm] = useState(false);

  // Live elapsed timer
  useEffect(() => {
    if (!isRecording || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  // Live speed from foreground location subscription
  useEffect(() => {
    if (!isRecording) return;
    let sub: Location.LocationSubscription | null = null;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
      (loc) => {
        const kmh = (loc.coords.speed ?? 0) * 3.6;
        setCurrentSpeed(kmh > 0 ? kmh : null);
      },
    ).then((s) => { sub = s; });

    return () => { sub?.remove(); };
  }, [isRecording]);

  const handleStop = useCallback(async () => {
    const completedId = await stopTrip(purpose, note.trim() || undefined);
    if (completedId) {
      setShowStopForm(false);
      setNote('');
      navigation.navigate('TripDetail', { id: completedId });
    }
  }, [stopTrip, purpose, note, navigation]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2">Fahrt aufzeichnen</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Starte oder beende eine Fahrt
          </Typography>
        </View>

        {/* Live Map */}
        <TripMap
          routePoints={routePoints}
          style={styles.map}
          interactive={false}
          showShortest={false}
        />

        {/* Recording Status */}
        {isRecording ? (
          <>
            <Card style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Typography variant="body" weight="semibold" color={colors.danger}>
                    Aufzeichnung läuft
                  </Typography>
                </View>
                <Typography variant="h3" color={colors.primary}>
                  {formatElapsed(elapsed)}
                </Typography>
              </View>

              <View style={styles.liveStats}>
                <LiveStat
                  icon="speedometer-outline"
                  label="Geschwindigkeit"
                  value={currentSpeed !== null ? `${currentSpeed.toFixed(0)} km/h` : '— km/h'}
                />
                <LiveStat
                  icon="navigate-outline"
                  label="Streckenpunkte"
                  value={String(routePoints.length)}
                />
                <LiveStat
                  icon="time-outline"
                  label="Dauer"
                  value={formatElapsed(elapsed)}
                />
              </View>
            </Card>

            {/* Stop form */}
            {showStopForm ? (
              <Card style={styles.stopForm}>
                <Typography variant="h3" style={styles.sectionTitle}>Fahrt beenden</Typography>

                <PurposeSelector value={purpose} onChange={setPurpose} />

                <Typography variant="label" style={styles.noteLabel}>
                  Notiz (optional)
                </Typography>
                <TextInput
                  style={styles.noteInput}
                  placeholder="z. B. Kundenbesuch, Dienstreise..."
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />

                <View style={styles.stopActions}>
                  <Button
                    title="Abbrechen"
                    onPress={() => setShowStopForm(false)}
                    variant="ghost"
                    style={styles.halfBtn}
                  />
                  <Button
                    title="Fahrt beenden"
                    onPress={handleStop}
                    variant="danger"
                    loading={loading}
                    style={styles.halfBtn}
                  />
                </View>
              </Card>
            ) : (
              <Button
                title="Stopp"
                onPress={() => setShowStopForm(true)}
                variant="danger"
                size="lg"
                icon={<Ionicons name="stop-circle-outline" size={22} color={colors.textInverse} />}
                style={styles.actionBtn}
              />
            )}
          </>
        ) : (
          /* Not recording */
          <Card style={styles.idleCard}>
            <View style={styles.idleContent}>
              <Ionicons name="car-outline" size={48} color={colors.textMuted} />
              <Typography variant="body" color={colors.textSecondary} align="center">
                Noch keine aktive Fahrt. Drücke Start, um die Aufzeichnung zu beginnen.
              </Typography>
            </View>

            <Button
              title="Start"
              onPress={startTrip}
              size="lg"
              loading={loading}
              icon={<Ionicons name="play-circle-outline" size={22} color={colors.textInverse} />}
              style={styles.actionBtn}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const LiveStat: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.liveStat}>
    <Ionicons name={icon as never} size={18} color={colors.primary} />
    <Typography variant="bodySmall" weight="semibold">{value}</Typography>
    <Typography variant="caption">{label}</Typography>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs },
  map: { height: 240 },
  statusCard: { gap: spacing.md },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  liveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  liveStat: { alignItems: 'center', gap: 3 },
  stopForm: { gap: spacing.sm },
  sectionTitle: { marginBottom: spacing.sm },
  noteLabel: { marginBottom: spacing.sm },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  stopActions: { flexDirection: 'row', gap: spacing.sm },
  halfBtn: { flex: 1 },
  idleCard: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  idleContent: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md },
  actionBtn: { width: '100%' },
});
