# BiteLane architecture

## Current implementation

`App.tsx` coordinates three tabs and setup/map/detail overlays. Android hardware back closes overlays before changing tabs. No network logic or provider secrets live in screens.

`useBiteLane` owns the persisted schema, hydration, sequential writes, route/place request generation IDs, filters, saves, and visit events. It guards stale results when a journey changes. Failed storage reads preserve the original value and display an error instead of overwriting it with empty data.

`JourneySetupScreen` maintains isolated drafts. Editing an address clears its selected coordinate; only a selected search result can be submitted. Canceled edits do not modify the saved journey. Search runs on button/keyboard submit, not keystrokes. Each search discards stale results.

## Provider boundary

1. `routeService.searchAddresses`: Photon GeoJSON → validated selectable location.
2. `routeService.getCommuteRoute`: selected coordinates → OSRM road geometry/distance/duration. No guessed address coordinates or fallback lines.
3. `placeService.findPlaces`: bounded Overpass query → named food venues → 750 m route corridor filter → proximity ordering. Node/way/relation source IDs are retained. Unknown fields remain absent.
4. `PlaceDetailsScreen`: an explicit action requests start → place → destination; the duration difference is labeled as estimated extra driving time.
5. `navigationService`: coordinate-based destination handoff. Does not write history.

`transport` centralizes bounded short-lived caching, in-flight deduplication, timeouts, and HTTP errors. Provider payloads are untrusted; adapters validate expected fields before building domain values. No silent provider failover or fake data.

## Persistence

AsyncStorage key `bitelane:v1` stores versioned `StoredState` schema version 2: selected journey, language, meaningful filters, applied per-person budget and dish query, local menu price reports, saved place snapshots, and timestamped confirmed visits. Version 1 records migrate with default budget settings and no reports. Runtime validation checks coordinates, provider IDs, source URLs, report prices, and dates on load. Budget fields are edited as a draft and persisted only when the user applies them. Writes are serialized to prevent older writes finishing after newer writes. Place retrieval timestamps are distinct from visit timestamps. In-memory provider caches are deliberately not persisted.

## UI boundaries

- Discover: setup/route summary → per-person budget and dish query → explicit local food-price matches → filters → food-to-store detail. The full route map remains behind an explicit action; Discover does not repeat a separate venue directory.
- Saved: intentions; saved place snapshots with detail access and unsave.
- History: user-confirmed events, with timestamps and reversible mistakes.
- Detail: available source fields, directions, calculate-stop, save, confirm visit, and a local unverified price-report form.
- Web map: dynamic Leaflet, one clearly attributed OSM layer, real geometry, text-safe place popups, and resize handling.
- Native map: platform map provider, real geometry and venue markers. No fake initial coordinates.

## Before a public launch

The three public development endpoints must be replaced by managed or self-hosted capacity. A server gateway should own credentials, shared quotas, caching/licensing, telemetry, and provider adapters. Add authentication only when implementing account sync or other account features. Define RLS and retention if a relational store is selected. No Supabase project, billing account, backend deployment, or paid service has been provisioned by this refactor.

Routing supports driving only. A future provider must supply an actual motorbike profile before exposing that choice. Local reports make the budget flow testable, but merchant or licensed menu data is required before promising verified availability or shared results. See the product plan for priorities and release gates.
