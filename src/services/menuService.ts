import type { BudgetSettings, Candidate, FoodOffer, MenuReport } from '../types';

const normalizeFood = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

export function findFoodOffers(candidates: Candidate[], reports: MenuReport[], budget: BudgetSettings): FoodOffer[] {
  const places = new Map(candidates.map((candidate) => [candidate.place.id, candidate]));
  const latest = new Map<string, MenuReport>();
  for (const report of reports) {
    if (!places.has(report.placeId)) continue;
    const key = `${report.placeId}/${report.currency}/${normalizeFood(report.itemName)}`;
    const previous = latest.get(key);
    if (!previous || Date.parse(report.reportedAt) > Date.parse(previous.reportedAt)) latest.set(key, report);
  }

  const query = normalizeFood(budget.dishQuery);
  return [...latest.values()]
    .filter((report) => report.currency === budget.currency && (!query || normalizeFood(report.itemName).includes(query)))
    .flatMap((report) => {
      const candidate = places.get(report.placeId);
      return candidate ? [{
        id: report.id,
        placeId: report.placeId,
        itemName: report.itemName,
        amount: report.amount,
        currency: report.currency,
        evidence: 'user_report' as const,
        withinBudget: report.amount <= budget.maxPerPerson,
        reportedAt: report.reportedAt,
        ...candidate,
      }] : [];
    })
    .sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters || a.amount - b.amount);
}
