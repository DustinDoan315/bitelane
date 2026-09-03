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
  name: string;
  cuisine: string;
  venue: string;
  distanceText: string;
  priceText: string;
  matchReason: string;
  symbol: string;
};
