import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { MapPreview } from '../components/MapPreview';
import { PlaceCard } from '../components/PlaceCard';
import { colors } from '../theme';
import type { Candidate, Journey, Place, Preferences, RouteData } from '../types';

export function DiscoverScreen({ journey, route, candidates, phase, error, saved, preferences, onPreferences, onSetup, onRetry, onMap, onOpen, onSave }: {
  journey: Journey | null; route: RouteData | null; candidates: Candidate[]; phase: 'idle' | 'route' | 'places'; error: string | null;
  saved: Place[]; preferences: Preferences; onPreferences: (value: Preferences) => void; onSetup: () => void;
  onRetry: () => void; onMap: () => void; onOpen: (place: Place) => void; onSave: (place: Place) => void;
}) {
  const { t } = useTranslation();
  const [limit, setLimit] = useState(10);
  useEffect(() => setLimit(10), [candidates]);
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.eyebrow}>{t('app.discoverEyebrow')}</Text>
    <Text style={styles.title}>{t('app.discoverTitle')}</Text>
    <Text style={styles.body}>{t('app.discoverHelp')}</Text>
    {!journey ? <View style={styles.welcome}>
      <Text style={styles.heading}>{t('app.startTitle')}</Text>
      <Text style={styles.body}>{t('app.startHelp')}</Text>
      <ActionButton label={t('app.setupRoute')} onPress={onSetup} />
    </View> : <>
      <View style={styles.journey}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text numberOfLines={2} style={styles.address}>{journey.origin.label}</Text>
          <Text style={styles.body}>↓</Text>
          <Text numberOfLines={2} style={styles.address}>{journey.destination.label}</Text>
        </View>
        <ActionButton secondary label={t('app.edit')} onPress={onSetup} />
      </View>
      <MapPreview route={route} isLoading={phase === 'route'} error={error} places={candidates.slice(0, 30).map((c) => c.place)} />
      {route ? <>
        <Text style={styles.small}>{t('app.routeMeta', { minutes: Math.round(route.durationSeconds / 60), km: (route.distanceMeters / 1000).toFixed(1) })}</Text>
        <ActionButton secondary label={t('commute.openMap')} onPress={onMap} />
      </> : null}
      <View style={styles.filters}>
        <Filter label={t('app.vegetarianOnly')} value={preferences.vegetarianOnly} onChange={(value) => onPreferences({ ...preferences, vegetarianOnly: value })} />
        <Filter label={t('app.hideVisited')} value={preferences.hideVisited} onChange={(value) => onPreferences({ ...preferences, hideVisited: value })} />
      </View>
      {phase !== 'idle' ? <View style={styles.welcome}><ActivityIndicator color={colors.forest} /><Text accessibilityLiveRegion="polite" style={styles.body}>{t(`app.loading.${phase}`)}</Text></View> : error ? <View style={styles.welcome}>
        <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text>
        <ActionButton label={t('app.retry')} onPress={onRetry} />
      </View> : <>
        <View style={styles.row}><Text style={styles.heading}>{t('app.placesCount', { count: candidates.length })}</Text><ActionButton secondary label={t('app.refresh')} onPress={onRetry} /></View>
        <Text style={styles.small}>{t('app.rankingHelp')}</Text>
        {!candidates.length ? <View style={styles.welcome}><Text style={styles.heading}>{t('app.noPlaces')}</Text><Text style={styles.body}>{t('app.noPlacesHelp')}</Text></View> : null}
        {candidates.slice(0, limit).map(({ place, distanceFromRouteMeters }, index) => <PlaceCard key={place.id} place={place}
          saved={saved.some((p) => p.id === place.id)} onOpen={() => onOpen(place)} onSave={() => onSave(place)} distance={distanceFromRouteMeters}
          subtitle={index === 0 ? t('app.closest') : undefined} />)}
        {candidates.length > limit ? <ActionButton secondary label={t('app.showMore')} onPress={() => setLimit((value) => value + 10)} /> : null}
      </>}
    </>}
    <Text style={styles.small}>{t('app.dataNotice')}</Text>
  </ScrollView>;
}

function Filter({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.row}><Text style={[styles.body, { flex: 1 }]}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: colors.forest }} /></View>;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18, paddingBottom: 32 }, eyebrow: { color: colors.accent, fontWeight: '800', fontSize: 11, letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 40 }, body: { color: colors.secondaryText, fontSize: 15, lineHeight: 23 },
  heading: { color: colors.text, fontSize: 19, fontWeight: '800' }, welcome: { backgroundColor: colors.greenSoft, borderRadius: 22, padding: 22, gap: 16 },
  journey: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, padding: 18, alignItems: 'center', gap: 16 }, address: { fontSize: 14, fontWeight: '600', color: colors.text },
  small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 }, filters: { gap: 14 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, error: { color: colors.accent, lineHeight: 22 },
});
