import { Meal, RoutePreferences } from '../types';

export function getMockRecommendations(_preferences: RoutePreferences): Meal[] {
  return [
    {
      id: 'meal-1',
      nameKey: 'meals.meal1.name',
      cuisineKey: 'meals.meal1.cuisine',
      venueKey: 'meals.meal1.venue',
      distanceMinutes: 4,
      priceText: '₫₫',
      matchReasonKey: 'meals.meal1.reason',
      symbol: '🍚',
    },
    {
      id: 'meal-2',
      nameKey: 'meals.meal2.name',
      cuisineKey: 'meals.meal2.cuisine',
      venueKey: 'meals.meal2.venue',
      distanceMinutes: 7,
      priceText: '₫₫',
      matchReasonKey: 'meals.meal2.reason',
      symbol: '🍜',
    },
    {
      id: 'meal-3',
      nameKey: 'meals.meal3.name',
      cuisineKey: 'meals.meal3.cuisine',
      venueKey: 'meals.meal3.venue',
      distanceMinutes: 9,
      priceText: '₫₫₫',
      matchReasonKey: 'meals.meal3.reason',
      symbol: '🥗',
    },
  ];
}
