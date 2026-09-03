import { Meal, RoutePreferences } from '../types';

export function getMockRecommendations(_preferences: RoutePreferences): Meal[] {
  return [
    {
      id: 'meal-1',
      name: 'Cơm tấm sườn nướng',
      cuisine: 'Vietnamese · Rice',
      venue: 'Bếp Nhà Lane',
      distanceText: '4 min detour',
      priceText: '₫₫',
      matchReason: 'Fast, filling, and close to your route',
      symbol: '🍚',
    },
    {
      id: 'meal-2',
      name: 'Bún bò Huế',
      cuisine: 'Vietnamese · Noodles',
      venue: 'Món Ngon Corner',
      distanceText: '7 min detour',
      priceText: '₫₫',
      matchReason: 'A warm, spicy pick for a low-key lunch',
      symbol: '🍜',
    },
    {
      id: 'meal-3',
      name: 'Salmon grain bowl',
      cuisine: 'Healthy · Bowl',
      venue: 'Green Stop',
      distanceText: '9 min detour',
      priceText: '₫₫₫',
      matchReason: 'A lighter option with a premium feel',
      symbol: '🥗',
    },
  ];
}
