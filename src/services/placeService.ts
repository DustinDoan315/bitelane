import type { Candidate, Coordinate, Place, RouteData } from '../types';
import { cachedRequest } from './transport';
import { isCoordinate } from './validation';

const overpassUrl = process.env.EXPO_PUBLIC_OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';
export const CORRIDOR_METERS = 750;
export const MAX_ROUTE_METERS = 40000;

/** Distance to the polyline, not a driving detour or ETA. */
export function distanceFromRoute(point: Coordinate, route: Coordinate[]): number {
  const scaleX = 111320 * Math.cos(point.latitude * Math.PI / 180);
  let minimum = Infinity;
  for (let i = 1; i < route.length; i++) {
    const ax = (route[i - 1].longitude - point.longitude) * scaleX;
    const ay = (route[i - 1].latitude - point.latitude) * 111320;
    const bx = (route[i].longitude - point.longitude) * scaleX;
    const by = (route[i].latitude - point.latitude) * 111320;
    const dx = bx - ax, dy = by - ay;
    const length2 = dx * dx + dy * dy;
    const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / length2));
    minimum = Math.min(minimum, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return minimum;
}

export async function findPlaces(route: RouteData): Promise<Candidate[]> {
  if (route.distanceMeters > MAX_ROUTE_METERS) throw new Error('routeTooLong');
  const latitudes = route.coordinates.map((p) => p.latitude);
  const longitudes = route.coordinates.map((p) => p.longitude);
  const south = Math.min(...latitudes), north = Math.max(...latitudes);
  const west = Math.min(...longitudes), east = Math.max(...longitudes);
  if (east - west > 1 || Math.max(Math.abs(south), Math.abs(north)) > 80) throw new Error('unsupportedRegion');
  const dy = CORRIDOR_METERS / 111320;
  const dx = dy / Math.cos(Math.max(Math.abs(south), Math.abs(north)) * Math.PI / 180);
  const bbox = [south - dy, west - dx, north + dy, east + dx].join(',');
  const query = `[out:json][timeout:20];nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["name"](${bbox});out center tags;`;
  const payload = await cachedRequest(overpassUrl, 900000, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ data: query }).toString(),
  });
  if (!Array.isArray(payload?.elements) || payload.remark) throw new Error('serviceUnavailable');
  const seen = new Set<string>();
  const places: Candidate[] = [];
  for (const element of payload.elements) {
    const tags = element.tags;
    const coordinate = { latitude: element.lat ?? element.center?.lat, longitude: element.lon ?? element.center?.lon };
    if (!isCoordinate(coordinate) || typeof tags?.name !== 'string' || !tags.name.trim()
      || !['restaurant', 'cafe', 'fast_food', 'food_court'].includes(tags.amenity)
      || !['node', 'way', 'relation'].includes(element.type) || !Number.isInteger(element.id)) continue;
    const distance = distanceFromRoute(coordinate, route.coordinates);
    if (distance > CORRIDOR_METERS) continue;
    const id = `${element.type}/${element.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const stringTag = (key: string) => typeof tags[key] === 'string' ? tags[key] : undefined;
    const place: Place = {
      id, name: tags.name.trim(), coordinate, category: tags.amenity,
      cuisine: stringTag('cuisine')?.replaceAll(';', ', ').replaceAll('_', ' '),
      address: [stringTag('addr:housenumber'), stringTag('addr:street'), stringTag('addr:city')].filter(Boolean).join(' ') || undefined,
      openingHours: stringTag('opening_hours'),
      vegetarian: ['yes', 'only'].includes(tags['diet:vegetarian']) || ['yes', 'only'].includes(tags['diet:vegan']),
      sourceUrl: `https://www.openstreetmap.org/${id}`, fetchedAt: new Date().toISOString(),
    };
    places.push({ place, distanceFromRouteMeters: distance });
  }
  return places.sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.place.id.localeCompare(b.place.id));
}
