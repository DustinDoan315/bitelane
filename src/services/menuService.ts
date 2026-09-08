import type { BudgetSettings, Candidate, FoodOffer, MenuReport } from '../types';

const normalize = (value: string) => value
  .toLocaleLowerCase('vi-VN')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .trim();

/**
 * Matches only explicit price reports to mapped places on the active route.
 * A report is intentionally not promoted to a verified menu item.
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
  return [...latest.values()]
    .map((report) => ({ ...report, ...places.get(report.placeId)! }))
    .sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.priceVnd - b.priceVnd);
}
