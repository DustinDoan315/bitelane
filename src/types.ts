export type MainTab = 'home' | 'history' | 'saved';

export type AppScreen =
  | 'goal'
  | 'commute'
  | 'home'
  | 'history'
  | 'saved'
  | 'alternatives'
  | 'feedback';

export type FoodGoal = 'healthier' | 'saveTime' | 'budget';

export type CommuteMode = 'motorbike' | 'car';

export type FeedbackReason = 'tooFar' | 'tooExpensive' | 'similar' | 'notForMe';

export type MealIconName = 'food' | 'bowl-mix' | 'baguette';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteData = {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  source: 'live' | 'fallback';
};

export type Meal = {
  id: string;
  nameKey: string;
  metaKey: string;
  reasonKey?: string;
  noteKey?: string;
  priceText: string;
  rating: number;
  distanceMinutes: number;
  closingTime?: string;
  alternativeTime?: number;
  iconName: MealIconName;
  tileColor: 'peach' | 'green' | 'yellow';
};

export type CommutePreferences = {
  homeAddress: string;
  workAddress: string;
  mode: CommuteMode;
};
