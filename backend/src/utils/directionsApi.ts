import { env } from '../config/env';

interface DirectionsResult {
  distanceKm: number;
  polyline: string;
}

interface LocationPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calls Google Maps Directions API to get the shortest driving route
 * between two coordinates. Returns null if the API key is not set
 * or the request fails.
 */
export async function getShortestRoute(
  origin: LocationPoint,
  destination: LocationPoint,
): Promise<DirectionsResult | null> {
  if (!env.GOOGLE_DIRECTIONS_API_KEY) return null;

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`);
    url.searchParams.set('destination', `${destination.latitude},${destination.longitude}`);
    url.searchParams.set('mode', 'driving');
    url.searchParams.set('key', env.GOOGLE_DIRECTIONS_API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const json = (await res.json()) as any;
    if (json.status !== 'OK' || !json.routes?.length) return null;

    const route = json.routes[0];
    const distanceMeters: number = route.legs.reduce(
      (sum: number, leg: any) => sum + leg.distance.value,
      0,
    );
    const polyline: string = route.overview_polyline.points;

    return {
      distanceKm: Math.round((distanceMeters / 1000) * 100) / 100,
      polyline,
    };
  } catch {
    return null;
  }
}
