import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import type { Coordinate } from '../types';
import type { MapPreviewProps } from './MapPreview';

const fallbackCoordinates: Coordinate[] = [
  { latitude: 10.73287, longitude: 106.708003 },
  { latitude: 10.7395, longitude: 106.704 },
  { latitude: 10.755, longitude: 106.701 },
  { latitude: 10.771, longitude: 106.698 },
  { latitude: 10.7862, longitude: 106.6962 },
];

export function MapPreview({ route, isLoading = false, error }: MapPreviewProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const coordinates = useMemo(
    () => (route?.coordinates.length ? route.coordinates : fallbackCoordinates),
    [route],
  );
  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const live = route?.source === 'live';
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : live
      ? t('commute.liveRoute')
      : error
        ? t('commute.routeFallback')
        : t('commute.routePreview');

  const fitRoute = () => {
    if (coordinates.length > 1) {
      mapRef.current?.fitToCoordinates(coordinates, {
        animated: false,
        edgePadding: { top: 42, right: 42, bottom: 42, left: 42 },
      });
    }
  };

  useEffect(() => {
    fitRoute();
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        mapType="standard"
        onMapReady={fitRoute}
        pitchEnabled={false}
        rotateEnabled={false}
        showsCompass={false}
        showsScale={false}
        style={styles.map}
        toolbarEnabled={false}
        zoomEnabled
      >
        <Polyline coordinates={coordinates} strokeColor={live ? colors.accent : colors.secondaryText} strokeWidth={5} />
        <Marker coordinate={start} pinColor={colors.forest} />
        <Marker coordinate={end} pinColor={colors.accent} />
      </MapView>
      <View style={styles.statusPill}>
        {isLoading ? <ActivityIndicator color={colors.forest} size="small" /> : null}
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    height: 138,
    overflow: 'hidden',
  },
  map: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
