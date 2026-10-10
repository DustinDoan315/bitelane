import { Image, StyleSheet, View } from 'react-native';
import type { Place } from '../types';
import { colors } from '../theme';
import { Icon } from './Icon';

export function PlaceThumbnail({ place, accessibilityLabel, tone = 'peach', size = 56 }: {
  place: Place; accessibilityLabel: string; tone?: 'peach' | 'green'; size?: number;
}) {
  const shape = { width: size, height: size, borderRadius: Math.round(size * 0.25) };
  return place.imageUrl
    ? <Image accessibilityLabel={accessibilityLabel} resizeMode="cover" source={{ uri: place.imageUrl }} style={[styles.thumbnail, shape]} />
    : <View accessibilityLabel={accessibilityLabel} style={[styles.icon, shape, tone === 'green' && styles.greenIcon]}><Icon name={place.category === 'cafe' ? 'coffee-outline' : 'silverware-fork-knife'} color={colors.forest} size={Math.round(size * 0.43)} /></View>;
}

const styles = StyleSheet.create({
  thumbnail: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.peach },
  icon: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  greenIcon: { backgroundColor: colors.greenSoft },
});
