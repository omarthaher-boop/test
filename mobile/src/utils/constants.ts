export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';
export const BACKGROUND_FETCH_TASK = 'BACKGROUND_FETCH_TASK';

export const ACTIVE_TRIP_KEY = 'active_trip_id';
export const ROUTE_BUFFER_KEY = 'route_buffer';
export const GDPR_CONSENTED_KEY = 'gdpr_consented';
export const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const TRIP_FILTERS = [
  { key: 'month', label: 'Letzter Monat' },
  { key: '3months', label: '3 Monate' },
  { key: '6months', label: '6 Monate' },
  { key: 'year', label: 'Dieses Jahr' },
  { key: 'custom', label: 'Zeitraum' },
] as const;

export const PURPOSE_OPTIONS = [
  { value: 'private', label: 'Privat', emoji: '🏠' },
  { value: 'business', label: 'Geschäftlich', emoji: '💼' },
  { value: 'commute', label: 'Arbeitsweg', emoji: '🏢' },
] as const;

export const LOCATION_ACCURACY = {
  FOREGROUND: 6, // Accuracy.BestForNavigation
  BACKGROUND: 4, // Accuracy.Balanced
};

export const LOCATION_DISTANCE_INTERVAL = 10; // meters
export const LOCATION_TIME_INTERVAL = 5000; // ms
export const ROUTE_FLUSH_INTERVAL = 10; // flush every N points
export const PARKED_SPEED_THRESHOLD = 2; // km/h
export const DRIVING_SPEED_THRESHOLD = 15; // km/h for auto-detect

export const TOKEN_REFRESH_BUFFER = 60; // seconds before expiry to refresh
