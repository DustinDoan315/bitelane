# BiteLane

An Expo / React Native app for finding places to eat along a real journey. Web uses Leaflet; native uses `react-native-maps`.

## Run

```sh
npm ci
npm run web
# or npm start for Expo
```

Start with **Set my route**. Search both locations (include city), select actual search results, and find places. Set a per-person meal budget and optional dish query. Blank food names include broad, clearly labeled meal estimates so a fresh install has useful options; real local price reports take priority. Open a venue to add a price you actually saw; these reports are stored on this device and labeled unverified until a merchant or licensed menu source is connected. Tap a place for source information and an optional routed stop estimate. Hearts manage Saved; **I visited this place** writes a timestamped History entry. Language, route selections, filters, budget, price reports, Saved, and History survive restarts on the same device.

## Data and configuration

Development defaults: Photon geocoding, OSRM driving routes, Overpass OSM place queries, OSM web tiles. These are real data, but public services have limited capacity and no SLA. The public Nominatim API is no longer used. Native basemaps use the platform provider; an Android standalone release requires Google Maps SDK configuration and a restricted client key.

See [.env.example](.env.example) for optional endpoint overrides. They expect Photon, OSRM, and Overpass-compatible response formats. Expo public variables are compiled into the client; **never put secret keys in them**. Configure managed/self-hosted endpoints or a backend gateway before release. Do not assume renaming a Google endpoint makes it protocol compatible. Rebuild after changing endpoint configuration.

Discovery is limited to road routes up to 40 km and venues within 750 m of the route. It ranks approximate geometric proximity, not driving detour. **Calculate this stop** fetches a route through the venue and compares driving duration. Estimates exclude live traffic and meal/parking time. Budget results combine exact local reports with broad category/cuisine estimates; estimates are never presented as menu prices and are not shared between users. There is no motorbike routing, verified open-now status, licensed menu pricing, rating, or nutrition data. Unknown fields are labeled accordingly.

Requests have a 25-second timeout and in-flight deduplication. In-memory caches: addresses 24 hours, routes 5 minutes, places 15 minutes. Refresh can reuse that cache. No automatic retries, background location tracking, or synthetic fallback route. Local history and saved places are unencrypted device storage, not account sync.

## Checks

```sh
npm run typecheck
npm run verify:live -- "a public origin landmark, city" "a public destination landmark, city"
npx expo export --platform web
```

The live check calls actual providers and has no response fixtures. Choose a short urban route with food coverage. Empty coverage, rate limiting, or provider downtime can fail it. UI checks should also verify empty states, edits invalidating selected coordinates, error/retry, Saved after reload, confirmed visits and undo, language switching, and directions targeting the selected venue.

See [architecture](docs/architecture.md), [product review and roadmap](docs/product-plan.md), and [verification record](docs/verification.md).

## Source policies

- [Photon demo policy](https://github.com/komoot/photon): reasonable development usage; no availability guarantee.
- [Overpass resource policy](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html): shared capacity; provision a sustainable production backend.
- [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) and [OSM attribution/license](https://www.openstreetmap.org/copyright).
