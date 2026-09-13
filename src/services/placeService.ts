import type { Candidate, Coordinate, Place, RouteData } from '../types';
import { cachedRequest } from './transport';
import { isCoordinate, isVietnamCoordinate } from './validation';

const overpassUrl = process.env.EXPO_PUBLIC_OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter';
export const CORRIDOR_METERS = 750;
export const MAX_ROUTE_METERS = 40000;

function webUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value.includes('://') ? value.trim() : `https://${value.trim()}`);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function commonsImageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const fileName = value.trim().replace(/^File:/i, '');
  return fileName ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=240` : undefined;
}

function foodTags(tags: Record<string, unknown>): string[] {
  return ['cuisine', 'dish', 'food', 'description', 'name', 'speciality', 'cuisine:speciality']
    .map((key) => tags[key])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());
}

function ratingNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const parsed = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) return undefined;
  return Math.round(parsed * 10) / 10;
}

function placeRating(tags: Record<string, unknown>): number | undefined {
  return ratingNumber(tags.rating ?? tags['rating:score']);
}

function placeRatingCount(tags: Record<string, unknown>): number | undefined {
  const value = tags['rating:count'] ?? tags.review_count ?? tags['review:count'];
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const parsed = Number(String(value).trim());
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

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
  if (!route.coordinates.length || route.coordinates.some((point) => !isVietnamCoordinate(point))) throw new Error('unsupportedRegion');
  const latitudes = route.coordinates.map((p) => p.latitude);
  const longitudes = route.coordinates.map((p) => p.longitude);
  const south = Math.min(...latitudes), north = Math.max(...latitudes);
  const west = Math.min(...longitudes), east = Math.max(...longitudes);
  if (east - west > 1 || Math.max(Math.abs(south), Math.abs(north)) > 80) throw new Error('unsupportedRegion');
  const dy = CORRIDOR_METERS / 111320;
  const dx = dy / Math.cos(Math.max(Math.abs(south), Math.abs(north)) * Math.PI / 180);
  const bbox = [south - dy, west - dx, north + dy, east + dx].join(',');
  const query = `[out:json][timeout:20];area["ISO3166-1"="VN"]->.vietnam;nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]["name"](${bbox})(area.vietnam);out center tags;`;
  const payload = await cachedRequest(overpassUrl, 900000, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ data: query }).toString(),
  });
  if (!Array.isArray(payload?.elements) || payload.remark) throw new Error('serviceUnavailable');
  const seen = new Set<string>();
  const places: Candidate[] = [];
  for (const element of payload.elements) {
    const tags = element.tags;
    const coordinate = { latitude: element.lat ?? element.center?.lat, longitude: element.lon ?? element.center?.lon };
    if (!isCoordinate(coordinate) || !isVietnamCoordinate(coordinate) || typeof tags?.name !== 'string' || !tags.name.trim()
      || !['restaurant', 'cafe', 'fast_food', 'food_court'].includes(tags.amenity)
      || !['node', 'way', 'relation'].includes(element.type) || !Number.isInteger(element.id)) continue;
    const distance = distanceFromRoute(coordinate, route.coordinates);
    if (distance > CORRIDOR_METERS) continue;
    const id = `${element.type}/${element.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const stringTag = (key: string) => typeof tags[key] === 'string' ? tags[key] : undefined;
    const rating = placeRating(tags);
    const ratingCount = placeRatingCount(tags);
    const place: Place = {
      id, name: tags.name.trim(), coordinate, category: tags.amenity,
      cuisine: stringTag('cuisine')?.replaceAll(';', ', ').replaceAll('_', ' '),
      address: [stringTag('addr:housenumber'), stringTag('addr:street'), stringTag('addr:city')].filter(Boolean).join(' ') || undefined,
      openingHours: stringTag('opening_hours'),
      websiteUrl: webUrl(tags.website ?? tags['contact:website']),
      menuUrl: webUrl(tags.menu ?? tags['contact:menu']),
      imageUrl: webUrl(tags.image) ?? commonsImageUrl(tags.wikimedia_commons),
      foodTags: foodTags(tags),
      ...(rating !== undefined ? { rating } : {}),
      ...(ratingCount !== undefined ? { ratingCount } : {}),
      vegetarian: ['yes', 'only'].includes(tags['diet:vegetarian']) || ['yes', 'only'].includes(tags['diet:vegan']),
      sourceUrl: `https://www.openstreetmap.org/${id}`, fetchedAt: new Date().toISOString(),
    };
    places.push({ place, distanceFromRouteMeters: distance });
  }
  return places.sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.place.id.localeCompare(b.place.id));
}
