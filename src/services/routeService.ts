import type { AddressSuggestion, Coordinate, Journey, RouteData, RouteMode } from '../types';
import { cachedRequest } from './transport';
import { isCoordinate } from './validation';
import { currencyForCountry } from './market';

const geocoderUrl = process.env.EXPO_PUBLIC_PHOTON_URL ?? 'https://photon.komoot.io/api/';
const routeUrl = process.env.EXPO_PUBLIC_ROUTE_URL ?? 'https://valhalla1.openstreetmap.de/route';
const routeProvider = (process.env.EXPO_PUBLIC_ROUTE_PROVIDER
  ?? (routeUrl.includes('/route/v1/') ? 'osrm' : 'valhalla')).toLowerCase();

/** Explicit user search only; no background geocoding of stored addresses. */
export async function searchAddresses(query: string, countryCode?: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];
  const countryFilter = countryCode ? `&countrycode=${encodeURIComponent(countryCode.toLowerCase())}` : '';
  const payload = await cachedRequest(`${geocoderUrl}?limit=8${countryFilter}&q=${encodeURIComponent(query.trim())}`, 86400000);
  if (!payload || !Array.isArray(payload.features)) throw new Error('invalidResponse');
  const results: AddressSuggestion[] = [];
  const seen = new Set<string>();
  for (const feature of payload.features) {
    const coordinates = feature?.geometry?.coordinates;
    const [longitude, latitude] = Array.isArray(coordinates) ? coordinates : [];
    const coordinate = { latitude, longitude };
    const p = feature?.properties;
    const resultCountryCode = typeof p?.countrycode === 'string' ? p.countrycode.toUpperCase() : '';
    if (!isCoordinate(coordinate) || !currencyForCountry(resultCountryCode) || (countryCode && resultCountryCode !== countryCode)) continue;
    const label = [...new Set([p.name, [p.housenumber, p.street].filter(Boolean).join(' '), p.city, p.state, p.country]
      .filter((part): part is string => typeof part === 'string' && !!part.trim()))].join(', ');
    const id = `${p.osm_type}/${p.osm_id}/${latitude}/${longitude}`;
    if (label && !seen.has(id)) {
      seen.add(id);
      results.push({ id, label, coordinate, countryCode: resultCountryCode });
    }
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

async function getValhallaRoute(points: Coordinate[], countryCode: string): Promise<RouteData> {
  const mode: RouteMode = countryCode === 'VN' ? 'motorcycle' : 'driving';
  const payload = await cachedRequest(routeUrl, 300000, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locations: points.map(({ latitude, longitude }) => ({ lat: latitude, lon: longitude })),
      costing: mode === 'motorcycle' ? 'motorcycle' : 'auto',
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
  return { coordinates, distanceMeters: summary.length * 1000, durationSeconds: summary.time, mode, countryCode, source: 'live' };
}

async function getOsrmRoute(points: Coordinate[], countryCode: string): Promise<RouteData> {
  const path = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const payload = await cachedRequest(`${routeUrl}/${path}?overview=full&geometries=geojson`, 300000);
  const route = payload?.routes?.[0];
  if (payload?.code !== 'Ok' || !route || !Array.isArray(route.geometry?.coordinates)
    || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0) throw new Error('noRoute');
  const coordinates: Coordinate[] = route.geometry.coordinates.map(([longitude, latitude]: number[]) => ({ latitude, longitude }));
  if (coordinates.length < 2 || coordinates.some((p) => !isCoordinate(p))) throw new Error('unsupportedRegion');
  return { coordinates, distanceMeters: route.distance, durationSeconds: route.duration, mode: 'driving', countryCode, source: 'live' };
}

export async function getRoute(points: Coordinate[], countryCode: string): Promise<RouteData> {
  if (!currencyForCountry(countryCode) || points.length < 2 || points.some((point) => !isCoordinate(point))) throw new Error('unsupportedRegion');
  const route = routeProvider === 'osrm' ? await getOsrmRoute(points, countryCode) : await getValhallaRoute(points, countryCode);
  if (route.coordinates.some((point) => !isCoordinate(point))) throw new Error('unsupportedRegion');
  return route;
}
export function getCommuteRoute(journey: Journey) {
  if (journey.origin.countryCode !== journey.destination.countryCode) throw new Error('unsupportedRegion');
  return getRoute([journey.origin.coordinate, journey.destination.coordinate], journey.origin.countryCode);
}
