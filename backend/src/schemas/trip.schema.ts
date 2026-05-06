import { z } from 'zod';

export const startTripSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const stopTripSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  purpose: z.enum(['private', 'business', 'commute']),
  note: z.string().max(500).optional(),
  routePoints: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string().datetime(),
  })).optional(),
});

export const appendRouteSchema = z.object({
  points: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string().datetime(),
  })).min(1),
});

export const updateTripSchema = z.object({
  purpose: z.enum(['private', 'business', 'commute']).optional(),
  note: z.string().max(500).nullable().optional(),
});

export const tripListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const exportQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const emailExportSchema = z.object({
  format: z.enum(['pdf', 'csv']),
  recipientEmail: z.string().email(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
