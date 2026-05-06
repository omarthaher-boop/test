export type TripPurpose = 'private' | 'business' | 'commute';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Trip {
  _id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  startLocation: LocationPoint;
  endLocation: LocationPoint | null;
  routePoints: RoutePoint[];
  distanceKm: number | null;
  shortestRouteKm: number | null;
  shortestRoutePolyline: string | null;
  durationMinutes: number | null;
  purpose: TripPurpose;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  birthDate: string;
  licensePlate: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type TripFilter = 'month' | '3months' | '6months' | 'year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ExportRequest {
  format: 'pdf' | 'csv';
  dateRange?: DateRange;
  recipientEmail?: string;
}
