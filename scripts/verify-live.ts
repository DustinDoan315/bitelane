import assert from 'node:assert/strict';
import { searchAddresses, getCommuteRoute, getRoute } from '../src/services/routeService';
import { findPlaces, CORRIDOR_METERS } from '../src/services/placeService';
import { findFoodOffers } from '../src/services/menuService';
import { getNavigationUrl } from '../src/services/navigationService';
import { parseStoredState } from '../src/services/validation';

// All geography and place records come from real providers, supplied by CLI queries.
// Run intentionally: this sends the two search strings to external map services.
async function main() {
  const [start, end] = process.argv.slice(2);
  if (!start || !end) throw new Error('Usage: npm run verify:live -- "origin, city" "destination, city"');
  const origins = await searchAddresses(start);
  const destinations = await searchAddresses(end);
  assert.ok(origins.length && destinations.length, 'Both live address searches must return results');
  const journey = { origin: origins[0], destination: destinations[0] };
  const route = await getCommuteRoute(journey);
  console.log('Resolved live journey:', journey.origin.label, '→', journey.destination.label, `(${(route.distanceMeters / 1000).toFixed(1)} km)`);
  assert.ok(route.coordinates.length > 1 && route.distanceMeters > 0 && route.durationSeconds > 0);
  const candidates = await findPlaces(route);
  assert.ok(candidates.length, 'Use a food-serving corridor for this smoke check; provider coverage may be empty');
  assert.ok(candidates.every((c) => c.distanceFromRouteMeters <= CORRIDOR_METERS));
  const estimatedOffers = findFoodOffers(candidates, [], { maxVndPerPerson: 100000, dishQuery: '' });
  assert.ok(estimatedOffers.length, 'A common meal budget should return clearly labeled estimates on a fresh install');
  assert.ok(estimatedOffers.length <= 40, 'Estimated fallback results should stay bounded for the mobile list');
  assert.ok(estimatedOffers.every((offer) => offer.evidence === 'estimated' && offer.priceRangeVnd.min <= 100000 && offer.suggestedFood));
  const comEstimatedOffers = findFoodOffers(candidates, [], { maxVndPerPerson: 100000, dishQuery: 'com' });
  const phoEstimatedOffers = findFoodOffers(candidates, [], { maxVndPerPerson: 100000, dishQuery: 'pho' });
  assert.ok(comEstimatedOffers.length && comEstimatedOffers.every((offer) => offer.evidence === 'estimated' && offer.requestedFood === 'Cơm tấm'));
  assert.ok(phoEstimatedOffers.length && phoEstimatedOffers.every((offer) => offer.evidence === 'estimated' && offer.requestedFood === 'Phở'));
  const place = candidates[0].place;
  const report = { id: 'live-report', placeId: place.id, itemName: 'Test meal', priceVnd: 45000, reportedAt: new Date().toISOString(), source: 'user_report' as const };
  const reportedOffers = findFoodOffers(candidates, [report], { maxVndPerPerson: 50000, dishQuery: 'test' });
  assert.equal(reportedOffers[0]?.evidence, 'user_report');
  assert.equal(reportedOffers[0]?.priceRangeVnd.min, 45000);
  const VietnameseDishReports = [
    { id: 'live-com', placeId: place.id, itemName: 'Cơm tấm', priceVnd: 45000, reportedAt: new Date().toISOString(), source: 'user_report' as const },
    { id: 'live-pho', placeId: place.id, itemName: 'Phở', priceVnd: 50000, reportedAt: new Date().toISOString(), source: 'user_report' as const },
  ];
  const comOffers = findFoodOffers(candidates, VietnameseDishReports, { maxVndPerPerson: 50000, dishQuery: 'com' });
  const phoOffers = findFoodOffers(candidates, VietnameseDishReports, { maxVndPerPerson: 50000, dishQuery: 'pho' });
  assert.equal(comOffers[0]?.itemName, 'Cơm tấm');
  assert.equal(phoOffers[0]?.itemName, 'Phở');
  const stop = await getRoute([journey.origin.coordinate, place.coordinate, journey.destination.coordinate]);
  assert.ok(stop.coordinates.length > 1);
  const url = new URL(getNavigationUrl(place));
  assert.equal(url.searchParams.get('destination'), `${place.coordinate.latitude},${place.coordinate.longitude}`);
  const state = { version: 2, journey, preferences: { vegetarianOnly: false, hideVisited: false }, budget: { maxVndPerPerson: 50000, dishQuery: '' }, reports: [], saved: [place], visits: [{ id: 'live-verification', place, visitedAt: new Date().toISOString() }], language: 'en' };
  assert.deepEqual(parseStoredState(JSON.stringify(state)), JSON.parse(JSON.stringify(state)));
  console.log(JSON.stringify({ origin: journey.origin.label, destination: journey.destination.label, routeKm: route.distanceMeters / 1000, places: candidates.length, checkedPlace: place.name, source: place.sourceUrl, extraMinutes: Math.max(0, stop.durationSeconds - route.durationSeconds) / 60, status: 'PASS' }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
