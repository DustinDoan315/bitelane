# BiteLane: product review and next releases

## Purpose and target user

Help a person choose a real place to eat near a journey they already plan to make. Start with urban commuters and students who want a convenient stop and a reusable list of places. Vietnam is a useful initial research market, but coverage must be measured locally, not inferred from a map displaying successfully.

## What the review found

The prior app displayed static meals, prices, ratings, detours, and yesterday's history. The goal selection did not affect results, saved state disappeared on restart, navigation targeted work, and both vehicle selections used a driving profile. Address typing triggered Nominatim autocomplete, which its public service prohibits. Fallback coordinates silently represented a fixed Ho Chi Minh City route. These were prototype behaviors rather than usable recommendation logic.

## Implemented in this revision

- One trip setup for Vietnam, the UK, the US, and Eurozone countries. The selected market determines currency, number format, distance units, and route mode; start and destination must be in the same supported country.
- One list/map results screen for Vietnamese and international users. Results use the same route, budget, detour limit, and filters. Known local meal reports are ranked ahead of venues with unknown prices; unknown-price venues appear only when no dish query is active.
- Prices are dated, device-local user reports. The app no longer generates dishes, price ranges, ratings, or food photos to fill missing data. Every reported price is labeled unverified.
- Place details show the available map-contributor fields, source and retrieval time, directions to the selected coordinate, and an optional routed stop comparison.
- Saved places and confirmed visit history remain local and persistent. Language selection is available in profile; UI copy supports Vietnamese and English.
- Empty, loading, unavailable, unsupported-route, and local-storage failure states are represented in the UI.

## Known constraints

Public map and routing providers may return incomplete or stale data. Distances from the route are approximate geometry, not access feasibility; a river or divided road can make a nearby venue inconvenient. Detours use a routed comparison without live traffic and exclude waiting, parking, and meals. Current prices and menus are not supplied by the map provider, so reported prices are local, unverified, and unavailable to other users. The current public endpoints are development services, not a production capacity plan. Saved snapshots are historical copies with retrieval dates, not freshly verified listings.

## Next release: prove a reliable core

1. Select managed geocoding, local place coverage, and production motorbike routing providers. Evaluate at least several actual commute corridors with local users; compare returned locations, entrances, opening hours, duplicate listings, and legal road access.
2. Introduce a backend provider gateway with server-side credentials, shared caching, rate limits, budgets, monitoring, and licensed data retention. Replace development endpoints and validate CORS/native credentials. Public community servers are not the production backend.
3. Add current-location permission and map-pin selection for hard-to-geocode addresses. Keep manual landmark entry available and avoid unsolicited background location collection.
4. Replace local-only reports and heuristics with a merchant or licensed menu catalog. Model each result as food item → price → merchant → source timestamp, and only call a result verified when the source supports that claim. Reviews can enrich a result but cannot become the price source on their own. If Google Places is selected, use its price range/rating only under its display, attribution, and storage policies; it does not provide a reliable item-level menu feed.
5. Add provider-verified opening status and prices only when available. Rank a small candidate set by routed detour; let users choose a detour limit. Clearly separate missing data from a negative preference match.
6. Add opt-in account sync, deletion/export, and offline library behavior. Current persistence is device-local and unencrypted; no account recovery or cross-device sync.
7. Validate on physical iOS/Android devices, including keyboard, permission denial, slow network, Android map configuration, and screen readers. Add automated critical-path coverage and a monitored staging environment.

## Measure before adding a paywall

With user consent, measure route-search success, no-result rate by area, provider latency and cost, detail-to-navigation conversion, confirmed visits, saved-place revisits, and weekly returning users. Treat confirmed visits as self-report, never proof of a transaction. Use qualitative interviews to learn why recommendations fail.

Keep basic discovery, directions, and a useful saved list free. Candidate paid value: multiple recurring routes, a weekly meal plan, advanced detour/preferences, family planning, and sync, once those functions work and users repeatedly need them. The earlier 19–29k VND/month idea is a research hypothesis, not validated pricing. Test willingness to pay and provider unit cost before choosing a price. Digital subscriptions should use the applicable store billing on native apps and a hosted payment flow on web after legal/store review. Do not build a paywall or buy a service until the product and billing choice are made. Sponsored listings must be labeled and must not masquerade as the closest result.

## Research supporting the implementation

- [Nominatim public usage policy](https://operations.osmfoundation.org/policies/nominatim/): no autocomplete, application-wide limits, identification, caching, and provider switching. This revision removes that dependency.
- [Photon project and demo policy](https://github.com/komoot/photon): real OSM geocoding; demo use only within reasonable limits, without availability guarantees.
- [Valhalla routing API](https://valhalla.github.io/valhalla/api/turn-by-turn/api-reference/): routing through ordered coordinates, returned geometry/duration, and explicit costing profiles such as `motorcycle`.
- [Overpass resource policy](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html): shared resources and load shedding; production applications need sustainable capacity.
- [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): attribution, caching, no bulk download/prefetch.
