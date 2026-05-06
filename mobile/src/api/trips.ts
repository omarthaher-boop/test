import apiClient from './client';
import { ApiResponse, PaginatedResponse, RoutePoint, Trip, TripPurpose } from '../types';

export interface StartTripPayload {
  latitude: number;
  longitude: number;
}

export interface StopTripPayload {
  latitude: number;
  longitude: number;
  purpose: TripPurpose;
  note?: string;
  routePoints?: RoutePoint[];
}

export interface UpdateTripPayload {
  purpose?: TripPurpose;
  note?: string;
}

export interface TripListParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface AppendRoutePayload {
  points: RoutePoint[];
}

export const tripsApi = {
  start: (payload: StartTripPayload) =>
    apiClient.post<ApiResponse<Trip>>('/trips/start', payload),

  stop: (id: string, payload: StopTripPayload) =>
    apiClient.patch<ApiResponse<Trip>>(`/trips/${id}/stop`, payload),

  appendRoute: (id: string, payload: AppendRoutePayload) =>
    apiClient.patch<ApiResponse<{ added: number }>>(`/trips/${id}/route`, payload),

  list: (params?: TripListParams) =>
    apiClient.get<PaginatedResponse<Trip>>('/trips', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Trip>>(`/trips/${id}`),

  update: (id: string, payload: UpdateTripPayload) =>
    apiClient.patch<ApiResponse<Trip>>(`/trips/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/trips/${id}`),
};
