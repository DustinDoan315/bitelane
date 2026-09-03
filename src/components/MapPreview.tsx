import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import { Icon } from './Icon';
import { colors } from '../theme';
import type { Coordinate, MapType, RouteData } from '../types';

export type MapPreviewProps = {
  route?: RouteData | null;
  isLoading?: boolean;
  error?: string | null;
  fullScreen?: boolean;
  mapType?: MapType;
  onPress?: () => void;
};

const fallbackCoordinates: Coordinate[] = [
  { latitude: 10.73287, longitude: 106.708003 },
  { latitude: 10.7395, longitude: 106.704 },
  { latitude: 10.755, longitude: 106.701 },
  { latitude: 10.771, longitude: 106.698 },
  { latitude: 10.7862, longitude: 106.6962 },
];

type LeafletModule = typeof import('leaflet');

function WebMap({ coordinates, fullScreen, live, mapType }: { coordinates: Coordinate[]; fullScreen: boolean; live: boolean; mapType: MapType }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const glowRef = useRef<import('leaflet').Polyline | null>(null);
  const routeRef = useRef<import('leaflet').Polyline | null>(null);
  const startRef = useRef<import('leaflet').CircleMarker | null>(null);
  const endRef = useRef<import('leaflet').CircleMarker | null>(null);
  const tileLayersRef = useRef<import('leaflet').TileLayer[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import('leaflet').then((leaflet) => {
      if (cancelled || !mapElementRef.current) {
        return;
      }

      const map = leaflet.map(mapElementRef.current, {
        attributionControl: true,
        dragging: fullScreen,
        scrollWheelZoom: fullScreen,
        zoomControl: false,
      });

      if (fullScreen) {
        leaflet.control.zoom({ position: 'topright' }).addTo(map);
      }

      mapRef.current = map;
      leafletRef.current = leaflet;
      setIsReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [fullScreen]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!isReady || !map || !leaflet) {
      return;
    }

    tileLayersRef.current.forEach((layer) => layer.removeFrom(map));

    const imageryLayer = mapType === 'standard'
      ? leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        })
      : leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
        });

    tileLayersRef.current = [imageryLayer];
    imageryLayer.addTo(map);

    if (mapType === 'hybrid') {
      const labelsLayer = leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 20,
        subdomains: 'abcd',
      });

      tileLayersRef.current.push(labelsLayer);
      labelsLayer.addTo(map);
    }
  }, [isReady, mapType]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!isReady || !map || !leaflet || coordinates.length < 2) {
      return;
    }

    glowRef.current?.removeFrom(map);
    routeRef.current?.removeFrom(map);
    startRef.current?.removeFrom(map);
    endRef.current?.removeFrom(map);

    const latLngs = coordinates.map(({ latitude, longitude }) => [latitude, longitude] as [number, number]);
    const routeColor = live ? colors.accent : colors.secondaryText;

    glowRef.current = leaflet
      .polyline(latLngs, {
        color: colors.white,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 0.92,
        weight: fullScreen ? 9 : 7,
      })
      .addTo(map);
    routeRef.current = leaflet
      .polyline(latLngs, {
        color: routeColor,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: live ? 1 : 0.82,
        weight: fullScreen ? 5 : 4,
      })
      .addTo(map);
    startRef.current = leaflet
      .circleMarker(latLngs[0], {
        color: colors.forest,
        fillColor: colors.white,
        fillOpacity: 1,
        radius: fullScreen ? 8 : 6,
        weight: 3,
      })
      .addTo(map);
    endRef.current = leaflet
      .circleMarker(latLngs[latLngs.length - 1], {
        color: colors.white,
        fillColor: colors.accent,
        fillOpacity: 1,
        radius: fullScreen ? 9 : 7,
        weight: 3,
      })
      .addTo(map);

    const bounds = leaflet.latLngBounds(latLngs);
    map.fitBounds(bounds, {
      paddingTopLeft: [fullScreen ? 32 : 18, fullScreen ? 58 : 18],
      paddingBottomRight: [fullScreen ? 32 : 18, fullScreen ? 210 : 18],
    });
  }, [coordinates, fullScreen, isReady, live]);

  return <div ref={mapElementRef} style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }} />;
}

export function MapPreview({ route, isLoading = false, error, fullScreen = false, mapType = 'standard', onPress }: MapPreviewProps) {
  const { t } = useTranslation();
  const live = route?.source === 'live';
  const coordinates = useMemo(
    () => (route?.coordinates.length ? route.coordinates : fallbackCoordinates),
    [route],
  );
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : live
      ? t('commute.liveRoute')
      : error
        ? t('commute.routeFallback')
        : t('commute.routePreview');

  return (
    <View style={[styles.map, fullScreen && styles.fullScreenMap]}>
      <WebMap coordinates={coordinates} fullScreen={fullScreen} live={live} mapType={mapType} />
      {onPress && !fullScreen ? (
        <Pressable
          accessibilityLabel={t('commute.openMap')}
          accessibilityRole="button"
          onPress={onPress}
          style={styles.mapTapOverlay}
        />
      ) : null}
      {onPress && !fullScreen ? (
        <View pointerEvents="none" style={styles.expandHint}>
          <Icon color={colors.forest} name="fullscreen" size={17} />
        </View>
      ) : null}
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
  fullScreenMap: {
    borderRadius: 0,
    flex: 1,
    height: undefined,
  },
  mapTapOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  expandHint: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
    zIndex: 21,
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
    zIndex: 21,
  },
  statusText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
});
