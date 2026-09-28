# BiteLane architecture

## Selected stack

- Client: Expo, React Native, and TypeScript; Leaflet on web and `react-native-maps` on native. Keep the existing client and map renderers for the route-first redesign.
- Local state: AsyncStorage for saved trips, preferences, saves, visits, and price reports while the app is local-first.
- Backend when cloud features are implemented: Supabase Auth and Postgres with Row Level Security. Enable PostGIS in a dedicated schema if BiteLane stores and searches its own venue coordinates. Use Supabase Edge Functions only when a provider secret or server-only operation is needed.
- Subscriptions when a paid plan exists: RevenueCat for Apple App Store and Google Play purchases, entitlement checks, and cross-platform subscription status. RevenueCat's current pay-as-you-grow plan is free through $2,500 monthly tracked revenue, then 1% of tracked revenue. Expo requires a development build for its native purchase SDK. For web purchases, RevenueCat Billing uses Stripe; configure web products separately.
- Managed location services for worldwide rollout: evaluate Mapbox routing and geocoding behind the existing service boundary. Keep public Photon, Valhalla, and Overpass endpoints for development only; select a sustainable venue-search and map-tile provider before broad release.
- Build and updates: Expo EAS Free during development; review current quotas before public distribution.

Use the active Supabase trial, then Supabase Free, for development and an early beta; do not assume a Pro subscription in the solo-dev budget. Free projects can pause after 7 days of low activity, so keep local features usable if cloud sync is unavailable. Reconsider paid hosting only when account sync or shared reports are validated and the budget supports it.

If an always-on backend becomes necessary before Supabase Pro is affordable, evaluate Cloudflare Workers + D1: the free tier includes 100,000 Worker requests/day, 5 million D1 rows read/day, and 100,000 rows written/day; Workers Paid starts at $5/month and has larger included quotas. This option needs a separate consumer-auth design, so do not migrate to it solely to save money before cloud features are needed.

Do not ship a subscription until BiteLane has a clear recurring premium benefit. Keep route discovery useful on the free plan and show price, renewal frequency, trial terms, and cancellation access clearly for any paid offer.

## Current implementation

`App.tsx` coordinates three tabs and setup/map/detail overlays. Android hardware back closes overlays before changing tabs. No network logic or provider secrets live in screens.

`useBiteLane` owns the persisted schema, hydration, sequential writes, route/place request generation IDs, filters, saves, and visit events. It guards stale results when a journey changes. Failed storage reads preserve the original value and display an error instead of overwriting it with empty data.

`JourneySetupScreen` maintains isolated drafts. Editing an address clears its selected coordinate; only a selected search result can be submitted. Canceled edits do not modify the saved journey. Search starts after three typed characters with a short debounce, and each search discards stale results.

## Provider boundary

1. `routeService.searchAddresses`: Photon GeoJSON → validated selectable location.
2. `routeService.getCommuteRoute`: selected coordinates → Valhalla motorcycle geometry/distance/duration. An OSRM adapter remains available only for explicit development overrides. No guessed address coordinates or fallback lines.
3. `placeService.findPlaces`: bounded Overpass query → named food venues → 750 m route corridor filter → proximity ordering. Node/way/relation source IDs are retained, with optional contributor-listed website/menu URLs, image URLs, and food metadata. Unknown fields remain absent. Missing images are resolved lazily through Wikimedia Commons using an exact venue-name match or a representative Vietnamese-food query.
4. `PlaceDetailsScreen`: an explicit action requests start → place → destination; the duration difference is labeled as estimated extra motorbike time.
5. `navigationService`: coordinate-based destination handoff. Does not write history.

`transport` centralizes bounded short-lived caching, in-flight deduplication, timeouts, and HTTP errors. Provider payloads are untrusted; adapters validate expected fields before building domain values. No silent provider failover or fake data.

`menuService` keeps price evidence separate from venue discovery. User reports become exact-but-unverified offers. When the food name is blank, a deterministic broad category/cuisine estimate creates up to 40 fallback options from real route venues; the UI labels these estimates and reports their range rather than inventing a named dish. A non-empty food query filters route venues using OSM name/cuisine/dish metadata and matching local reports before generating estimates.

## Persistence

AsyncStorage key `bitelane:v1` stores versioned `StoredState` schema version 2: selected journey, language, meaningful filters, applied per-person budget and dish query, local menu price reports, saved place snapshots, and timestamped confirmed visits. Version 1 records migrate with default budget settings and no reports. Runtime validation checks coordinates, provider IDs, source URLs, report prices, and dates on load. Budget fields are edited as a draft and persisted only when the user applies them. Writes are serialized to prevent older writes finishing after newer writes. Place retrieval timestamps are distinct from visit timestamps. In-memory provider caches are deliberately not persisted.

## UI boundaries

- Discover: live route map with a floating origin → destination pill and up to 12 unique price pins → compact food/budget and preference filters → selected offer card with evidence, local save, and routed extra-ride estimate. The full map and place details remain available.
- Saved: intentions; saved place snapshots with detail access and unsave.
- History: user-confirmed events, with timestamps and reversible mistakes.
- Detail: available source fields, directions, calculate-stop, save, confirm visit, and a local unverified price-report form.
- Web map: dynamic Leaflet, one clearly attributed OSM layer, real geometry, text-safe place popups, and resize handling.
- Native map: platform map provider, real geometry and venue markers. No fake initial coordinates.

## Before a public launch

The three public development endpoints must be replaced by managed or self-hosted capacity. A server gateway should own provider secrets, shared quotas, caching/licensing, telemetry, and provider adapters. When account sync or shared price reports are implemented, use Supabase Auth and define RLS policies and data retention before exposing tables. Keep Free-tier limitations and the solo-dev budget in the launch decision; no paid service is assumed or provisioned in this repository.

Routing defaults to Valhalla's actual `motorcycle` costing profile and keeps an OSRM-compatible driving adapter only for intentional development overrides. Local reports and estimates make the budget flow useful immediately, but merchant or licensed menu data is required before promising verified availability or shared results. See the product plan for priorities and release gates.
