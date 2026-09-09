import type { BudgetSettings, Candidate, FoodOffer, MenuReport, Place, PriceRangeVnd } from '../types';
import { getCanonicalFoodLabel, getEstimatedFoodName } from './foodSuggestionService';

const normalize = (value: string) => value
  .toLocaleLowerCase('vi-VN')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .trim();

const categoryRanges: Record<Place['category'], PriceRangeVnd> = {
  cafe: { min: 25000, max: 85000 },
  fast_food: { min: 30000, max: 90000 },
  food_court: { min: 35000, max: 100000 },
  restaurant: { min: 45000, max: 160000 },
};

const lowerCostCuisine = /bakery|banh.mi|coffee|dessert|noodle|pho|rice|sandwich|tea|vietnamese/;
const higherCostCuisine = /bbq|french|hotpot|italian|japanese|korean|seafood|steak|sushi/;
const MAX_ESTIMATED_OFFERS = 40;

const roundToFiveThousand = (value: number) => Math.round(value / 5000) * 5000;

/** A deterministic, deliberately broad prototype estimate; never presented as a reported menu price. */
export function estimateMealPriceRange(place: Place): PriceRangeVnd {
  const base = categoryRanges[place.category];
  const cuisine = normalize(place.cuisine ?? '');
  const multiplier = higherCostCuisine.test(cuisine) ? 1.2 : lowerCostCuisine.test(cuisine) ? 0.85 : 1;
  let hash = 0;
  for (const character of place.id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const variation = 0.9 + (hash % 5) * 0.05;
  return {
    min: Math.max(15000, roundToFiveThousand(base.min * multiplier * variation)),
    max: roundToFiveThousand(base.max * multiplier * variation),
  };
}

/**
 * Exact local reports take priority. Blank queries and known food suggestions
 * use clearly labeled estimates to keep a fresh install useful without inventing
 * a verified menu item.
 */
export function findFoodOffers(candidates: Candidate[], reports: MenuReport[], budget: BudgetSettings): FoodOffer[] {
  const places = new Map(candidates.map((candidate) => [candidate.place.id, candidate]));
  const query = normalize(budget.dishQuery);
  const latest = new Map<string, MenuReport>();
  for (const report of reports) {
    const candidate = places.get(report.placeId);
    if (!candidate || report.priceVnd > budget.maxVndPerPerson) continue;
    if (query && !normalize(report.itemName).includes(query)) continue;
    const key = `${report.placeId}/${normalize(report.itemName)}`;
    const previous = latest.get(key);
    if (!previous || Date.parse(report.reportedAt) > Date.parse(previous.reportedAt)) latest.set(key, report);
  }
  const reportedOffers: FoodOffer[] = [...latest.values()]
    .map((report) => {
      const candidate = places.get(report.placeId)!;
      return {
        id: report.id,
        placeId: report.placeId,
        itemName: report.itemName,
        priceRangeVnd: { min: report.priceVnd, max: report.priceVnd },
        evidence: 'user_report' as const,
        fit: 'exact' as const,
        reportedAt: report.reportedAt,
        ...candidate,
      };
    })
    .sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.priceRangeVnd.min - b.priceRangeVnd.min);

  const placesWithReportedMatches = new Set(reportedOffers.map((offer) => offer.placeId));
  const requestedFood = query ? getCanonicalFoodLabel(budget.dishQuery) : undefined;
  if (query && !requestedFood) return reportedOffers;

  const estimatedOffers: FoodOffer[] = candidates.flatMap((candidate) => {
    if (placesWithReportedMatches.has(candidate.place.id)) return [];
    const priceRangeVnd = estimateMealPriceRange(candidate.place);
    if (priceRangeVnd.min > budget.maxVndPerPerson) return [];
    return [{
      id: `estimate/${candidate.place.id}/${requestedFood ? normalize(requestedFood) : 'any'}`,
      placeId: candidate.place.id,
      ...(requestedFood ? { requestedFood } : {}),
      ...(!requestedFood ? { suggestedFood: getEstimatedFoodName(candidate.place.id) } : {}),
      priceRangeVnd,
      evidence: 'estimated' as const,
      fit: priceRangeVnd.max <= budget.maxVndPerPerson ? 'likely' as const : 'possible' as const,
      ...candidate,
    }];
  }).sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.priceRangeVnd.min - b.priceRangeVnd.min)
    .slice(0, MAX_ESTIMATED_OFFERS);

  return [...reportedOffers, ...estimatedOffers];
}
