import assert from 'node:assert/strict';
import { searchAddresses, getCommuteRoute, getRoute } from '../src/services/routeService';
import { findPlaces, CORRIDOR_METERS } from '../src/services/placeService';
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
  const place = candidates[0].place;
  const stop = await getRoute([journey.origin.coordinate, place.coordinate, journey.destination.coordinate]);
  assert.ok(stop.coordinates.length > 1);
  const url = new URL(getNavigationUrl(place));
  assert.equal(url.searchParams.get('destination'), `${place.coordinate.latitude},${place.coordinate.longitude}`);
  const state = { version: 1, journey, preferences: { vegetarianOnly: false, hideVisited: false }, saved: [place], visits: [{ id: 'live-verification', place, visitedAt: new Date().toISOString() }], language: 'en' };
  assert.deepEqual(parseStoredState(JSON.stringify(state)), JSON.parse(JSON.stringify(state)));
  console.log(JSON.stringify({ origin: journey.origin.label, destination: journey.destination.label, routeKm: route.distanceMeters / 1000, places: candidates.length, checkedPlace: place.name, source: place.sourceUrl, extraMinutes: Math.max(0, stop.durationSeconds - route.durationSeconds) / 60, status: 'PASS' }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
