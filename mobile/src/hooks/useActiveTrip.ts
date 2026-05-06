import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTripStore } from '../store/tripStore';
import { locationService } from '../services/location.service';
import { tripsApi } from '../api/trips';
import { TripPurpose } from '../types';
import { TRIPS_QUERY_KEY } from './useTrips';
import { ROUTE_BUFFER_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useActiveTrip = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { activeTripId, routePoints, isRecording, setActiveTrip, clearActiveTrip, addRoutePoints } =
    useTripStore();

  const startTrip = useCallback(async () => {
    setLoading(true);
    try {
      const perms = await locationService.requestPermissions();
      if (perms === 'denied') {
        Alert.alert(
          'Standortberechtigung',
          'Bitte erlaube den Standortzugriff in den Einstellungen, um Fahrten aufzuzeichnen.',
        );
        return;
      }

      const position = await locationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const res = await tripsApi.start({ latitude, longitude });
      const trip = res.data.data;

      await setActiveTrip(trip);
      await locationService.startBackgroundTracking();
    } catch (err) {
      Alert.alert('Fehler', 'Fahrt konnte nicht gestartet werden. Bitte versuche es erneut.');
      console.error('[useActiveTrip] start error:', err);
    } finally {
      setLoading(false);
    }
  }, [setActiveTrip]);

  const stopTrip = useCallback(
    async (purpose: TripPurpose, note?: string): Promise<string | null> => {
      if (!activeTripId) return null;
      setLoading(true);
      try {
        await locationService.stopBackgroundTracking();

        const position = await locationService.getCurrentPosition();
        const { latitude, longitude } = position.coords;

        // Flush any remaining buffered points
        const bufferKey = `${ROUTE_BUFFER_KEY}_${activeTripId}`;
        const bufferRaw = await AsyncStorage.getItem(bufferKey);
        const bufferedPoints = bufferRaw ? JSON.parse(bufferRaw) : [];
        if (bufferedPoints.length > 0) {
          await tripsApi.appendRoute(activeTripId, { points: bufferedPoints });
          await AsyncStorage.removeItem(bufferKey);
        }

        const res = await tripsApi.stop(activeTripId, {
          latitude,
          longitude,
          purpose,
          note,
          routePoints,
        });

        const completedTripId = res.data.data._id;
        await clearActiveTrip();
        queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
        return completedTripId;
      } catch (err) {
        Alert.alert('Fehler', 'Fahrt konnte nicht beendet werden.');
        console.error('[useActiveTrip] stop error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeTripId, routePoints, clearActiveTrip, queryClient],
  );

  return {
    isRecording,
    activeTripId,
    routePoints,
    loading,
    startTrip,
    stopTrip,
    addRoutePoints,
  };
};
