import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import { colors } from '../theme';
import type { Coordinate, Place, RouteData } from '../types';
import { formatRating } from '../services/format';
import { getPlaceImage } from '../services/placeImageService';

export type MapPreviewProps = {
  route?: RouteData | null;
  isLoading?: boolean;
  error?: string | null;
  fullScreen?: boolean;
  height?: number;
  places?: Place[];
  onPlacePress?: (place: Place) => void;
};

const emptyCoordinates: Coordinate[] = [];
const emptyPlaces: Place[] = [];

type LeafletModule = typeof import('leaflet');

function WebMap({ coordinates, fullScreen, live, places, onPlacePress, ratingLocale }: { coordinates: Coordinate[]; fullScreen: boolean; live: boolean; places: Place[]; onPlacePress?: (place: Place) => void; ratingLocale: string }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const glowRef = useRef<import('leaflet').Polyline | null>(null);
  const routeRef = useRef<import('leaflet').Polyline | null>(null);
  const startRef = useRef<import('leaflet').CircleMarker | null>(null);
  const endRef = useRef<import('leaflet').CircleMarker | null>(null);
  const tileLayersRef = useRef<import('leaflet').TileLayer[]>([]);
  const placesRef = useRef<import('leaflet').Marker[]>([]);
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
      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(mapElementRef.current);
      map.on('unload', () => observer.disconnect());
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

    const imageryLayer = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayersRef.current = [imageryLayer];
    imageryLayer.addTo(map);

  }, [isReady]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!isReady || !map || !leaflet) return;
    placesRef.current.forEach((marker) => marker.removeFrom(map));
    let cancelled = false;
    const escapeHtml = (value: string) => value.replace(/[&<>\"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
    const addMarkers = async () => {
      const markerData = await Promise.all(places.map(async (place) => ({ place, imageUrl: await getPlaceImage(place) })));
      if (cancelled) return;
      placesRef.current = markerData.map(({ place, imageUrl }) => {
        const image = imageUrl ? `<img alt="" src="${escapeHtml(imageUrl)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;transform:rotate(45deg);" />` : '<span style="font-size:18px;transform:rotate(45deg);">🍜</span>';
        const ratingBadge = place.rating !== undefined
          ? `<span style="background:#FFE8B6;border:1px solid #FFD9B5;border-radius:8px;color:#F45124;font-size:9px;font-weight:800;left:27px;line-height:14px;padding:0 3px;position:absolute;top:-8px;transform:rotate(45deg);white-space:nowrap;">★${formatRating(place.rating, ratingLocale)}</span>`
          : '';
        const icon = leaflet.divIcon({
          className: 'bitelane-food-marker',
          html: `<div style="align-items:center;background:#ffffff;border:3px solid #ffffff;border-radius:50% 50% 50% 0;box-shadow:0 2px 6px rgba(0,0,0,.25);display:flex;height:42px;justify-content:center;position:relative;transform:rotate(-45deg);width:42px;">${image}${ratingBadge}</div>`,
          iconAnchor: [21, 42], iconSize: [42, 42],
        });
        const marker = leaflet.marker([place.coordinate.latitude, place.coordinate.longitude], { icon, title: place.name }).addTo(map);
        marker.on('click', () => onPlacePress?.(place));
        return marker;
      });
    };
    void addMarkers();
    return () => {
      cancelled = true;
      placesRef.current.forEach((marker) => marker.removeFrom(map));
      placesRef.current = [];
    };
  }, [places, isReady, onPlacePress, ratingLocale]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!isReady || !map || !leaflet) {
      return;
    }

    glowRef.current?.removeFrom(map);
    routeRef.current?.removeFrom(map);
    startRef.current?.removeFrom(map);
    endRef.current?.removeFrom(map);

    const latLngs = coordinates.map(({ latitude, longitude }) => [latitude, longitude] as [number, number]);

    if (latLngs.length < 2) {
      return;
    }

    if (live) {
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
          color: colors.accent,
          lineCap: 'round',
          lineJoin: 'round',
          opacity: 1,
          weight: fullScreen ? 5 : 4,
        })
        .addTo(map);
    }

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

export function MapPreview({ route, isLoading = false, error, fullScreen = false, height = 138, places = emptyPlaces, onPlacePress }: MapPreviewProps) {
  const { i18n, t } = useTranslation();
  const live = route?.source === 'live';
  const coordinates = useMemo(
    () => (route?.coordinates.length ? route.coordinates : emptyCoordinates),
    [route],
  );
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : live && error
      ? t('commute.mapDataWarning')
      : live
        ? t(route?.mode === 'driving' ? 'commute.roadRoute' : 'commute.liveRoute')
        : error
          ? t('commute.routeFallback')
          : t('commute.routePreview');

  return (
    <View style={[styles.map, !fullScreen && { height }, fullScreen && styles.fullScreenMap]}>
      {coordinates.length > 1 ? <WebMap coordinates={coordinates} fullScreen={fullScreen} live={live} places={places} onPlacePress={onPlacePress} ratingLocale={i18n.language === 'vi' ? 'vi-VN' : 'en-US'} /> : null}
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
