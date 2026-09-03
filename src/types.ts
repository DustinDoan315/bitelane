export type AppTab = 'discover' | 'route' | 'saved' | 'profile';

export type Budget = 'any' | 'value' | 'premium';

export type RoutePreferences = {
  origin: string;
  destination: string;
  budget: Budget;
  mood: string;
};

export type Meal = {
  id: string;
  nameKey: string;
  cuisineKey: string;
  venueKey: string;
  distanceMinutes: number;
  priceText: string;
  matchReasonKey: string;
  symbol: string;
};
