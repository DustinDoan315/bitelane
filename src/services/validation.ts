import type { AddressSuggestion, BudgetSettings, Coordinate, CurrencyCode, Journey, MenuReport, Place, StoredState, Visit } from '../types';
import { currencyForCountry, normalizeCurrencyAmount } from './market';

export function isCoordinate(value: unknown): value is Coordinate {
  if (!value || typeof value !== 'object') return false;
  const p = value as Coordinate;
  return Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90
    && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
}

const isCountryCode = (value: unknown): value is string => typeof value === 'string' && /^[A-Z]{2}$/.test(value) && !!currencyForCountry(value);
const isCurrency = (value: unknown): value is CurrencyCode => ['VND', 'GBP', 'EUR', 'USD'].includes(String(value));

function isAddress(value: unknown): value is AddressSuggestion {
  if (!value || typeof value !== 'object') return false;
  const p = value as AddressSuggestion;
  return typeof p.id === 'string' && typeof p.label === 'string' && !!p.label && isCoordinate(p.coordinate) && isCountryCode(p.countryCode);
}
export function isJourney(value: unknown): value is Journey {
  if (!value || typeof value !== 'object') return false;
  const p = value as Journey;
  return isAddress(p.origin) && isAddress(p.destination) && p.origin.countryCode === p.destination.countryCode;
}
function isWebUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false;
  const p = value as Place;
  return typeof p.id === 'string' && /^(node|way|relation)\/\d+$/.test(p.id)
    && typeof p.name === 'string' && !!p.name && isCoordinate(p.coordinate) && isCountryCode(p.countryCode)
    && ['restaurant', 'cafe', 'fast_food', 'food_court'].includes(p.category)
    && typeof p.vegetarian === 'boolean' && Number.isFinite(Date.parse(p.fetchedAt))
    && p.sourceUrl === `https://www.openstreetmap.org/${p.id}`
    && [p.address, p.cuisine, p.openingHours].every((x) => x === undefined || typeof x === 'string')
    && (p.foodTags === undefined || (Array.isArray(p.foodTags) && p.foodTags.every((x) => typeof x === 'string')))
    && [p.websiteUrl, p.menuUrl, p.imageUrl].every((x) => x === undefined || isWebUrl(x));
}
function isBudget(value: unknown): value is BudgetSettings {
  if (!value || typeof value !== 'object') return false;
  const p = value as BudgetSettings;
  return Number.isFinite(p.maxPerPerson) && p.maxPerPerson > 0 && p.maxPerPerson <= 10000000
    && isCurrency(p.currency) && isCountryCode(p.countryCode) && currencyForCountry(p.countryCode) === p.currency
    && p.maxPerPerson === normalizeCurrencyAmount(p.maxPerPerson, p.currency)
    && typeof p.dishQuery === 'string' && p.dishQuery.length <= 80;
}
function isMenuReport(value: unknown): value is MenuReport {
  if (!value || typeof value !== 'object') return false;
  const p = value as MenuReport;
  return typeof p.id === 'string' && !!p.id && typeof p.placeId === 'string' && /^(node|way|relation)\/\d+$/.test(p.placeId)
    && typeof p.itemName === 'string' && p.itemName.trim().length > 0 && p.itemName.length <= 120
    && Number.isFinite(p.amount) && p.amount > 0 && p.amount <= 10000000
    && isCurrency(p.currency) && p.amount === normalizeCurrencyAmount(p.amount, p.currency)
    && p.source === 'user_report' && Number.isFinite(Date.parse(p.reportedAt));
}
function isCoreState(value: Record<string, unknown>) {
  const preferences = value.preferences as any;
  return (value.journey === null || isJourney(value.journey))
    && Array.isArray(value.saved) && value.saved.every(isPlace)
    && Array.isArray(value.visits) && value.visits.every((visit: Visit) => visit && typeof visit.id === 'string' && isPlace(visit.place) && Number.isFinite(Date.parse(visit.visitedAt)))
    && typeof preferences?.vegetarianOnly === 'boolean'
    && typeof preferences?.hideVisited === 'boolean'
    && [5, 10, 15, 20, 30].includes(preferences?.maxDetourMinutes)
    && ['en', 'vi'].includes(String(value.language));
}
function withLegacyCountryCode<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  const item = value as Record<string, any>;
  if (item.coordinate && item.name) return { ...item, countryCode: item.countryCode ?? 'VN' } as T;
  if (item.coordinate && item.label) return { ...item, countryCode: item.countryCode ?? 'VN' } as T;
  return value;
}
function migrateLegacyCore(p: Record<string, any>) {
  return {
    ...p,
    language: p.language,
    preferences: { ...p.preferences, maxDetourMinutes: p.preferences?.maxDetourMinutes ?? 10 },
    journey: p.journey ? {
      ...p.journey,
      origin: withLegacyCountryCode(p.journey.origin),
      destination: withLegacyCountryCode(p.journey.destination),
    } : null,
    saved: Array.isArray(p.saved) ? p.saved.map(withLegacyCountryCode) : p.saved,
    visits: Array.isArray(p.visits) ? p.visits.map((visit: any) => ({ ...visit, place: withLegacyCountryCode(visit.place) })) : p.visits,
  };
}

export function parseStoredState(raw: string): StoredState {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') throw new Error('storageError');
  const p = parsed as Record<string, any>;
  if (p.version === 1 || p.version === 2) {
    if (p.hasSeenOnboarding !== undefined && typeof p.hasSeenOnboarding !== 'boolean') throw new Error('storageError');
    const migrated = migrateLegacyCore(p);
    if (!isCoreState(migrated)) throw new Error('storageError');
    if (p.version === 1) {
      return { ...migrated, version: 3, language: migrated.language, budget: { maxPerPerson: 50000, currency: 'VND', countryCode: 'VN', dishQuery: '' }, reports: [], hasSeenOnboarding: p.hasSeenOnboarding ?? true } as StoredState;
    }
    const oldBudget = p.budget;
    if (!oldBudget || !Number.isInteger(oldBudget.maxVndPerPerson) || oldBudget.maxVndPerPerson <= 0 || oldBudget.maxVndPerPerson > 10000000
      || typeof oldBudget.dishQuery !== 'string' || oldBudget.dishQuery.length > 80 || !Array.isArray(p.reports)
      || !p.reports.every((report: any) => report && typeof report.id === 'string' && !!report.id && typeof report.placeId === 'string' && /^(node|way|relation)\/\d+$/.test(report.placeId)
        && typeof report.itemName === 'string' && report.itemName.trim().length > 0 && report.itemName.length <= 120
        && Number.isInteger(report.priceVnd) && report.priceVnd > 0 && report.priceVnd <= 10000000
        && report.source === 'user_report' && Number.isFinite(Date.parse(report.reportedAt)))) throw new Error('storageError');
    return {
      ...migrated,
      version: 3,
      budget: { maxPerPerson: oldBudget.maxVndPerPerson, currency: 'VND', countryCode: 'VN', dishQuery: oldBudget.dishQuery },
      reports: p.reports.map((report: any) => ({ ...report, amount: report.priceVnd, currency: 'VND' })),
      hasSeenOnboarding: p.hasSeenOnboarding ?? true,
    } as StoredState;
  }
  if (p.version !== 3 || !isCoreState(p) || !isBudget(p.budget)
    || (p.journey !== null && p.budget.countryCode !== p.journey.origin.countryCode) || !Array.isArray(p.reports)
    || !p.reports.every(isMenuReport) || (p.hasSeenOnboarding !== undefined && typeof p.hasSeenOnboarding !== 'boolean')) throw new Error('storageError');
  return { ...p, hasSeenOnboarding: p.hasSeenOnboarding ?? true } as StoredState;
}
