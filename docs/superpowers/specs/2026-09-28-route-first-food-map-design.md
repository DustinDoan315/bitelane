# BiteLane route-first food map

**Status:** Proposed design for review  
**Date:** 2026-09-28

## Goal

Help someone with a chosen trip quickly spot food stops on that route and decide whether one fits. The route map is the main Discover screen. Reduce explanatory copy and make the route, food, price, and extra riding time the visual hierarchy.

## Main flow

1. Keep a compact origin → destination control at the top of Discover, with Edit.
2. Give the live route map most of the screen. Plot matching food venues on the route with compact price pins. Limit the initial map to the leading unique venues so pins remain readable.
3. Tapping a pin selects its venue and matching food offer. Highlight the pin and show a bottom card with the dish/offer label, place name, price or range, and price evidence.
4. Calculate the added riding time only for the selected stop. Reuse the existing routed-trip calculation for origin → place → destination and compare it with the base route. Show “+X min riding”; while calculating, use a small loading state. If the route estimate fails, omit the time instead of showing a straight-line estimate.
5. Keep “View place” and a save control on the selected card; directions remain available in place details. Keep food, budget, and vegetarian filters available as compact controls below the route capsule.

## Map pins and price evidence

- Pins use the best matching offer available for each venue and show a compact price or price range.
- Tapping a pin reveals its dish/offer name and whether its price is user-reported or estimated. User reports remain marked unverified; estimates remain estimates.
- Do not describe the added riding time as total stop time. It excludes queues, parking, ordering, and eating.
- Keep route attribution, loading, no-results, and provider-error states visible without restoring long instructional paragraphs.

## Visual direction

Use a polished map-first composition: a calm, high-contrast map; a clearly colored route; warm white floating route controls and selected-place card; one accent color for the selected food pin. Keep the selected card visually distinct and compact. Remove the Discover intro paragraphs, repeated map instructions, and always-expanded budget form. Preserve accessible names and selected states for map pins and controls.

## Scope

Redesign Discover and its food map markers for web and native. Reuse the current journey, food offers, map providers, price formatter, and route-through-place service. Add no new provider, account flow, or menu-data claim. Keep route setup, Saved, and History behavior intact. The separate full-screen route map and place details should continue to work.

## Acceptance criteria

- A user with a route sees food pins on the route without opening a separate map screen.
- Selecting a pin updates both its selected styling and the bottom card; selecting another pin replaces the card and invalidates the earlier detour request.
- The selected card shows existing price evidence and shows extra riding time only after a successful routed estimate.
- No unselected pin shows a detour time; pin labels remain readable on web and native maps.
- Editing the route clears stale selection/estimate state, while existing route setup, save, detail, and history flows remain usable.
- Loading, provider failure, empty results, and missing price data have concise states and never imply a verified menu price or open status.
