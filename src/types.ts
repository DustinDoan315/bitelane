export type MainTab = 'home' | 'history' | 'saved';
export type Coordinate = { latitude: number; longitude: number };
export type AddressSuggestion = { id: string; label: string; coordinate: Coordinate };
export type Journey = { origin: AddressSuggestion; destination: AddressSuggestion };
export type RouteData = { coordinates: Coordinate[]; distanceMeters: number; durationSeconds: number; source: 'live' };
export type Place = {
  id: string;
  name: string;
  coordinate: Coordinate;
  category: 'restaurant' | 'cafe' | 'fast_food' | 'food_court';
  cuisine?: string;
  address?: string;
  openingHours?: string;
  vegetarian: boolean;
  sourceUrl: string;
  fetchedAt: string;
};
export type Candidate = { place: Place; distanceFromRouteMeters: number };
export type Visit = { id: string; place: Place; visitedAt: string };
export type Preferences = { vegetarianOnly: boolean; hideVisited: boolean };
export type StoredState = {
  version: 1;
  journey: Journey | null;
  preferences: Preferences;
  saved: Place[];
  visits: Visit[];
  language: 'en' | 'vi';
};
