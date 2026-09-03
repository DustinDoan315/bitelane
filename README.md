# BiteLane

Native iOS foundation for BiteLane: food recommendations that fit a user’s route, budget, and mood.

## Current slice

- SwiftUI app shell targeting iOS 17+
- Onboarding screen and four-tab navigation: Discover, Route, Saved, Profile
- Mock recommendations behind `RecommendationProviding`
- In-memory saved meals and route preferences
- English/Vietnamese localization scaffolding
- Unit tests for the mock service and app store

## Planned next slices

1. Replace mock route inputs with MapKit search and Core Location permission flow.
2. Add a place/recommendation API client behind the existing service boundary.
3. Persist saved meals and preferences locally.
4. Add loading, empty, offline, and error states.
5. Add analytics, authentication, and backend synchronization only when the product model is defined.

## App Store copy

- App name: `BiteLane: Food on Your Way`
- Tagline: `Your next meal, already on the way.`
- Vietnamese positioning: `Chọn món ngon trên đường đi.`
