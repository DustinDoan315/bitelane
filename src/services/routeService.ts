import type { AddressSuggestion, Coordinate, Journey, RouteData } from '../types';
import { cachedRequest } from './transport';
import type { VietnamCity } from './vietnamCityService';
import { isVietnamCoordinate } from './validation';

const geocoderUrl = process.env.EXPO_PUBLIC_PHOTON_URL ?? 'https://photon.komoot.io/api/';
const routeUrl = process.env.EXPO_PUBLIC_ROUTE_URL ?? 'https://valhalla1.openstreetmap.de/route';
const routeProvider = (process.env.EXPO_PUBLIC_ROUTE_PROVIDER
  ?? (routeUrl.includes('/route/v1/') ? 'osrm' : 'valhalla')).toLowerCase();

/** Explicit user search only; no background geocoding of stored addresses. */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];
  const payload = await cachedRequest(`${geocoderUrl}?limit=5&countrycode=VN&q=${encodeURIComponent(query.trim())}`, 86400000);
  if (!payload || !Array.isArray(payload.features)) throw new Error('invalidResponse');
  const results: AddressSuggestion[] = [];
  const seen = new Set<string>();
  for (const feature of payload.features) {
    const coordinates = feature?.geometry?.coordinates;
    const [longitude, latitude] = Array.isArray(coordinates) ? coordinates : [];
    const coordinate = { latitude, longitude };
    const p = feature?.properties;
    if (!isVietnamCoordinate(coordinate) || p?.countrycode?.toUpperCase() !== 'VN') continue;
    const label = [...new Set([p.name, [p.housenumber, p.street].filter(Boolean).join(' '), p.city, p.state, p.country]
      .filter((part): part is string => typeof part === 'string' && !!part.trim()))].join(', ');
    const id = `${p.osm_type}/${p.osm_id}/${latitude}/${longitude}`;
    if (label && !seen.has(id)) {
      seen.add(id);
      results.push({ id, label, coordinate, countryCode: 'VN' });
    }
  }
  return results;
}

export async function searchCities(query: string): Promise<VietnamCity[]> {
  const normalized = query.trim();
  if (normalized.length < 2) return [];
  const payload = await cachedRequest(`${geocoderUrl}?limit=8&countrycode=VN&osm_tag=place:city&q=${encodeURIComponent(normalized)}`, 86400000);
  if (!payload || !Array.isArray(payload.features)) throw new Error('invalidResponse');
  const results: VietnamCity[] = [];
  const seen = new Set<string>();
  for (const feature of payload.features) {
    const coordinates = feature?.geometry?.coordinates;
    const [longitude, latitude] = Array.isArray(coordinates) ? coordinates : [];
    const p = feature?.properties;
    if (!isVietnamCoordinate({ latitude, longitude }) || p?.countrycode?.toUpperCase() !== 'VN'
      || p?.osm_key !== 'place' || !['city', 'town'].includes(p.osm_value) || typeof p.name !== 'string' || !p.name.trim()) continue;
    const id = `${p.osm_type}/${p.osm_id}/${latitude}/${longitude}`;
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({
      id,
      label: [p.name, p.state].filter((part): part is string => typeof part === 'string' && !!part.trim()).join(', '),
      searchName: p.name.trim(),
    });
  }
  return results;
}

function decodePolyline(encoded: string, precision = 6): Coordinate[] {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const factor = 10 ** precision;
  const coordinates: Coordinate[] = [];
  const decodeValue = () => {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      if (index >= encoded.length) throw new Error('noRoute');
      byte = encoded.charCodeAt(index++) - 63;
      result += (byte & 0x1f) * (2 ** shift);
      shift += 5;
    } while (byte >= 0x20);
    return result % 2 === 1 ? -((result + 1) / 2) : result / 2;
  };
  while (index < encoded.length) {
    latitude += decodeValue();
    longitude += decodeValue();
    coordinates.push({ latitude: latitude / factor, longitude: longitude / factor });
  }
  return coordinates;
}

async function getValhallaRoute(points: Coordinate[]): Promise<RouteData> {
  const payload = await cachedRequest(routeUrl, 300000, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locations: points.map(({ latitude, longitude }) => ({ lat: latitude, lon: longitude })),
      costing: 'motorcycle',
      units: 'kilometers',
    }),
  });
  const summary = payload?.trip?.summary;
  const legs = Array.isArray(payload?.trip?.legs) ? payload.trip.legs : [];
  const coordinates = legs.flatMap((leg: { shape?: unknown }, index: number) => {
    if (typeof leg.shape !== 'string') return [];
    const decoded = decodePolyline(leg.shape);
    return index === 0 ? decoded : decoded.slice(1);
  });
  const status = payload?.trip?.status ?? payload?.status;
  if (status !== 0 || !summary || !Number.isFinite(summary.length) || summary.length < 0
    || !Number.isFinite(summary.time) || summary.time < 0 || coordinates.length < 2) throw new Error('noRoute');
  return { coordinates, distanceMeters: summary.length * 1000, durationSeconds: summary.time, mode: 'motorcycle', source: 'live' };
}

async function getOsrmRoute(points: Coordinate[]): Promise<RouteData> {
  const path = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const payload = await cachedRequest(`${routeUrl}/${path}?overview=full&geometries=geojson`, 300000);
  const route = payload?.routes?.[0];
  if (payload?.code !== 'Ok' || !route || !Array.isArray(route.geometry?.coordinates)
    || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0) throw new Error('noRoute');
  const coordinates: Coordinate[] = route.geometry.coordinates.map(([longitude, latitude]: number[]) => ({ latitude, longitude }));
  if (coordinates.length < 2 || coordinates.some((p) => !isVietnamCoordinate(p))) throw new Error('unsupportedRegion');
  return { coordinates, distanceMeters: route.distance, durationSeconds: route.duration, mode: 'driving', source: 'live' };
}

export async function getRoute(points: Coordinate[]): Promise<RouteData> {
  if (points.length < 2 || points.some((point) => !isVietnamCoordinate(point))) throw new Error('unsupportedRegion');
  const route = routeProvider === 'osrm' ? await getOsrmRoute(points) : await getValhallaRoute(points);
  if (route.coordinates.some((point) => !isVietnamCoordinate(point))) throw new Error('unsupportedRegion');
  return route;
}
export function getCommuteRoute(journey: Journey) {
  return getRoute([journey.origin.coordinate, journey.destination.coordinate]);
}
