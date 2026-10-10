import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { FilterChip } from '../components/FilterChip';
import { MapPreview } from '../components/MapPreview';
import { MealBudgetCard } from '../components/MealBudgetCard';
import { PlaceThumbnail } from '../components/PlaceThumbnail';
import { SaveButton } from '../components/SaveButton';
import { formatMoney } from '../services/market';
import { formatRouteDistance, marketLocale } from '../services/market';
import { colors } from '../theme';
import type { BudgetSettings, Candidate, FoodOffer, Journey, Place, Preferences, RouteData } from '../types';

type ResultRow = { candidate: Candidate; detourMinutes: number; offer?: FoodOffer };
const detourChoices = [5, 10, 15, 20, 30];

export function DiscoverScreen({ journey, route, candidates, offers, detours, budget, phase, error, saved, preferences, onPreferences, onBudget, onSetup, onRetry, onOpenOffer, onOpenPlace, onSave }: {
  journey: Journey | null; route: RouteData | null; candidates: Candidate[]; offers: FoodOffer[]; detours: Record<string, number | null>;
  phase: 'idle' | 'route' | 'places' | 'detours'; error: string | null;
  saved: Place[]; preferences: Preferences; onPreferences: (value: Preferences) => void; onSetup: () => void;
  onRetry: () => void; onOpenOffer: (offer: FoodOffer) => void; onOpenPlace: (place: Place) => void; onSave: (place: Place) => void;
  budget: BudgetSettings; onBudget: (value: BudgetSettings) => void;
}) {
  const { t, i18n } = useTranslation();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const currencyLocale = marketLocale(journey?.origin.countryCode ?? 'VN', i18n.language);
  const latestOfferByPlace = useMemo(() => {
    const grouped = new Map<string, FoodOffer[]>();
    for (const offer of offers) grouped.set(offer.place.id, [...(grouped.get(offer.place.id) ?? []), offer]);
    return new Map([...grouped].map(([placeId, items]) => [placeId, items.sort((a, b) => a.amount - b.amount)]));
  }, [offers]);
  const rows = useMemo(() => {
    const query = budget.dishQuery.trim().toLocaleLowerCase();
    const known: ResultRow[] = [];
    const unknown: ResultRow[] = [];
    for (const candidate of candidates) {
      const detourMinutes = detours[candidate.place.id];
      if (detourMinutes === undefined || detourMinutes === null || detourMinutes > preferences.maxDetourMinutes) continue;
      const reports = latestOfferByPlace.get(candidate.place.id) ?? [];
      const affordable = reports.find((offer) => offer.withinBudget);
      if (affordable) known.push({ candidate, detourMinutes, offer: affordable });
      else if (!query && reports.length === 0) unknown.push({ candidate, detourMinutes });
    }
    const byDetour = (a: ResultRow, b: ResultRow) => a.detourMinutes - b.detourMinutes || a.candidate.distanceFromRouteMeters - b.candidate.distanceFromRouteMeters;
    known.sort(byDetour);
    unknown.sort(byDetour);
    return [...known, ...unknown].slice(0, 5);
  }, [budget.dishQuery, candidates, detours, latestOfferByPlace, preferences.maxDetourMinutes]);
  const mapPlaces = useMemo(() => rows.map(({ candidate }) => candidate.place), [rows]);
  const mapOffers = useMemo(() => rows.flatMap(({ offer }) => offer ? [offer] : []), [rows]);

  if (!journey) return <ScrollView contentContainerStyle={[styles.page, styles.emptyPage]}>
    <View style={styles.welcome}>
      <Text style={styles.foodMark}>🍜</Text>
      <Text style={styles.emptyTitle}>{t('app.discoverTitle')}</Text>
      <ActionButton label={t('app.setupRoute')} onPress={onSetup} />
    </View>
  </ScrollView>;

  const routeMeta = route ? `${formatRouteDistance(route.distanceMeters, journey.origin.countryCode, currencyLocale)} · ${t('app.minutesShort', { count: Math.round(route.durationSeconds / 60) })}` : '';
  const currentBudget = `≤${formatMoney(budget.maxPerPerson, budget.currency, currencyLocale)}`;
  const emptyTitle = candidates.length === 0 ? 'app.noPlaces'
    : budget.dishQuery && offers.length === 0 ? 'app.noMealEvidence'
      : offers.length > 0 ? 'app.noMatchingMeals' : 'app.noPlaces';
  const emptyHelp = candidates.length === 0 ? 'app.noPlacesHelp'
    : budget.dishQuery && offers.length === 0 ? 'app.noMealEvidenceHelp'
      : offers.length > 0 ? 'app.noMatchingMealsHelp' : 'app.noDetourOptions';
  return <ScrollView contentContainerStyle={styles.page}>
    {error ? <View accessibilityRole="alert" style={styles.errorNotice}>
      <Text numberOfLines={2} style={styles.errorText}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}><Text style={styles.retryText}>{t('app.retry')}</Text></Pressable>
    </View> : null}

    <View style={styles.routeCard}>
      <Text style={styles.eyebrow}>{t('app.routeLabel')}</Text>
      <View style={styles.routeLine}><Text numberOfLines={1} style={styles.routeAddress}>{journey.origin.label}</Text><Text style={styles.arrow}>→</Text><Text numberOfLines={1} style={styles.routeAddress}>{journey.destination.label}</Text></View>
      <View style={styles.routeActions}>
        <Text style={styles.routeMeta}>{routeMeta}</Text>
        <Pressable accessibilityRole="button" onPress={onSetup} style={styles.editButton}><Text style={styles.editText}>{t('app.edit')}</Text></Pressable>
      </View>
    </View>

    <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('app.editBudget')} accessibilityState={{ expanded: budgetOpen }} onPress={() => setBudgetOpen((open) => !open)} style={styles.budgetChip}>
        <Text numberOfLines={1} style={styles.budgetChipText}>{currentBudget}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('app.detourLimit')} onPress={() => { const currentIndex = detourChoices.indexOf(preferences.maxDetourMinutes); const next = detourChoices[(currentIndex + 1) % detourChoices.length]; onPreferences({ ...preferences, maxDetourMinutes: next }); }} style={styles.budgetChip}>
        <Text style={styles.budgetChipText}>+{t('app.minutesShort', { count: preferences.maxDetourMinutes })}</Text>
      </Pressable>
      <FilterChip label={t('app.vegetarianOnly')} selected={preferences.vegetarianOnly} onPress={() => onPreferences({ ...preferences, vegetarianOnly: !preferences.vegetarianOnly })} />
      <FilterChip label={t('app.hideVisited')} selected={preferences.hideVisited} onPress={() => onPreferences({ ...preferences, hideVisited: !preferences.hideVisited })} />
    </View>
    {budgetOpen ? <MealBudgetCard budget={budget} matchCount={offers.filter((offer) => offer.withinBudget).length} onApply={onBudget} /> : null}
    <View style={styles.switch}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: !showMap }} onPress={() => setShowMap(false)} style={[styles.switchButton, !showMap && styles.switchSelected]}><Text style={[styles.switchText, !showMap && styles.switchTextSelected]}>{t('app.list')}</Text></Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: showMap }} onPress={() => setShowMap(true)} style={[styles.switchButton, showMap && styles.switchSelected]}><Text style={[styles.switchText, showMap && styles.switchTextSelected]}>{t('app.map')}</Text></Pressable>
    </View>
    {showMap ? <MapPreview height={390} route={route} places={mapPlaces} foodOffers={mapOffers} onPlacePress={onOpenPlace} onOfferPress={onOpenOffer} error={error} /> : null}
    {!showMap && rows.map((row, index) => <DiscoveryResultCard key={row.offer?.id ?? row.candidate.place.id} row={row} saved={saved.some((place) => place.id === row.candidate.place.id)} onOpen={() => row.offer ? onOpenOffer(row.offer) : onOpenPlace(row.candidate.place)} onSave={() => onSave(row.candidate.place)} />)}
    {phase !== 'idle' ? <Text accessibilityLiveRegion="polite" style={styles.loading}>{t(`app.loading.${phase}`)}</Text> : null}
    {phase === 'idle' && !error && rows.length === 0 ? <View style={styles.emptyResults}>
      <Text style={styles.emptyTitle}>{t(emptyTitle)}</Text>
      <Text style={styles.emptyHelp}>{t(emptyHelp)}</Text>
      {budget.dishQuery ? <Pressable accessibilityRole="button" onPress={() => onBudget({ ...budget, dishQuery: '' })}><Text style={styles.mapHintAction}>{t('app.clearFoodSearch')}</Text></Pressable> : null}
    </View> : null}
    <Text style={styles.notice}>{t('app.reportDataNotice')}</Text>
  </ScrollView>;
}

function DiscoveryResultCard({ row, saved, onOpen, onSave }: { row: ResultRow; saved: boolean; onOpen: () => void; onSave: () => void }) {
  const { t, i18n } = useTranslation();
  const place = row.candidate.place;
  const locale = marketLocale(place.countryCode, i18n.language);
  return <View style={styles.resultCard}>
    <Pressable accessibilityRole="button" accessibilityLabel={row.offer ? t('app.openFoodOffer', { item: row.offer.itemName, name: place.name }) : t('app.openPlace', { name: place.name })} onPress={onOpen} style={styles.resultMain}>
      <PlaceThumbnail accessibilityLabel={place.imageUrl ? t('app.placeImage', { name: place.name }) : t('app.placeImageUnavailable', { name: place.name })} place={place} size={64} />
      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
        <Text numberOfLines={1} style={styles.mealName}>{row.offer?.itemName ?? t(`app.categories.${place.category}`)}</Text>
        {row.offer ? <>
          <Text style={styles.price}>{formatMoney(row.offer.amount, row.offer.currency, locale)}</Text>
          <Text style={styles.evidence}>{t('app.reportedPriceShort')} · {new Date(row.offer.reportedAt).toLocaleDateString(locale)}</Text>
        </> : <Text style={styles.unknown}>{t('app.priceUnknownShort')}</Text>}
        {place.address ? <Text numberOfLines={1} style={styles.address}>{place.address}</Text> : null}
      </View>
    </Pressable>
    <View style={styles.resultBottom}>
      <Text style={styles.detour}>{t('app.detourShort', { minutes: row.detourMinutes })}</Text>
      <Text style={styles.distance}>{t('app.distanceFormatted', { distance: formatRouteDistance(row.candidate.distanceFromRouteMeters, place.countryCode, locale) })}</Text>
      <SaveButton compact place={place} saved={saved} onPress={onSave} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 24, gap: 12 }, emptyPage: { flex: 1, justifyContent: 'center' },
  welcome: { alignItems: 'center', gap: 20, padding: 24 }, foodMark: { fontSize: 50 }, emptyTitle: { color: colors.text, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  routeCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, gap: 8, padding: 14 }, eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  routeLine: { alignItems: 'center', flexDirection: 'row', gap: 8 }, routeAddress: { color: colors.text, flex: 1, fontSize: 14, fontWeight: '700' }, arrow: { color: colors.accent, fontSize: 16, fontWeight: '800' }, routeActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, routeMeta: { color: colors.secondaryText, fontSize: 12 }, editButton: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 8 }, editText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, budgetChip: { backgroundColor: colors.greenSoft, borderRadius: 18, justifyContent: 'center', minHeight: 38, maxWidth: '100%', paddingHorizontal: 12 }, budgetChipText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  switch: { backgroundColor: colors.peach, borderRadius: 18, flexDirection: 'row', padding: 4 }, switchButton: { alignItems: 'center', borderRadius: 15, flex: 1, justifyContent: 'center', minHeight: 40 }, switchSelected: { backgroundColor: colors.accent }, switchText: { color: colors.text, fontSize: 14, fontWeight: '700' }, switchTextSelected: { color: colors.white },
  resultCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, gap: 10, padding: 12 }, resultMain: { flexDirection: 'row', gap: 12 }, resultCopy: { flex: 1, gap: 3 }, placeName: { color: colors.text, fontSize: 16, fontWeight: '800' }, mealName: { color: colors.secondaryText, fontSize: 13 }, price: { color: colors.accent, fontSize: 20, fontWeight: '800' }, evidence: { color: colors.forest, fontSize: 11, fontWeight: '700' }, unknown: { color: colors.secondaryText, fontSize: 14, fontWeight: '700' }, address: { color: colors.secondaryText, fontSize: 11 },
  resultBottom: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 38, paddingTop: 7 }, detour: { backgroundColor: colors.greenSoft, borderRadius: 12, color: colors.forest, fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 }, distance: { color: colors.secondaryText, flex: 1, fontSize: 11 },
  loading: { color: colors.secondaryText, fontSize: 13, padding: 8, textAlign: 'center' }, emptyResults: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: 16, gap: 8, padding: 18 }, emptyHelp: { color: colors.secondaryText, fontSize: 13, lineHeight: 20, textAlign: 'center' }, mapHintAction: { color: colors.accent, fontSize: 13, fontWeight: '800' }, notice: { color: colors.secondaryText, fontSize: 11, lineHeight: 17, paddingHorizontal: 4 }, errorNotice: { alignItems: 'center', backgroundColor: colors.peach, borderRadius: 14, flexDirection: 'row', gap: 8, padding: 12 }, errorText: { color: colors.accent, flex: 1, fontSize: 13 }, retryButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 8 }, retryText: { color: colors.accent, fontWeight: '800' },
});
