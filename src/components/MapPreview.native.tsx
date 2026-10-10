import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import { formatMoneyCompact, marketLocale } from '../services/market';
import type { Coordinate } from '../types';
import type { MapPreviewProps } from './MapPreview';
import { PlaceThumbnail } from './PlaceThumbnail';

const emptyCoordinates: Coordinate[] = [];

export function MapPreview({ route, isLoading = false, error, fullScreen = false, height = 138, places = [], foodOffers = [], selectedOfferId, hideStatus = false, onPlacePress, onOfferPress, children }: MapPreviewProps) {
  const { i18n, t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const coordinates = useMemo(
    () => (route?.coordinates.length ? route.coordinates : emptyCoordinates),
    [route],
  );
  const hasOverlay = !!children;
  const fitCoordinates = useMemo(() => [...coordinates, ...places.map(({ coordinate }) => coordinate), ...foodOffers.map(({ place }) => place.coordinate)], [coordinates, places, foodOffers]);
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
    if (fitCoordinates.length > 1) {
      mapRef.current?.fitToCoordinates(fitCoordinates, {
        animated: false,
        edgePadding: { top: fullScreen ? 78 : hasOverlay ? 88 : 42, right: 42, bottom: fullScreen ? 220 : 42, left: 42 },
      });
    }
  };

  const initialRegion = useMemo(() => {
    const latitudes = fitCoordinates.map((point) => point.latitude);
    const longitudes = fitCoordinates.map((point) => point.longitude);
    const latitude = latitudes.length ? (Math.min(...latitudes) + Math.max(...latitudes)) / 2 : 10.7769;
    const longitude = longitudes.length ? (Math.min(...longitudes) + Math.max(...longitudes)) / 2 : 106.7009;
    const latitudeDelta = Math.max(0.02, (Math.max(...latitudes, latitude) - Math.min(...latitudes, latitude)) * 1.5);
    const longitudeDelta = Math.max(0.02, (Math.max(...longitudes, longitude) - Math.min(...longitudes, longitude)) * 1.5);
    return { latitude, longitude, latitudeDelta, longitudeDelta };
  }, [fitCoordinates]);

  useEffect(() => {
    fitRoute();
  }, [fitCoordinates, fullScreen, hasOverlay]);

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
        {places.filter((place) => !foodOffers.some((offer) => offer.place.id === place.id)).map((place) => <Marker key={place.id} coordinate={place.coordinate} title={place.name} onPress={() => onPlacePress?.(place)}>
          <View style={styles.marker}>
            <PlaceThumbnail accessibilityLabel={place.name} place={place} size={42} tone="green" />
          </View>
        </Marker>)}
        {foodOffers.map((offer) => {
          const selected = offer.id === selectedOfferId;
          const price = formatMoneyCompact(offer.amount, offer.currency, marketLocale(offer.place.countryCode, i18n.language));
          const foodName = offer.itemName;
          const evidence = t('app.reportedPriceShort');
          return <Marker key={offer.id} accessibilityLabel={`${offer.place.name}, ${foodName}, ${price}, ${evidence}`} accessibilityRole="button" accessibilityState={{ selected }} coordinate={offer.place.coordinate} description={`${foodName} · ${price} · ${evidence}`} title={offer.place.name} onPress={() => onOfferPress?.(offer)}>
            <View style={[styles.pricePin, selected && styles.pricePinSelected]}><Text numberOfLines={1} style={styles.pricePinText}>{price}</Text></View>
          </Marker>;
        })}
      </MapView> : null}
      {children}
      {!hideStatus ? <View style={[styles.statusPill, children ? styles.statusTop : undefined]}>
        {isLoading ? <ActivityIndicator color={colors.forest} size="small" /> : null}
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View> : null}
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
  pricePin: { minWidth: 62, maxWidth: 92, height: 32, paddingHorizontal: 9, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest, borderWidth: 2, borderColor: colors.white, boxShadow: '0 3px 10px rgba(0,0,0,0.22)' },
  pricePinSelected: { backgroundColor: colors.accent, transform: [{ scale: 1.08 }] },
  pricePinText: { color: colors.white, fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
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
    zIndex: 21,
  },
  statusTop: { bottom: undefined, top: 10 },
  statusText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
});
