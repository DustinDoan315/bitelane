# BiteLane architecture plan

## Client boundary

The Expo React Native client owns presentation state and a short-lived Supabase session. It should not contain Google Maps server keys or call Google APIs directly.

```text
Expo client
  └─ authenticated request + session token
       ↓
Supabase Edge Function: recommendation API
  ├─ verify Supabase Auth JWT
  ├─ read preferences and cached route/place data
  ├─ call Routes and Places providers on cache miss
  ├─ rank one daily pick and two alternatives
  └─ write event/history data
       ↓
Postgres (RLS)
```

## Current code mapping

- `src/screens`: user-facing flows from the supplied UI exports.
- `src/components`: reusable presentation primitives and cards.
- `src/data/mockRecommendations.ts`: temporary local data boundary.
- `src/i18n.ts`: device locale detection and English/Vietnamese resources.
- `src/theme.ts`: shared color and spacing tokens.
- `src/services/routeService.ts`: typed geocoding/routing boundary with timeout handling and a safe fallback route for offline/error states.
- `App.tsx`: lightweight state coordinator until navigation and a server state layer are introduced.

## Recommended next boundaries

1. Extract `recommendationClient` with the same shape as the mock data source.
2. Add `supabaseClient` and session lifecycle handling.
3. Add typed API contracts for daily pick, alternatives, route estimates, and feedback events.
4. Move persistence and provider secrets behind the Edge Function/Postgres boundary.

## Route implementation note

The current prototype calls OpenStreetMap Nominatim for address resolution and OSRM for route geometry so the UI can demonstrate a real polyline without a client-side API key. Native builds render the route with `react-native-maps` and the platform map provider; web renders the same returned geometry as an SVG overlay. Before shipping, proxy both calls through the Supabase Edge Function, add request caching/rate limits, and keep precise addresses out of third-party client requests.
