import type { AddressSuggestion, Coordinate, Journey, RouteData } from '../types';
import { cachedRequest } from './transport';
import { isCoordinate } from './validation';

const geocoderUrl = process.env.EXPO_PUBLIC_PHOTON_URL ?? 'https://photon.komoot.io/api/';
const routeUrl = process.env.EXPO_PUBLIC_ROUTE_URL ?? 'https://router.project-osrm.org/route/v1/driving';

/** Explicit user search only; no background geocoding of stored addresses. */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];
  const payload = await cachedRequest(`${geocoderUrl}?limit=5&q=${encodeURIComponent(query.trim())}`, 86400000);
  if (!payload || !Array.isArray(payload.features)) throw new Error('invalidResponse');
  const results: AddressSuggestion[] = [];
  for (const feature of payload.features) {
    const [longitude, latitude] = feature.geometry?.coordinates ?? [];
    const coordinate = { latitude, longitude };
    const p = feature.properties;
    if (!isCoordinate(coordinate) || !p) continue;
    const label = [...new Set([p.name, [p.housenumber, p.street].filter(Boolean).join(' '), p.city, p.state, p.country]
      .filter((part): part is string => typeof part === 'string' && !!part.trim()))].join(', ');
    if (label) results.push({ id: `${p.osm_type}/${p.osm_id}/${latitude}/${longitude}`, label, coordinate });
  }
  return results;
}

export async function getRoute(points: Coordinate[]): Promise<RouteData> {
  if (points.length < 2 || points.some((point) => !isCoordinate(point))) throw new Error('selectAddresses');
  const path = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const payload = await cachedRequest(`${routeUrl}/${path}?overview=full&geometries=geojson`, 300000);
  const route = payload?.routes?.[0];
  if (payload?.code !== 'Ok' || !route || !Array.isArray(route.geometry?.coordinates)
    || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0) throw new Error('noRoute');
  const coordinates: Coordinate[] = route.geometry.coordinates.map(([longitude, latitude]: number[]) => ({ latitude, longitude }));
  if (coordinates.length < 2 || coordinates.some((p) => !isCoordinate(p))) throw new Error('invalidResponse');
  return { coordinates, distanceMeters: route.distance, durationSeconds: route.duration, source: 'live' };
}
export function getCommuteRoute(journey: Journey) {
  return getRoute([journey.origin.coordinate, journey.destination.coordinate]);
}
