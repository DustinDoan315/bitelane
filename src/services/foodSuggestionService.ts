import type { Place } from '../types';

export type FoodSuggestion = { label: string; aliases: string[]; keywords: string[] };

export const foodSuggestions: FoodSuggestion[] = [
  { label: 'Cơm tấm', aliases: ['com', 'com tam'], keywords: ['rice'] },
  { label: 'Phở', aliases: ['pho'], keywords: [] },
  { label: 'Bánh mì', aliases: ['banh', 'banh mi'], keywords: ['sandwich', 'bakery'] },
  { label: 'Bún', aliases: ['bun'], keywords: ['vermicelli'] },
  { label: 'Cà phê', aliases: ['ca phe', 'coffee'], keywords: ['cafe'] },
];

export const estimatedFoodNames = ['Cơm', 'Phở', 'Bún', 'Gỏi cuốn', 'Bánh mì', 'Hủ tiếu', 'Mì', 'Cháo'];

export const normalizeFood = (value: string) => value
  .toLocaleLowerCase('vi-VN')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .trim();

export function getFoodSuggestions(value: string) {
  const query = normalizeFood(value);
  if (query.length < 2) return [];
  const rawQuery = value.trim().toLocaleLowerCase('vi-VN');
  return foodSuggestions
    .filter(({ label, aliases }) => rawQuery !== label.toLocaleLowerCase('vi-VN') && aliases.some((alias) => normalizeFood(alias).startsWith(query)))
    .slice(0, 3);
}

export function getCanonicalFoodLabel(value: string) {
  const query = normalizeFood(value);
  return foodSuggestions.find(({ label, aliases }) => normalizeFood(label) === query || aliases.some((alias) => normalizeFood(alias) === query))?.label;
}

/**
 * OSM food tags are incomplete, so match the selected dish against every
 * descriptive field we have while keeping a blank selection intentionally broad.
 */
export function matchesFoodType(place: Place, value: string) {
  const query = normalizeFood(value);
  if (!query) return true;
  const suggestion = foodSuggestions.find(({ label, aliases }) => normalizeFood(label) === query || aliases.some((alias) => normalizeFood(alias) === query));
  const terms = suggestion ? [suggestion.label, ...suggestion.aliases, ...suggestion.keywords] : [value];
  const haystack = [place.name, place.category, place.cuisine, ...(place.foodTags ?? [])]
    .filter((item): item is string => Boolean(item))
    .map(normalizeFood);
  return terms.some((term) => {
    const normalizedTerm = normalizeFood(term);
    return normalizedTerm.length >= 2 && haystack.some((field) => field.includes(normalizedTerm));
  });
}

export function getEstimatedFoodName(placeId: string) {
  let hash = 0;
  for (const character of placeId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return estimatedFoodNames[hash % estimatedFoodNames.length];
}
