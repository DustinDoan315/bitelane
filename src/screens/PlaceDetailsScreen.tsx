import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Journey, Place, RouteData } from '../types';
import { ActionButton } from '../components/ActionButton';
import { MapPreview } from '../components/MapPreview';
import { getRoute } from '../services/routeService';
import { getNavigationUrl } from '../services/navigationService';
import { colors } from '../theme';

export function PlaceDetailsScreen({ place, journey, baseRoute, saved, onSave, onVisit, onBack }: {
  place: Place; journey: Journey | null; baseRoute: RouteData | null; saved: boolean; onSave: () => void; onVisit: () => void; onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visited, setVisited] = useState(false);
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);
  const checkDetour = async () => {
    if (!journey || !baseRoute || loading) return;
    const id = ++request.current;
    setLoading(true); setError(null);
    try {
      const next = await getRoute([journey.origin.coordinate, place.coordinate, journey.destination.coordinate]);
      if (id === request.current) setRoute(next);
    } catch (e) { if (id === request.current) setError(e instanceof Error ? e.message : 'networkError'); }
    finally { if (id === request.current) setLoading(false); }
  };
  const open = async (url: string) => {
    setError(null);
    try { await Linking.openURL(url); } catch { setError('navigationError'); }
  };
  return <ScrollView contentContainerStyle={styles.page}>
    <ActionButton secondary label={t('app.back')} onPress={onBack} />
    <Text style={styles.eyebrow}>{t(`app.categories.${place.category}`)}</Text>
    <Text style={styles.title}>{place.name}</Text>
    <Text style={styles.body}>{place.address || t('app.addressUnknown')}</Text>
    {place.cuisine ? <Text style={styles.body}>{place.cuisine}</Text> : null}
    <View style={styles.facts}>
      <Text style={styles.label}>{t('app.hours')}</Text>
      <Text style={styles.body}>{place.openingHours || t('app.hoursUnknown')}</Text>
      <Text style={styles.small}>{t('app.hoursNote')}</Text>
      <Text style={styles.label}>{t('app.price')}</Text>
      <Text style={styles.body}>{t('app.priceUnknown')}</Text>
      {place.vegetarian ? <Text style={styles.body}>{t('app.vegetarianNote')}</Text> : null}
    </View>
    {journey && baseRoute ? <>
      <MapPreview route={route ?? baseRoute} places={[place]} isLoading={loading} />
      <ActionButton secondary disabled={loading} label={t('app.checkDetour')} onPress={() => void checkDetour()} />
      {loading ? <ActivityIndicator color={colors.forest} /> : null}
      {route ? <Text style={styles.label}>{t('app.detour', { minutes: Math.ceil(Math.max(0, route.durationSeconds - baseRoute.durationSeconds) / 60) })}</Text> : null}
      <Text style={styles.small}>{t('app.detourNote')}</Text>
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.networkError') })}</Text> : null}
    <ActionButton label={t('app.navigate')} onPress={() => void open(getNavigationUrl(place))} />
    <ActionButton secondary label={t(saved ? 'app.removeSaved' : 'app.save')} onPress={onSave} />
    <ActionButton secondary disabled={visited} label={t(visited ? 'app.visitRecorded' : 'app.recordVisit')} onPress={() => { onVisit(); setVisited(true); }} />
    <Text style={styles.small}>{t('app.visitNote')}</Text>
    <ActionButton secondary label={t('app.viewSource')} onPress={() => void open(place.sourceUrl)} />
    <Text style={styles.small}>{t('app.fetched', { date: new Date(place.fetchedAt).toLocaleString(i18n.language) })}</Text>
  </ScrollView>;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18 }, eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 32, color: colors.text, fontWeight: '800' }, body: { color: colors.secondaryText, fontSize: 15, lineHeight: 23 },
  label: { color: colors.forest, fontSize: 15, fontWeight: '700' }, facts: { backgroundColor: colors.white, borderRadius: 20, padding: 20, gap: 12 },
  small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 }, error: { color: colors.accent, lineHeight: 22 },
});
