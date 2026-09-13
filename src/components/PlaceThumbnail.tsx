import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { Place } from '../types';
import { getPlaceImageFallback } from '../services/placeImageService';
import { colors } from '../theme';
import { Icon } from './Icon';

export function PlaceThumbnail({ place, accessibilityLabel, tone = 'peach', size = 56 }: {
  place: Place; accessibilityLabel: string; tone?: 'peach' | 'green'; size?: number;
}) {
  const [imageUrl, setImageUrl] = useState(place.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackRequested, setFallbackRequested] = useState(!place.imageUrl);

  useEffect(() => {
    let cancelled = false;
    setImageUrl(place.imageUrl);
    setImageFailed(false);
    setFallbackRequested(!place.imageUrl);
    if (!place.imageUrl) {
      void getPlaceImageFallback(place).then((fallback) => {
        if (!cancelled && fallback) setImageUrl(fallback);
      });
    }
    return () => { cancelled = true; };
  }, [place.id, place.imageUrl]);

  const loadFallback = () => {
    if (fallbackRequested) {
      setImageFailed(true);
      return;
    }
    setFallbackRequested(true);
    void getPlaceImageFallback({ ...place, imageUrl: undefined }).then((fallback) => {
      if (fallback) setImageUrl(fallback);
      else setImageFailed(true);
    });
  };

  const shape = { width: size, height: size, borderRadius: Math.round(size * 0.25) };
  return imageUrl && !imageFailed
    ? <Image accessibilityLabel={accessibilityLabel} onError={loadFallback} resizeMode="cover" source={{ uri: imageUrl }} style={[styles.thumbnail, shape]} />
    : <View accessibilityLabel={accessibilityLabel} style={[styles.icon, shape, tone === 'green' && styles.greenIcon]}><Icon name={place.category === 'cafe' ? 'coffee-outline' : 'silverware-fork-knife'} color={colors.forest} size={Math.round(size * 0.43)} /></View>;
}

const styles = StyleSheet.create({
  thumbnail: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.peach },
  icon: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  greenIcon: { backgroundColor: colors.greenSoft },
});
