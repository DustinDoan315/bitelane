import type { Place } from '../types';

export function getNavigationUrl(place: Place): string {
  // Let the maps application resolve current origin. The destination is always the selected place.
  return `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate.latitude},${place.coordinate.longitude}`;
}
