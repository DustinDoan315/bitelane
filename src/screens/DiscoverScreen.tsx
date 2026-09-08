import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { FilterChip } from '../components/FilterChip';
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
        <View style={styles.routeCopy}>
          <Text style={styles.routeLabel}>{t('app.routeLabel')}</Text>
          <Text numberOfLines={2} style={styles.address}>{journey.origin.label}</Text>
          <Text style={styles.routeArrow}>↓</Text>
          <Text numberOfLines={2} style={styles.address}>{journey.destination.label}</Text>
        </View>
        <ActionButton secondary label={t('app.edit')} onPress={onSetup} />
      </View>
      {route ? <>
        <Text style={styles.small}>{t('app.routeMeta', { minutes: Math.round(route.durationSeconds / 60), km: (route.distanceMeters / 1000).toFixed(1) })}</Text>
        <ActionButton secondary label={t('commute.openMap')} onPress={onMap} />
      </> : null}
      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}><Text style={styles.currency}>₫</Text></View>
        <View style={styles.budgetCopy}>
          <Text style={styles.budgetEyebrow}>{t('app.budgetEyebrow')}</Text>
          <Text style={styles.budgetTitle}>{t('app.budgetTitle')}</Text>
          <Text style={styles.small}>{t('app.budgetHelp')}</Text>
        </View>
      </View>
      <View style={styles.filters}>
        <FilterChip label={t('app.vegetarianOnly')} selected={preferences.vegetarianOnly} onPress={() => onPreferences({ ...preferences, vegetarianOnly: !preferences.vegetarianOnly })} />
        <FilterChip label={t('app.hideVisited')} selected={preferences.hideVisited} onPress={() => onPreferences({ ...preferences, hideVisited: !preferences.hideVisited })} />
      </View>
      {phase !== 'idle' ? <View style={styles.welcome}><ActivityIndicator color={colors.forest} /><Text accessibilityLiveRegion="polite" style={styles.body}>{t(`app.loading.${phase}`)}</Text></View> : error ? <View style={styles.welcome}>
        <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text>
        <ActionButton label={t('app.retry')} onPress={onRetry} />
      </View> : <>
        <View style={styles.row}><Text style={styles.heading}>{t('app.nearbyTitle')}</Text><Pressable accessibilityRole="button" onPress={onRetry} style={styles.refresh}><Text style={styles.refreshText}>{t('app.refresh')}</Text></Pressable></View>
        <Text style={styles.small}>{t('app.placesCount', { count: candidates.length })} · {t('app.rankingHelp')}</Text>
        {!candidates.length ? <View style={styles.welcome}><Text style={styles.heading}>{t('app.noPlaces')}</Text><Text style={styles.body}>{t('app.noPlacesHelp')}</Text></View> : null}
        {candidates.slice(0, Math.min(limit, 5)).map(({ place, distanceFromRouteMeters }, index) => <PlaceCard key={place.id} place={place}
          saved={saved.some((p) => p.id === place.id)} onOpen={() => onOpen(place)} onSave={() => onSave(place)} distance={distanceFromRouteMeters}
          subtitle={index === 0 ? t('app.closest') : undefined} />)}
        {candidates.length > Math.min(limit, 5) ? <ActionButton secondary label={t('app.showMore')} onPress={() => setLimit((value) => value + 5)} /> : null}
      </>}
    </>}
    <Text style={styles.small}>{t('app.dataNotice')}</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { padding: 24, gap: 18, paddingBottom: 32 }, eyebrow: { color: colors.accent, fontWeight: '800', fontSize: 11, letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 40 }, body: { color: colors.secondaryText, fontSize: 15, lineHeight: 23 },
  heading: { color: colors.text, fontSize: 19, fontWeight: '800' }, welcome: { backgroundColor: colors.greenSoft, borderRadius: 22, padding: 22, gap: 16 },
  journey: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, padding: 18, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: colors.border }, routeCopy: { flex: 1, gap: 7 }, routeLabel: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, routeArrow: { color: colors.secondaryText, fontSize: 16 }, address: { fontSize: 14, fontWeight: '700', color: colors.text },
  budgetCard: { flexDirection: 'row', gap: 14, backgroundColor: colors.peach, borderRadius: 20, padding: 18, alignItems: 'flex-start' }, budgetIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, currency: { color: colors.accent, fontSize: 24, fontWeight: '800' }, budgetCopy: { flex: 1, gap: 5 }, budgetEyebrow: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, budgetTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, refresh: { padding: 8, minHeight: 40, justifyContent: 'center' }, refreshText: { color: colors.forest, fontSize: 14, fontWeight: '700' }, error: { color: colors.accent, lineHeight: 22 },
});
