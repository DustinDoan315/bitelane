# BiteLane

Expo React Native foundation for BiteLane: food recommendations that fit a user's route, budget, and mood.

## Current slice

- Expo React Native TypeScript app shaped around the supplied BiteLane product screens
- Food-goal and commute setup flows
- Home daily-pick screen with commute card, route preview, featured recommendation, and Maps handoff
- Saved/recent food memory screen
- Feedback and alternative recommendation flows
- Reusable buttons, rows, banners, map preview, meal cards, and icon wrapper
- Editable commute fields with clear actions, keyboard-friendly focus, suggestions, and validation
- Live route fetching through a typed route service, native map rendering on iOS/Android, and an SVG route fallback for web
- In-memory commute, goal, and saved-meal state
- English/Vietnamese localization with `i18next`, `react-i18next`, and device locale detection

## Run locally

```bash
npm install
npm run start
```

Then press `i` for the iOS simulator, or scan the QR code with Expo Go.

The initial language follows the device locale (`vi` uses Vietnamese; all other locales use English). Tap the avatar on the Home screen to switch between English and Vietnamese.

## Architecture boundary

The current recommendation data is mock data behind `src/data/mockRecommendations.ts`. Route data is fetched by `src/services/routeService.ts` using OpenStreetMap Nominatim + OSRM for this prototype, with a deterministic fallback when the provider is unavailable. Set `EXPO_PUBLIC_GEOCODER_URL` and `EXPO_PUBLIC_ROUTE_URL` to point at your Supabase Edge Function before production; the Expo client should hold only a Supabase session token and never contain Google server keys.

## Planned next slices

1. Add Expo Router or React Navigation when navigation requirements grow.
2. Replace mock route inputs with location search and permissions.
3. Add Supabase Auth and an Edge Function recommendation API.
4. Add Google Routes/Places provider calls only from the Edge Function.
5. Persist saved meals, goals, and commute preferences locally and in Postgres.
6. Add loading, offline, feedback, and error states.
