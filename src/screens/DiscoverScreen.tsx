import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { FilterChip } from '../components/FilterChip';
import { FoodOfferCard } from '../components/FoodOfferCard';
import { MealBudgetCard } from '../components/MealBudgetCard';
import { colors } from '../theme';
import type { BudgetSettings, FoodOffer, Journey, Place, Preferences, RouteData } from '../types';

export function DiscoverScreen({ journey, route, offers, budget, phase, error, saved, preferences, onPreferences, onBudget, onSetup, onRetry, onMap, onOpen, onSave }: {
  journey: Journey | null; route: RouteData | null; phase: 'idle' | 'route' | 'places'; error: string | null;
  saved: Place[]; preferences: Preferences; onPreferences: (value: Preferences) => void; onSetup: () => void;
  onRetry: () => void; onMap: () => void; onOpen: (offer: FoodOffer) => void; onSave: (place: Place) => void;
  budget: BudgetSettings; offers: FoodOffer[]; onBudget: (value: BudgetSettings) => void;
}) {
  const { t } = useTranslation();
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
      <MealBudgetCard budget={budget} matchCount={offers.length} onApply={onBudget} />
      <View style={styles.filters}>
        <FilterChip label={t('app.vegetarianOnly')} selected={preferences.vegetarianOnly} onPress={() => onPreferences({ ...preferences, vegetarianOnly: !preferences.vegetarianOnly })} />
        <FilterChip label={t('app.hideVisited')} selected={preferences.hideVisited} onPress={() => onPreferences({ ...preferences, hideVisited: !preferences.hideVisited })} />
      </View>
      {phase !== 'idle' ? <View style={styles.welcome}><ActivityIndicator color={colors.forest} /><Text accessibilityLiveRegion="polite" style={styles.body}>{t(`app.loading.${phase}`)}</Text></View> : error ? <View style={styles.welcome}>
        <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text>
        <ActionButton label={t('app.retry')} onPress={onRetry} />
      </View> : <>
        <View style={[styles.offerHeader, styles.row]}>
          <Text style={styles.heading}>{t('app.budgetResults')}</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.refresh}><Text style={styles.refreshText}>{t('app.refresh')}</Text></Pressable>
        </View>
        {offers.length ? offers.slice(0, 5).map((offer) => <FoodOfferCard key={offer.id} offer={offer}
          saved={saved.some((p) => p.id === offer.place.id)} onOpen={() => onOpen(offer)} onSave={() => onSave(offer.place)} />)
          : <View style={styles.budgetEmpty}><Text style={styles.heading}>{t('app.budgetNoMatches')}</Text><Text style={styles.body}>{t('app.budgetNoMatchesHelp')}</Text></View>}
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
  small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, offerHeader: { paddingTop: 4 }, budgetEmpty: { backgroundColor: colors.greenSoft, borderRadius: 18, padding: 18, gap: 8 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, refresh: { padding: 8, minHeight: 40, justifyContent: 'center' }, refreshText: { color: colors.forest, fontSize: 14, fontWeight: '700' }, error: { color: colors.accent, lineHeight: 22 },
});
