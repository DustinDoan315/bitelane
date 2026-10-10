import assert from 'node:assert/strict';
import { searchAddresses, getCommuteRoute, getRoute } from '../src/services/routeService';
import { findPlaces, CORRIDOR_METERS } from '../src/services/placeService';
import { findFoodOffers } from '../src/services/menuService';
import { getNavigationUrl } from '../src/services/navigationService';
import { currencyForCountry, defaultBudget, normalizeCurrencyAmount } from '../src/services/market';
import { parseStoredState } from '../src/services/validation';

// All geography and place records come from real providers, supplied by CLI queries.
// Run intentionally: this sends the two search strings to external map services.
async function main() {
  const [start, end] = process.argv.slice(2);
  if (!start || !end) throw new Error('Usage: npm run verify:live -- "origin" "destination"');
  const [origins, destinations] = await Promise.all([searchAddresses(start), searchAddresses(end)]);
  assert.ok(origins.length && destinations.length, 'Both live address searches must return results');
  const match = origins.flatMap((origin) => destinations
    .filter((destination) => destination.countryCode === origin.countryCode)
    .map((destination) => ({ origin, destination })))[0];
  assert.ok(match, 'Search results must include a same-country pair in a supported market');
  const journey = match;
  const currency = currencyForCountry(journey.origin.countryCode);
  assert.ok(currency, 'The selected country must have a supported currency');
  const route = await getCommuteRoute(journey);
  console.log('Resolved live journey:', journey.origin.label, '→', journey.destination.label, `(${(route.distanceMeters / 1000).toFixed(1)} km)`);
  assert.ok(route.coordinates.length > 1 && route.distanceMeters > 0 && route.durationSeconds > 0);
  assert.equal(route.countryCode, journey.origin.countryCode);
  const candidates = await findPlaces(route);
  assert.ok(candidates.length, 'Use a food-serving corridor for this smoke check; provider coverage may be empty');
  assert.ok(candidates.every((candidate) => candidate.distanceFromRouteMeters <= CORRIDOR_METERS));

  const budget = defaultBudget(currency, journey.origin.countryCode);
  assert.deepEqual(findFoodOffers(candidates, [], budget), [], 'A fresh install must not invent meal prices');
  assert.equal(normalizeCurrencyAmount(12.345, 'USD'), 12.35, 'Reported prices should match currency precision');
  const place = candidates[0].place;
  const amount = normalizeCurrencyAmount(budget.maxPerPerson * 0.75, currency);
  const report = { id: 'live-report', placeId: place.id, itemName: 'Live check meal', amount, currency, reportedAt: new Date().toISOString(), source: 'user_report' as const };
  const reportedOffers = findFoodOffers(candidates, [report], { ...budget, dishQuery: 'live check' });
  assert.equal(reportedOffers.length, 1);
  assert.equal(reportedOffers[0].withinBudget, true);
  assert.equal(findFoodOffers(candidates, [report], { ...budget, maxPerPerson: amount - 1 })[0]?.withinBudget, false);

  const stop = await getRoute([journey.origin.coordinate, place.coordinate, journey.destination.coordinate], journey.origin.countryCode);
  assert.ok(stop.coordinates.length > 1);
  const url = new URL(getNavigationUrl(place));
  assert.equal(url.searchParams.get('destination'), `${place.coordinate.latitude},${place.coordinate.longitude}`);
  assert.equal(url.searchParams.get('travelmode'), journey.origin.countryCode === 'VN' ? 'two-wheeler' : 'driving');
  const state = {
    version: 3 as const, journey, preferences: { vegetarianOnly: false, hideVisited: false, maxDetourMinutes: 10 },
    budget, reports: [report], saved: [place], visits: [{ id: 'live-verification', place, visitedAt: new Date().toISOString() }],
    language: 'en' as const, hasSeenOnboarding: true,
  };
  assert.deepEqual(parseStoredState(JSON.stringify(state)), state);
  console.log(JSON.stringify({ origin: journey.origin.label, destination: journey.destination.label, routeKm: route.distanceMeters / 1000, places: candidates.length, checkedPlace: place.name, source: place.sourceUrl, extraMinutes: Math.max(0, stop.durationSeconds - route.durationSeconds) / 60, status: 'PASS' }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
