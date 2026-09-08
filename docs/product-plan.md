# BiteLane: product review and next releases

## Purpose and target user

Help a person choose a real place to eat near a journey they already plan to make. Start with urban commuters and students who want a convenient stop and a reusable list of places. Vietnam is a useful initial research market, but coverage must be measured locally, not inferred from a map displaying successfully.

## What the review found

The prior app displayed static meals, prices, ratings, detours, and yesterday's history. The goal selection did not affect results, saved state disappeared on restart, navigation targeted work, and both vehicle selections used a driving profile. Address typing triggered Nominatim autocomplete, which its public service prohibits. Fallback coordinates silently represented a fixed Ho Chi Minh City route. These were prototype behaviors rather than usable recommendation logic.

## Implemented in this revision

- Discover: explicit address search and selection, a real road route, and food-to-store matches from local price reports. The full route map remains available separately instead of repeating an unpriced venue directory.
- Filters: vegetarian options explicitly tagged by contributors; hide user-confirmed visited places. Budget matching now supports per-person limits and dish queries against local user-entered price reports, while keeping those reports explicitly unverified.
- Place details: available cuisine/address/raw opening-hours information, source and retrieval time, optional routing through the stop, and directions to the actual place coordinate.
- Saved: persistent future shortlist with add/remove and detail access.
- History: persistent, dated, user-confirmed visits; reversible mistaken entries. Navigation clicks do not imply eating.
- Empty, loading, unavailable, unsupported-route, and local-storage failure states. English and Vietnamese. Responsive width and native map support.

## Known constraints

Discovery currently uses car routing, without traffic. Motorbike routing is essential before a Vietnam commuter launch; do not advertise support until the provider supports it and local route tests pass. Distances from the route are approximate geometric distances, not access feasibility; a river or divided road can make a nearby venue inconvenient. The detail calculation estimates the routed stop cost but excludes waiting, parking, and meals. Nearby venues may have incomplete or stale OSM tags. Saved snapshots are historical copies with retrieval dates, not freshly verified listings.

## Next release: prove a reliable core

1. Select managed geocoding, local place coverage, and motorbike routing providers. Evaluate at least several actual commute corridors with local users; compare returned locations, entrances, opening hours, duplicate listings, and legal road access.
2. Introduce a backend provider gateway with server-side credentials, shared caching, rate limits, budgets, monitoring, and licensed data retention. Replace development endpoints and validate CORS/native credentials. Public community servers are not the production backend.
3. Add current-location permission and map-pin selection for hard-to-geocode addresses. Keep manual landmark entry available and avoid unsolicited background location collection.
4. Replace local-only reports with a merchant or licensed menu catalog. Model each result as food item → price → merchant → source timestamp, and only call a result verified when the source supports that claim. Reviews can enrich a result but cannot become the price source on their own.
5. Add provider-verified opening status and prices only when available. Rank a small candidate set by routed detour; let users choose a detour limit. Clearly separate missing data from a negative preference match.
6. Add opt-in account sync, deletion/export, and offline library behavior. Current persistence is device-local and unencrypted; no account recovery or cross-device sync.
7. Validate on physical iOS/Android devices, including keyboard, permission denial, slow network, Android map configuration, and screen readers. Add automated critical-path coverage and a monitored staging environment.

## Measure before adding a paywall

With user consent, measure route-search success, no-result rate by area, provider latency and cost, detail-to-navigation conversion, confirmed visits, saved-place revisits, and weekly returning users. Treat confirmed visits as self-report, never proof of a transaction. Use qualitative interviews to learn why recommendations fail.

Keep basic discovery, directions, and a useful saved list free. Candidate paid value: multiple recurring routes, a weekly meal plan, advanced detour/preferences, family planning, and sync, once those functions work and users repeatedly need them. The earlier 19–29k VND/month idea is a research hypothesis, not validated pricing. Test willingness to pay and provider unit cost before choosing a price. Digital subscriptions should use the applicable store billing on native apps and a hosted payment flow on web after legal/store review. Do not build a paywall or buy a service until the product and billing choice are made. Sponsored listings must be labeled and must not masquerade as the closest result.

## Research supporting the implementation

- [Nominatim public usage policy](https://operations.osmfoundation.org/policies/nominatim/): no autocomplete, application-wide limits, identification, caching, and provider switching. This revision removes that dependency.
- [Photon project and demo policy](https://github.com/komoot/photon): real OSM geocoding; demo use only within reasonable limits, without availability guarantees.
- [OSRM routing API](https://project-osrm.org/docs/v5.24.0/api/): routing through ordered coordinates and returned geometry/duration; profile semantics are determined by the server data.
- [Overpass resource policy](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html): shared resources and load shedding; production applications need sustainable capacity.
- [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): attribution, caching, no bulk download/prefetch.
