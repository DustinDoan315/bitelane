import type { Place } from '../types';

export function getNavigationUrl(place: Place): string {
  // Google Maps is used on both native platforms so the travel profile stays motorcycle-first.
  return `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate.latitude},${place.coordinate.longitude}&travelmode=two-wheeler`;
}
