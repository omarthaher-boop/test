import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, TripListParams } from '../api/trips';
import { Trip, TripPurpose } from '../types';

export const TRIPS_QUERY_KEY = ['trips'] as const;

export const useTrips = (params?: TripListParams) => {
  return useQuery({
    queryKey: [...TRIPS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await tripsApi.list(params);
      return res.data;
    },
  });
};

export const useTripDetail = (id: string) => {
  return useQuery({
    queryKey: [...TRIPS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await tripsApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, purpose, note }: { id: string; purpose?: TripPurpose; note?: string }) =>
      tripsApi.update(id, { purpose, note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...TRIPS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
};
