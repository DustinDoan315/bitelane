# BiteLane

An Expo / React Native app for finding a meal within a per-person budget without a bad route detour. The current prototype supports Vietnam, the UK, the US, and Eurozone countries. Web uses Leaflet; native uses `react-native-maps`. It is local-first: Supabase account sync and RevenueCat subscriptions are future options and are not integrated.

## Run

```sh
npm ci
npm run web
# or npm start for Expo
```

Start with **Set my route**. Search both locations, choose the country’s currency and a per-person budget, then compare places in a shared list or map view. A blank dish search can show nearby venues with unknown prices; BiteLane only shows a meal name and price when a dated local report exists. Reports are unverified and saved on this device. Venue details show available source data, directions, and the routed extra time for a stop. Saved places and confirmed visits stay on this device. The same flow supports Vietnamese and English UI, with market-specific currency, number formats, and distance units.

## Data and configuration

Development defaults: Photon geocoding and Overpass venue search cover the supported markets, while Valhalla routes use a motorcycle profile in Vietnam and driving elsewhere. Public services have limited capacity and no SLA. Native basemaps use the platform provider; an Android standalone release requires a restricted Google Maps SDK key in `GOOGLE_MAPS_API_KEY` before rebuilding. The native map also needs a valid initial camera, which BiteLane supplies from the returned route.

See [.env.example](.env.example) for optional endpoint overrides. The default route endpoint is Valhalla; an OSRM-compatible endpoint can be selected explicitly with `EXPO_PUBLIC_ROUTE_PROVIDER=osrm`. Expo public variables are compiled into the client; **never put secret keys in them**. Configure managed/self-hosted endpoints or a backend gateway before release. Do not assume renaming a Google endpoint makes it protocol compatible. Rebuild after changing endpoint configuration.

Discovery is limited to routes up to 40 km and venues within 750 m of the route. Distance from the route is geometric proximity; the app then calculates routed detours for a bounded shortlist and orders usable results by extra time. The detour omits live traffic, parking, ordering, and eating time. A price appears only when a local user report exists and is labeled unverified. No synthetic dishes or category-based price estimates are generated. Reports are not shared between devices. Venue thumbnails use only an image tagged on the mapped venue; otherwise the app shows a category icon. There is no verified open-now status, licensed menu pricing, rating, or nutrition data.

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
