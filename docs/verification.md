# Verification record

Date: 2026-09-08 (Asia/Ho_Chi_Minh)

## Automated and build checks

- `npm run typecheck`: passed with strict TypeScript.
- `npx expo-doctor`: 21/21 checks passed after adding the required `expo-font` peer dependency and updating Expo from 57.0.19 to 57.0.20.
- `npx expo export --platform web`: passed; production web bundle emitted to ignored `dist/`.
- `git diff --check`: passed.
- `npm run verify:live -- "Ben Thanh Market, Ho Chi Minh City" "Saigon Zoo, Ho Chi Minh City"`: passed against live Photon, OSRM, and Overpass data. It resolved both places, returned a 2.3236 km road route and 665 food candidates within the route corridor, validated an OSM source record, requested a route through that place, checked its destination URL, and round-tripped the persisted schema. Provider counts and place order can change with live data.

## Browser check (390 × 844)

- Meaningful initial empty state rendered with no seeded locations or places.
- Explicit start/destination searches returned live selectable results.
- Selected journey loaded real venue cards; the full route map opened through its explicit action.
- Clear full-map button opened a fitted road route at mobile width; the old transparent map interaction was found unreliable and replaced. Unconfigured satellite/CARTO layers were removed.
- Place details showed only available fields, source timestamp, source link, and unknown-price text.
- Budget settings accepted a per-person limit and optional dish query. Results stayed unchanged while fields were edited and changed only after applying the budget. A real local report for Cơm tấm at 45,000₫ appeared under a 50k budget, disappeared at 30k, and returned after reload; the result showed the dish, price, mapped venue, and unverified report label.
- Discover now shows only priced food matches; the former Nearby venues directory is removed. Selecting the Cơm tấm result opens a food/store detail view with the dish, reported price, venue identity, address, map, directions, save, visit, and price-report actions.
- Calculate-stop returned a route through the selected venue and displayed the difference from the base route.
- Save changed the control state; Saved retained the venue after a full browser reload.
- Confirm visit created one timestamped History event; History retained it after reload; undo restored the empty state.
- English/Vietnamese switching updated current UI and persisted language.
- No browser runtime errors or framework error overlay occurred. Development-only React Native Web deprecation warnings remain for legacy shadow style properties in the existing map controls.

## Security and dependency review

Provider payloads are converted to a small domain schema and validated again on storage hydration. Place names in Leaflet popups are assigned as text nodes. Provider requests time out, cache briefly, and deduplicate in-flight requests. External navigation uses validated coordinates rather than provider URLs. Budget reports are explicitly local user input, capped and validated, and never presented as verified menus. No secret is present in Expo public configuration.

`npm audit --omit=dev` reports 10 moderate advisories through Expo's `xcode` → `uuid` native build-tool chain. npm's offered forced resolution downgrades Expo to 46, so it was not applied. Track the upstream Expo dependency update; this finding is not code shipped in the browser bundle, but it is part of the local/native build toolchain.

## Still required before release

Physical iOS and Android testing was not available in this run. Verify native map credentials/configuration, Android hardware back, keyboard behavior, slow/offline states, external map handoff, and accessibility on real devices. Replace public development endpoints with managed or self-hosted capacity and validate local data coverage before distributing to users.
