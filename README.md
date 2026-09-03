# BiteLane

Expo React Native foundation for BiteLane: food recommendations that fit a user's route, budget, and mood.

## Current slice

- Expo React Native TypeScript app shaped around the supplied BiteLane product screens
- Food-goal and commute setup flows
- Home daily-pick screen with commute card, route preview, featured recommendation, and Maps handoff
- Saved/recent food memory screen
- Feedback and alternative recommendation flows
- Reusable buttons, rows, banners, map preview, meal cards, and icon wrapper
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

The current recommendation data is mock data behind `src/data/mockRecommendations.ts`. The intended production boundary follows the supplied architecture: the Expo client should hold only a Supabase session token, call a Supabase Edge Function for recommendations, and never contain Google server keys. Routes and places remain external provider concerns behind that backend boundary.

## Planned next slices

1. Add Expo Router or React Navigation when navigation requirements grow.
2. Replace mock route inputs with location search and permissions.
3. Add Supabase Auth and an Edge Function recommendation API.
4. Add Google Routes/Places provider calls only from the Edge Function.
5. Persist saved meals, goals, and commute preferences locally and in Postgres.
6. Add loading, offline, feedback, and error states.
