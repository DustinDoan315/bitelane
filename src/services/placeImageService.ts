import type { Place } from '../types';
import { cachedRequest } from './transport';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const imageCache = new Map<string, string | undefined>();

const normalize = (value: string) => value
  .toLocaleLowerCase('vi-VN')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd');

function isUsefulMatch(place: Place, title: string) {
  const placeWords = normalize(place.name).split(/\s+/).filter((word) => word.length >= 3);
  const imageTitle = normalize(title);
  if (!placeWords.length) return false;
  const matchedWords = placeWords.filter((word) => imageTitle.includes(word));
  return matchedWords.length >= Math.min(placeWords.length, 2);
}

function foodPhotoQuery(place: Place) {
  const text = normalize([place.name, place.cuisine, ...(place.foodTags ?? [])].filter(Boolean).join(' '));
  if (text.includes('com tam') || text.includes('rice')) return 'Com tam Vietnam food';
  if (text.includes('bun') || text.includes('vermicelli')) return 'Bun Vietnam food';
  if (text.includes('pho')) return 'Pho Vietnam food';
  if (text.includes('banh mi') || text.includes('sandwich')) return 'Banh mi Vietnam food';
  if (place.category === 'cafe' || text.includes('coffee') || text.includes('ca phe')) return 'Vietnamese coffee Vietnam';
  return 'Vietnamese street food Vietnam';
}

type CommonsPage = { title?: unknown; imageinfo?: Array<{ thumburl?: unknown; url?: unknown; mime?: unknown }> };

async function searchCommonsImages(query: string): Promise<Array<{ title: string; url: string }>> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: query,
    gsrlimit: '8',
    iiprop: 'url|mime',
    iiurlwidth: '240',
    origin: '*',
    prop: 'imageinfo',
  });
  const payload = await cachedRequest(`${COMMONS_API}?${params.toString()}`, 86400000);
  const pages = payload?.query?.pages && typeof payload.query.pages === 'object' ? Object.values(payload.query.pages) as CommonsPage[] : [];
  return pages.flatMap((page) => {
    const image = page.imageinfo?.[0];
    if (!image || (typeof image.mime === 'string' && !image.mime.startsWith('image/')) || typeof page.title !== 'string') return [];
    const url = typeof image.thumburl === 'string' ? image.thumburl : typeof image.url === 'string' ? image.url : undefined;
    return url ? [{ title: page.title, url }] : [];
  });
}

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return length ? hash % length : 0;
}

/**
 * OSM remains the source of truth for venue photos. If the venue has no photo,
 * use a representative Vietnamese food photo rather than pretending an
 * unrelated image is the storefront. The UI explains this distinction.
 */
export async function getPlaceImageFallback(place: Place): Promise<string | undefined> {
  const cached = imageCache.get(place.id);
  if (cached !== undefined || imageCache.has(place.id)) return cached;
  try {
    const exactImages = await searchCommonsImages([place.name, place.address, 'Vietnam'].filter(Boolean).join(' '));
    const exactImage = exactImages.find(({ title }) => isUsefulMatch(place, title));
    if (exactImage) {
      imageCache.set(place.id, exactImage.url);
      return exactImage.url;
    }
    const foodImages = await searchCommonsImages(foodPhotoQuery(place));
    const imageUrl = foodImages[stableIndex(place.id, foodImages.length)]?.url;
    imageCache.set(place.id, imageUrl);
    return imageUrl;
  } catch {
    imageCache.set(place.id, undefined);
    return undefined;
  }
}

export function getPlaceImage(place: Place) {
  return place.imageUrl ? Promise.resolve(place.imageUrl) : getPlaceImageFallback(place);
}
