import type { CommutePreferences, Coordinate, RouteData } from '../types';

const geocoderUrl = process.env.EXPO_PUBLIC_GEOCODER_URL ?? 'https://nominatim.openstreetmap.org/search';
const routeUrl = process.env.EXPO_PUBLIC_ROUTE_URL ?? 'https://router.project-osrm.org/route/v1/driving';

const defaultHome: Coordinate = { latitude: 10.73287, longitude: 106.708003 };
const defaultWork: Coordinate = { latitude: 10.7862, longitude: 106.6962 };

const knownLocations: Record<string, Coordinate> = {
  '123 nguyen van linh quan 7': defaultHome,
  '18 nguyen dinh chieu quan 3': defaultWork,
};

type NominatimResult = { lat?: string; lon?: string };

export type AddressSuggestion = {
  id: string;
  label: string;
  coordinate?: Coordinate;
};

function normalizeAddress(address: string) {
  return address
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveAddress(address: string): Promise<Coordinate | null> {
  const normalized = normalizeAddress(address);
  const known = knownLocations[normalized];

  if (known) {
    return known;
  }

  if (normalized.length < 3) {
    return null;
  }

  const query = `${address}, Ho Chi Minh City, Vietnam`;
  const response = await fetchWithTimeout(
    `${geocoderUrl}?format=jsonv2&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];
  const latitude = Number(result?.lat);
  const longitude = Number(result?.lon);

  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (normalizeAddress(query).length < 3) {
    return [];
  }

  const searchQuery = `${query}, Ho Chi Minh City, Vietnam`;
  const response = await fetchWithTimeout(
    `${geocoderUrl}?format=jsonv2&limit=5&countrycodes=vn&q=${encodeURIComponent(searchQuery)}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    return [];
  }

  const results = (await response.json()) as Array<NominatimResult & { display_name?: string; place_id?: number }>;

  return results.flatMap((result, index) => {
    const label = result.display_name?.trim();
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return [];
    }

    return [{
      id: String(result.place_id ?? `${label}-${index}`),
      label,
      coordinate: { latitude, longitude },
    }];
  });
}

function toCoordinates(value: unknown): Coordinate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((point) => {
    if (!Array.isArray(point) || point.length < 2) {
      return [];
    }

    const longitude = Number(point[0]);
    const latitude = Number(point[1]);

    return Number.isFinite(latitude) && Number.isFinite(longitude) ? [{ latitude, longitude }] : [];
  });
}

export function getFallbackRoute(preferences: CommutePreferences): RouteData {
  const origin = knownLocations[normalizeAddress(preferences.homeAddress)] ?? defaultHome;
  const destination = knownLocations[normalizeAddress(preferences.workAddress)] ?? defaultWork;
  const midpoint: Coordinate = {
    latitude: (origin.latitude + destination.latitude) / 2 + 0.002,
    longitude: (origin.longitude + destination.longitude) / 2 - 0.001,
  };

  return {
    coordinates: [origin, midpoint, destination],
    distanceMeters: 9074,
    durationSeconds: 632,
    source: 'fallback',
  };
}

export async function getCommuteRoute(preferences: CommutePreferences): Promise<RouteData> {
  const [origin, destination] = await Promise.all([
    resolveAddress(preferences.homeAddress),
    resolveAddress(preferences.workAddress),
  ]);

  if (!origin || !destination) {
    throw new Error('Unable to find one or both addresses.');
  }

  const response = await fetchWithTimeout(
    `${routeUrl}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
  );

  if (!response.ok) {
    throw new Error('The route service is unavailable.');
  }

  const payload = (await response.json()) as {
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: unknown };
    }>;
  };
  const route = payload.routes?.[0];
  const coordinates = toCoordinates(route?.geometry?.coordinates);

  if (!route || coordinates.length < 2 || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) {
    throw new Error('The route service returned an invalid route.');
  }

  const distanceMeters = route.distance as number;
  const durationSeconds = route.duration as number;

  return {
    coordinates,
    distanceMeters,
    durationSeconds,
    source: 'live',
  };
}
