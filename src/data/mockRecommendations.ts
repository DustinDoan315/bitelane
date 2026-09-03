import type { Meal } from '../types';

export const featuredMeal: Meal = {
  id: 'featured-bun-bo-hue',
  nameKey: 'meals.featured.name',
  metaKey: 'meals.featured.meta',
  reasonKey: 'meals.featured.reason',
  noteKey: 'meals.featured.note',
  priceText: '₫48k',
  rating: 4.6,
  distanceMinutes: 3,
  closingTime: '14:00',
  iconName: 'bowl-mix',
  tileColor: 'peach',
};

export const savedMeals: Meal[] = [
  {
    id: 'saved-chicken',
    nameKey: 'meals.chicken.name',
    metaKey: 'meals.chicken.savedMeta',
    priceText: '₫55k',
    rating: 4.5,
    distanceMinutes: 2,
    alternativeTime: 2,
    iconName: 'food',
    tileColor: 'peach',
  },
  {
    id: 'saved-banh-mi',
    nameKey: 'meals.banhMi.name',
    metaKey: 'meals.banhMi.savedMeta',
    priceText: '₫38k',
    rating: 4.5,
    distanceMinutes: 1,
    alternativeTime: 1,
    iconName: 'baguette',
    tileColor: 'yellow',
  },
];

export const recentMeals: Meal[] = [
  {
    ...featuredMeal,
    metaKey: 'meals.recentMeta',
    iconName: 'bowl-mix',
    tileColor: 'green',
  },
];

export const alternativeMeals: Meal[] = [
  {
    ...savedMeals[0],
    metaKey: 'meals.chicken.meta',
  },
  {
    id: 'alternative-noodles',
    nameKey: 'meals.noodles.name',
    metaKey: 'meals.noodles.meta',
    priceText: '₫45k',
    rating: 4.5,
    distanceMinutes: 4,
    alternativeTime: 4,
    iconName: 'bowl-mix',
    tileColor: 'green',
  },
  {
    ...savedMeals[1],
    metaKey: 'meals.banhMi.meta',
  },
];
