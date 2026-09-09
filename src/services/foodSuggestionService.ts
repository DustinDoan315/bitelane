export type FoodSuggestion = { label: string; aliases: string[] };

export const foodSuggestions: FoodSuggestion[] = [
  { label: 'Cơm tấm', aliases: ['com', 'com tam'] },
  { label: 'Phở', aliases: ['pho'] },
  { label: 'Bánh mì', aliases: ['banh', 'banh mi'] },
  { label: 'Bún', aliases: ['bun'] },
  { label: 'Cà phê', aliases: ['ca phe', 'coffee'] },
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

export function getEstimatedFoodName(placeId: string) {
  let hash = 0;
  for (const character of placeId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return estimatedFoodNames[hash % estimatedFoodNames.length];
}
