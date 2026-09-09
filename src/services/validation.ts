import type { AddressSuggestion, BudgetSettings, Coordinate, Journey, MenuReport, Place, StoredState, Visit } from '../types';

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
    && [p.address, p.cuisine, p.openingHours].every((x) => x === undefined || typeof x === 'string')
    && [p.websiteUrl, p.menuUrl].every((x) => x === undefined || isWebUrl(x));
}
function isWebUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
const defaultBudget: BudgetSettings = { maxVndPerPerson: 50000, dishQuery: '' };
function isBudget(value: unknown): value is BudgetSettings {
  if (!value || typeof value !== 'object') return false;
  const p = value as BudgetSettings;
  return Number.isInteger(p.maxVndPerPerson) && p.maxVndPerPerson > 0 && p.maxVndPerPerson <= 10000000
    && typeof p.dishQuery === 'string' && p.dishQuery.length <= 80;
}
function isMenuReport(value: unknown): value is MenuReport {
  if (!value || typeof value !== 'object') return false;
  const p = value as MenuReport;
  return typeof p.id === 'string' && !!p.id && typeof p.placeId === 'string' && /^(node|way|relation)\/\d+$/.test(p.placeId)
    && typeof p.itemName === 'string' && p.itemName.trim().length > 0 && p.itemName.length <= 120
    && Number.isInteger(p.priceVnd) && p.priceVnd > 0 && p.priceVnd <= 10000000
    && p.source === 'user_report' && Number.isFinite(Date.parse(p.reportedAt));
}
function hasValidCoreState(value: Omit<StoredState, 'version'> & { version?: number }): boolean {
  return (value.journey !== null && !isJourney(value.journey))
    || !Array.isArray(value.saved) || !value.saved.every(isPlace) || !Array.isArray(value.visits)
    || !value.visits.every((v: Visit) => v && typeof v.id === 'string' && isPlace(v.place) && Number.isFinite(Date.parse(v.visitedAt)))
    || typeof value.preferences?.vegetarianOnly !== 'boolean' || typeof value.preferences?.hideVisited !== 'boolean'
    || !['en', 'vi'].includes(value.language) ? false : true;
}
export function parseStoredState(raw: string): StoredState {
  const p = JSON.parse(raw) as Omit<StoredState, 'version'> & { version?: number };
  if (p?.version === 1) {
    if (!hasValidCoreState(p)) throw new Error('storageError');
    return { ...p, version: 2, budget: defaultBudget, reports: [] } as StoredState;
  }
  if (p?.version !== 2 || !hasValidCoreState(p) || !isBudget(p.budget) || !Array.isArray(p.reports) || !p.reports.every(isMenuReport)) throw new Error('storageError');
  return p as StoredState;
}
