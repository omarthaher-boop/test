import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_LOCATION_TASK, LOCATION_DISTANCE_INTERVAL, LOCATION_TIME_INTERVAL } from '../utils/constants';

export const locationService = {
  async requestPermissions(): Promise<'granted' | 'denied'> {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return 'denied';

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return bg === 'granted' ? 'granted' : 'denied';
  },

  async hasPermissions(): Promise<boolean> {
    const fg = await Location.getForegroundPermissionsAsync();
    const bg = await Location.getBackgroundPermissionsAsync();
    return fg.status === 'granted' && bg.status === 'granted';
  },

  async getCurrentPosition(): Promise<Location.LocationObject> {
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  },

  async startBackgroundTracking(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) return;

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: LOCATION_DISTANCE_INTERVAL,
      timeInterval: LOCATION_TIME_INTERVAL,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Fahrt wird aufgezeichnet',
        notificationBody: 'TripTracker zeichnet deine Route auf.',
        notificationColor: '#3B82F6',
      },
      pausesUpdatesAutomatically: false,
    });
  },

  async stopBackgroundTracking(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (!isRegistered) return;
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length === 0) return null;
      const r = results[0];
      const parts = [r.street, r.streetNumber, r.city].filter(Boolean);
      return parts.join(' ') || r.formattedAddress || null;
    } catch {
      return null;
    }
  },
};
