import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import { formatRating } from '../services/format';
import type { Coordinate } from '../types';
import type { MapPreviewProps } from './MapPreview';
import { PlaceThumbnail } from './PlaceThumbnail';

const emptyCoordinates: Coordinate[] = [];

export function MapPreview({ route, isLoading = false, error, fullScreen = false, height = 138, places = [], onPlacePress }: MapPreviewProps) {
  const { i18n, t } = useTranslation();
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
        ? t(route?.mode === 'driving' ? 'commute.roadRoute' : 'commute.liveRoute')
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

  const initialRegion = useMemo(() => {
    const latitudes = coordinates.map((point) => point.latitude);
    const longitudes = coordinates.map((point) => point.longitude);
    const latitude = latitudes.length ? (Math.min(...latitudes) + Math.max(...latitudes)) / 2 : 10.7769;
    const longitude = longitudes.length ? (Math.min(...longitudes) + Math.max(...longitudes)) / 2 : 106.7009;
    const latitudeDelta = Math.max(0.02, (Math.max(...latitudes, latitude) - Math.min(...latitudes, latitude)) * 1.5);
    const longitudeDelta = Math.max(0.02, (Math.max(...longitudes, longitude) - Math.min(...longitudes, longitude)) * 1.5);
    return { latitude, longitude, latitudeDelta, longitudeDelta };
  }, [coordinates]);

  useEffect(() => {
    fitRoute();
  }, [coordinates]);

  return (
    <View style={[styles.container, !fullScreen && { height }, fullScreen && styles.fullScreenContainer]}>
      {coordinates.length > 1 ? <MapView
        ref={mapRef}
        initialRegion={initialRegion}
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
        {places.map((place) => <Marker key={place.id} coordinate={place.coordinate} description={place.rating !== undefined ? t('app.ratingLabel', { value: formatRating(place.rating, i18n.language === 'vi' ? 'vi-VN' : 'en-US') }) : undefined} title={place.name} onPress={() => onPlacePress?.(place)}>
          <View style={styles.marker}>
            <PlaceThumbnail accessibilityLabel={place.name} place={place} size={42} tone="green" />
            {place.rating !== undefined ? <View style={styles.pinRating}><Text style={styles.pinRatingText}>★{formatRating(place.rating, i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</Text></View> : null}
          </View>
        </Marker>)}
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
  marker: {
    height: 42,
    position: 'relative',
    width: 42,
  },
  pinRating: {
    backgroundColor: colors.yellow,
    borderColor: colors.peach,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 3,
    paddingVertical: 1,
    position: 'absolute',
    right: -12,
    top: -8,
  },
  pinRatingText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
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
