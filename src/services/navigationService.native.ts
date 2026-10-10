import type { Place } from '../types';

export function getNavigationUrl(place: Place): string {
  const travelMode = place.countryCode === 'VN' ? 'two-wheeler' : 'driving';
  return `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate.latitude},${place.coordinate.longitude}&travelmode=${travelMode}`;
}
