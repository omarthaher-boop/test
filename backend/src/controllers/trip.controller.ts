import { Request, Response } from 'express';
import { Trip } from '../models/Trip';
import { AppError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { reverseGeocode } from '../utils/geocode';
import { totalDistanceKm } from '../utils/haversine';
import { getShortestRoute } from '../utils/directionsApi';

export const startTrip = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;

  // Check no other active trip
  const activeTrip = await Trip.findOne({ userId: req.user.userId, isActive: true });
  if (activeTrip) throw new AppError('A trip is already in progress', 409);

  const address = await reverseGeocode(latitude, longitude);
  const now = new Date();

  const trip = await Trip.create({
    userId: req.user.userId,
    startTime: now,
    startLocation: { latitude, longitude, address, timestamp: now },
  });

  res.status(201).json({ success: true, data: trip });
});

export const stopTrip = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { latitude, longitude, purpose, note, routePoints } = req.body;

  const trip = await Trip.findOne({ _id: id, userId: req.user.userId, isActive: true });
  if (!trip) throw new AppError('Active trip not found', 404);

  const endTime = new Date();
  const address = await reverseGeocode(latitude, longitude);

  // Merge any final route points from body with stored ones
  if (routePoints?.length) {
    trip.routePoints.push(...routePoints.map((p: any) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      timestamp: new Date(p.timestamp),
    })));
  }

  // Add final point
  trip.routePoints.push({ latitude, longitude, timestamp: endTime });

  const distanceKm = totalDistanceKm(trip.routePoints);
  const durationMinutes = (endTime.getTime() - trip.startTime.getTime()) / 60000;

  // Get shortest route from Google Maps
  const shortestRoute = await getShortestRoute(
    { latitude: trip.startLocation.latitude, longitude: trip.startLocation.longitude },
    { latitude, longitude },
  );

  trip.endTime = endTime;
  trip.endLocation = { latitude, longitude, address, timestamp: endTime };
  trip.distanceKm = distanceKm;
  trip.shortestRouteKm = shortestRoute?.distanceKm ?? null;
  trip.shortestRoutePolyline = shortestRoute?.polyline ?? null;
  trip.durationMinutes = Math.round(durationMinutes * 10) / 10;
  trip.purpose = purpose;
  trip.note = note ?? null;
  trip.isActive = false;

  await trip.save();
  res.json({ success: true, data: trip });
});

export const appendRoute = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { points } = req.body;

  const trip = await Trip.findOne({ _id: id, userId: req.user.userId, isActive: true });
  if (!trip) throw new AppError('Active trip not found', 404);

  trip.routePoints.push(...points.map((p: any) => ({
    latitude: p.latitude,
    longitude: p.longitude,
    timestamp: new Date(p.timestamp),
  })));
  await trip.save();

  res.json({ success: true, data: { added: points.length } });
});

export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, from, to } = req.query as any;

  const filter: Record<string, unknown> = { userId: req.user.userId, isActive: false };
  if (from || to) {
    filter.startTime = {
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .sort({ startTime: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-routePoints'), // exclude heavy route data from list
    Trip.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: trips,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!trip) throw new AppError('Trip not found', 404);
  res.json({ success: true, data: trip });
});

export const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  const { purpose, note } = req.body;
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { ...(purpose && { purpose }), note: note ?? null },
    { new: true },
  );
  if (!trip) throw new AppError('Trip not found', 404);
  res.json({ success: true, data: trip });
});

export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!trip) throw new AppError('Trip not found', 404);
  res.json({ success: true, data: null });
});
