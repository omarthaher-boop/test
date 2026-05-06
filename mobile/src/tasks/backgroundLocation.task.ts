import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_TRIP_KEY, API_BASE_URL, BACKGROUND_LOCATION_TASK, ROUTE_BUFFER_KEY, ROUTE_FLUSH_INTERVAL } from '../utils/constants';
import { RoutePoint } from '../types';

/**
 * Background location task — runs even when the app is killed.
 * IMPORTANT: Must only use bridge-free APIs (fetch, AsyncStorage).
 * No Zustand, no Axios in this context.
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[BG Location] Task error:', error.message);
    return;
  }

  const locationData = data as { locations: Location.LocationObject[] } | null;
  if (!locationData?.locations?.length) return;

  const activeTripId = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
  if (!activeTripId) return;

  const newPoints: RoutePoint[] = locationData.locations.map((loc) => ({
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    timestamp: new Date(loc.timestamp).toISOString(),
  }));

  // Append to local buffer
  const bufferKey = `${ROUTE_BUFFER_KEY}_${activeTripId}`;
  const existing = await AsyncStorage.getItem(bufferKey);
  const buffer: RoutePoint[] = existing ? JSON.parse(existing) : [];
  const updated = [...buffer, ...newPoints];

  // Flush to backend every ROUTE_FLUSH_INTERVAL points
  if (updated.length >= ROUTE_FLUSH_INTERVAL) {
    try {
      const accessToken = await AsyncStorage.getItem('tt_secure_token_cache');
      await fetch(`${API_BASE_URL}/trips/${activeTripId}/route`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ points: updated }),
      });
      await AsyncStorage.setItem(bufferKey, JSON.stringify([]));
    } catch {
      // Keep buffer on flush failure — will retry on next batch
      await AsyncStorage.setItem(bufferKey, JSON.stringify(updated));
    }
  } else {
    await AsyncStorage.setItem(bufferKey, JSON.stringify(updated));
  }

  // Detect parked (speed < 2 km/h for sustained period)
  const lastLoc = locationData.locations[locationData.locations.length - 1];
  const speedKmh = (lastLoc.coords.speed ?? 0) * 3.6;
  if (speedKmh < 2 && speedKmh >= 0) {
    const parkedSince = await AsyncStorage.getItem('parked_since');
    if (!parkedSince) {
      await AsyncStorage.setItem('parked_since', Date.now().toString());
    } else {
      const elapsed = Date.now() - parseInt(parkedSince, 10);
      if (elapsed > 60_000) {
        // Parked for > 60s — send notification
        const { scheduleParkedNotification } = await import('./notificationHelper');
        await scheduleParkedNotification();
        await AsyncStorage.removeItem('parked_since');
      }
    }
  } else {
    await AsyncStorage.removeItem('parked_since');
  }
});
