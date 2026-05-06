import { Schema, model, Document, Types } from 'mongoose';

export type TripPurpose = 'private' | 'business' | 'commute';

export interface ILocationPoint {
  latitude: number;
  longitude: number;
  address: string | null;
  timestamp: Date;
}

export interface IRoutePoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  startLocation: ILocationPoint;
  endLocation: ILocationPoint | null;
  routePoints: IRoutePoint[];
  distanceKm: number | null;
  shortestRouteKm: number | null;
  shortestRoutePolyline: string | null;
  durationMinutes: number | null;
  purpose: TripPurpose;
  note: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationPointSchema = new Schema<ILocationPoint>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: null },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const routePointSchema = new Schema<IRoutePoint>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    startLocation: { type: locationPointSchema, required: true },
    endLocation: { type: locationPointSchema, default: null },
    routePoints: { type: [routePointSchema], default: [] },
    distanceKm: { type: Number, default: null },
    shortestRouteKm: { type: Number, default: null },
    shortestRoutePolyline: { type: String, default: null },
    durationMinutes: { type: Number, default: null },
    purpose: {
      type: String,
      enum: ['private', 'business', 'commute'],
      default: 'private',
    },
    note: { type: String, default: null, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tripSchema.index({ userId: 1, startTime: -1 });
tripSchema.index({ userId: 1, isActive: 1 });

export const Trip = model<ITrip>('Trip', tripSchema);
