import { Platform } from 'react-native';
import type { Place } from '../types';

export function getNavigationUrl(place: Place): string {
  // iOS should hand off to Apple Maps; Android keeps the Google Maps handoff.
  if (Platform.OS === 'ios') {
    return `http://maps.apple.com/?daddr=${place.coordinate.latitude},${place.coordinate.longitude}&dirflg=d`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate.latitude},${place.coordinate.longitude}`;
}
