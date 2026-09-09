import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import type { Coordinate } from '../types';
import type { MapPreviewProps } from './MapPreview';

const emptyCoordinates: Coordinate[] = [];

export function MapPreview({ route, isLoading = false, error, fullScreen = false, places = [], onPlacePress }: MapPreviewProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const coordinates = useMemo(
    () => (route?.coordinates.length ? route.coordinates : emptyCoordinates),
    [route],
  );
  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const live = route?.source === 'live';
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : live && error
      ? t('commute.mapDataWarning')
      : live
        ? t('commute.liveRoute')
        : error
          ? t('commute.routeFallback')
          : t('commute.routePreview');

  const fitRoute = () => {
    if (coordinates.length > 1) {
      mapRef.current?.fitToCoordinates(coordinates, {
        animated: false,
        edgePadding: { top: fullScreen ? 78 : 42, right: 42, bottom: fullScreen ? 220 : 42, left: 42 },
      });
    }
  };

  useEffect(() => {
    fitRoute();
  }, [coordinates]);

  return (
    <View style={[styles.container, fullScreen && styles.fullScreenContainer]}>
      {coordinates.length > 1 ? <MapView
        ref={mapRef}
        onMapReady={fitRoute}
        pitchEnabled={false}
        rotateEnabled={false}
        showsCompass={false}
        showsScale={false}
        style={styles.map}
        toolbarEnabled={false}
        zoomEnabled
      >
        {live ? (
          <>
            <Polyline coordinates={coordinates} strokeColor={colors.white} strokeWidth={10} />
            <Polyline coordinates={coordinates} strokeColor={colors.accent} strokeWidth={5} />
          </>
        ) : null}
        <Marker coordinate={start} pinColor={colors.forest} />
        <Marker coordinate={end} pinColor={colors.accent} />
        {places.map((place) => <Marker key={place.id} coordinate={place.coordinate} title={place.name} pinColor={colors.forest} onPress={() => onPlacePress?.(place)} />)}
      </MapView> : null}
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
  fullScreenContainer: {
    borderRadius: 0,
    flex: 1,
    height: undefined,
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
