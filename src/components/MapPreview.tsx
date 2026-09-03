import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline as SvgPolyline } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import type { RouteData } from '../types';

export type MapPreviewProps = {
  route?: RouteData | null;
  isLoading?: boolean;
  error?: string | null;
};

const fallbackCoordinates = [
  { latitude: 10.73287, longitude: 106.708003 },
  { latitude: 10.7395, longitude: 106.704 },
  { latitude: 10.755, longitude: 106.701 },
  { latitude: 10.771, longitude: 106.698 },
  { latitude: 10.7862, longitude: 106.6962 },
];

function toSvgPoints(coordinates: Array<{ latitude: number; longitude: number }>) {
  const maxPoints = 120;
  const step = Math.max(1, Math.ceil(coordinates.length / maxPoints));
  const sampled = coordinates.filter((_, index) => index % step === 0 || index === coordinates.length - 1);
  const longitudes = sampled.map((point) => point.longitude);
  const latitudes = sampled.map((point) => point.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const longitudeRange = Math.max(maxLongitude - minLongitude, 0.0001);
  const latitudeRange = Math.max(maxLatitude - minLatitude, 0.0001);

  return sampled.map((point) => ({
    x: 8 + ((point.longitude - minLongitude) / longitudeRange) * 84,
    y: 12 + ((maxLatitude - point.latitude) / latitudeRange) * 76,
  }));
}

export function MapPreview({ route, isLoading = false, error }: MapPreviewProps) {
  const { t } = useTranslation();
  const live = route?.source === 'live';
  const coordinates = route?.coordinates.length ? route.coordinates : fallbackCoordinates;
  const points = toSvgPoints(coordinates);
  const startPoint = points[0] ?? { x: 8, y: 84 };
  const endPoint = points[points.length - 1] ?? { x: 92, y: 16 };
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : live
      ? t('commute.liveRoute')
      : error
        ? t('commute.routeFallback')
        : t('commute.routePreview');

  return (
    <View style={styles.map}>
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <Svg height="100%" viewBox="0 0 100 100" width="100%">
        <SvgPolyline
          fill="none"
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          stroke={live ? colors.accent : colors.secondaryText}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <Circle cx={startPoint.x} cy={startPoint.y} fill={colors.white} r="3.5" stroke={colors.accent} strokeWidth="1.5" />
        <Circle cx={endPoint.x} cy={endPoint.y} fill={colors.accent} r="3.5" />
      </Svg>
      <View style={styles.statusPill}>
        {isLoading ? <ActivityIndicator color={colors.forest} size="small" /> : null}
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: colors.map,
    borderRadius: 20,
    height: 138,
    overflow: 'hidden',
    position: 'relative',
  },
  road: {
    backgroundColor: '#F9FCF8',
    height: 16,
    position: 'absolute',
    width: '150%',
  },
  roadOne: {
    left: -30,
    top: 42,
    transform: [{ rotate: '12deg' }],
  },
  roadTwo: {
    left: -25,
    top: 108,
    transform: [{ rotate: '-16deg' }],
  },
  roadThree: {
    height: 14,
    left: 120,
    top: -14,
    transform: [{ rotate: '-17deg' }],
    width: 20,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    bottom: 10,
    flexDirection: 'row',
    gap: 6,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
  },
  statusText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
});
