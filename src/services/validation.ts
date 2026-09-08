import type { AddressSuggestion, Coordinate, Journey, Place, StoredState, Visit } from '../types';

export function isCoordinate(value: unknown): value is Coordinate {
  if (!value || typeof value !== 'object') return false;
  const p = value as Coordinate;
  return Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90
    && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
}
function isAddress(value: unknown): value is AddressSuggestion {
  if (!value || typeof value !== 'object') return false;
  const p = value as AddressSuggestion;
  return typeof p.id === 'string' && typeof p.label === 'string' && !!p.label && isCoordinate(p.coordinate);
}
export function isJourney(value: unknown): value is Journey {
  if (!value || typeof value !== 'object') return false;
  const p = value as Journey;
  return isAddress(p.origin) && isAddress(p.destination);
}
function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false;
  const p = value as Place;
  return typeof p.id === 'string' && /^(node|way|relation)\/\d+$/.test(p.id)
    && typeof p.name === 'string' && !!p.name && isCoordinate(p.coordinate)
    && ['restaurant', 'cafe', 'fast_food', 'food_court'].includes(p.category)
    && typeof p.vegetarian === 'boolean' && Number.isFinite(Date.parse(p.fetchedAt))
    && p.sourceUrl === `https://www.openstreetmap.org/${p.id}`
    && [p.address, p.cuisine, p.openingHours].every((x) => x === undefined || typeof x === 'string');
}
export function parseStoredState(raw: string): StoredState {
  const p = JSON.parse(raw) as StoredState;
  if (p?.version !== 1 || (p.journey !== null && !isJourney(p.journey))
    || !Array.isArray(p.saved) || !p.saved.every(isPlace) || !Array.isArray(p.visits)
    || !p.visits.every((v: Visit) => v && typeof v.id === 'string' && isPlace(v.place) && Number.isFinite(Date.parse(v.visitedAt)))
    || typeof p.preferences?.vegetarianOnly !== 'boolean' || typeof p.preferences?.hideVisited !== 'boolean'
    || !['en', 'vi'].includes(p.language)) throw new Error('storageError');
  return p;
}
