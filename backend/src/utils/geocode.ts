let lastCallTime = 0;
const MIN_INTERVAL_MS = 1000; // OSM Nominatim: max 1 req/s

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastCallTime = Date.now();
  return fetch(url, {
    headers: { 'User-Agent': 'TripTrackerApp/1.0 (contact@yourapp.com)' },
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const addr = data.address;
    if (!addr) return data.display_name?.split(',').slice(0, 2).join(',').trim() ?? null;
    const parts = [addr.road, addr.house_number, addr.city ?? addr.town ?? addr.village]
      .filter(Boolean);
    return parts.join(' ') || data.display_name?.split(',')[0] || null;
  } catch {
    return null;
  }
}
