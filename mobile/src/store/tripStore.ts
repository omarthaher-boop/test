import { create } from 'zustand';
import { RoutePoint, Trip } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_TRIP_KEY } from '../utils/constants';

interface TripState {
  activeTripId: string | null;
  activeTrip: Trip | null;
  routePoints: RoutePoint[];
  isRecording: boolean;
  startTime: string | null;

  setActiveTrip: (trip: Trip) => Promise<void>;
  addRoutePoints: (points: RoutePoint[]) => void;
  clearActiveTrip: () => Promise<void>;
  restoreActiveTrip: () => Promise<void>;
}

export const useTripStore = create<TripState>((set) => ({
  activeTripId: null,
  activeTrip: null,
  routePoints: [],
  isRecording: false,
  startTime: null,

  setActiveTrip: async (trip) => {
    await AsyncStorage.setItem(ACTIVE_TRIP_KEY, trip._id);
    set({
      activeTripId: trip._id,
      activeTrip: trip,
      routePoints: [],
      isRecording: true,
      startTime: trip.startTime,
    });
  },

  addRoutePoints: (points) =>
    set((state) => ({ routePoints: [...state.routePoints, ...points] })),

  clearActiveTrip: async () => {
    await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);
    set({
      activeTripId: null,
      activeTrip: null,
      routePoints: [],
      isRecording: false,
      startTime: null,
    });
  },

  restoreActiveTrip: async () => {
    const tripId = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
    if (!tripId) return;
    try {
      const { tripsApi } = await import('../api/trips');
      const res = await tripsApi.getById(tripId);
      const trip = res.data.data;
      if (trip.isActive) {
        set({
          activeTripId: trip._id,
          activeTrip: trip,
          routePoints: trip.routePoints,
          isRecording: true,
          startTime: trip.startTime,
        });
      } else {
        await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);
      }
    } catch {
      await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);
    }
  },
}));
