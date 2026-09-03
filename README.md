# BiteLane

Expo React Native foundation for BiteLane: food recommendations that fit a user's route, budget, and mood.

## Current slice

- Expo blank TypeScript app
- Onboarding screen
- Four lightweight tabs: Discover, Route, Saved, Profile
- Mock meal recommendations
- In-memory route preferences and saved meals
- Shared theme and reusable meal/empty-state components

## Run locally

```bash
npm install
npm run start
```

Then press `i` for the iOS simulator, or scan the QR code with Expo Go.

## Planned next slices

1. Add Expo Router or React Navigation when navigation requirements grow.
2. Replace mock route inputs with location search and permissions.
3. Add a recommendation API client behind the mock data boundary.
4. Persist saved meals and preferences with local storage.
5. Add loading, offline, and error states.
