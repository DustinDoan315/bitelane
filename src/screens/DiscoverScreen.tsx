import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { FilterChip } from '../components/FilterChip';
import { MapPreview } from '../components/MapPreview';
import { MealBudgetCard } from '../components/MealBudgetCard';
import { PlaceThumbnail } from '../components/PlaceThumbnail';
import { SaveButton } from '../components/SaveButton';
import { formatVnd, formatVndCompact } from '../services/format';
import { getRoute } from '../services/routeService';
import { colors } from '../theme';
import type { BudgetSettings, FoodOffer, Journey, Place, Preferences, RouteData } from '../types';

export function DiscoverScreen({ journey, route, offers, budget, phase, error, saved, preferences, onPreferences, onBudget, onSetup, onRetry, onMap, onOpen, onSave }: {
  journey: Journey | null; route: RouteData | null; phase: 'idle' | 'route' | 'places'; error: string | null;
  saved: Place[]; preferences: Preferences; onPreferences: (value: Preferences) => void; onSetup: () => void;
  onRetry: () => void; onMap: () => void; onOpen: (offer: FoodOffer) => void; onSave: (place: Place) => void;
  budget: BudgetSettings; offers: FoodOffer[]; onBudget: (value: BudgetSettings) => void;
}) {
  const { t } = useTranslation();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FoodOffer | null>(null);
  const [detourMinutes, setDetourMinutes] = useState<number | null>(null);
  const [detourLoading, setDetourLoading] = useState(false);
  const detourRequest = useRef(0);

  const mapOffers = useMemo(() => {
    const unique = new Map<string, FoodOffer>();
    for (const offer of offers) if (!unique.has(offer.place.id)) unique.set(offer.place.id, offer);
    return [...unique.values()].sort((a, b) => a.distanceFromRouteMeters - b.distanceFromRouteMeters).slice(0, 12);
  }, [offers]);

  useEffect(() => {
    detourRequest.current++;
    setSelectedOffer(null);
    setDetourMinutes(null);
    setDetourLoading(false);
  }, [journey?.origin.id, journey?.destination.id, route]);

  useEffect(() => {
    if (!selectedOffer || offers.some((offer) => offer.id === selectedOffer.id)) return;
    detourRequest.current++;
    setSelectedOffer(null);
    setDetourMinutes(null);
    setDetourLoading(false);
  }, [offers, selectedOffer]);

  const selectOffer = useCallback((offer: FoodOffer) => {
    const requestId = ++detourRequest.current;
    setSelectedOffer(offer);
    setDetourMinutes(null);
    setDetourLoading(!!journey && !!route);
    if (!journey || !route) return;
    void getRoute([journey.origin.coordinate, offer.place.coordinate, journey.destination.coordinate])
      .then((stopRoute) => {
        if (requestId === detourRequest.current) {
          setDetourMinutes(Math.ceil(Math.max(0, stopRoute.durationSeconds - route.durationSeconds) / 60));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (requestId === detourRequest.current) setDetourLoading(false);
      });
  }, [journey, route]);

  if (!journey) return <ScrollView contentContainerStyle={[styles.page, styles.emptyPage]}>
    <View style={styles.welcome}>
      <Text style={styles.foodMark}>🍜</Text>
      <Text style={styles.emptyTitle}>{t('app.discoverTitle')}</Text>
      <ActionButton label={t('app.setupRoute')} onPress={onSetup} />
    </View>
  </ScrollView>;

  const selectedSaved = !!selectedOffer && saved.some((place) => place.id === selectedOffer.place.id);
  const routeKm = route ? (route.distanceMeters / 1000).toFixed(1) : null;
  const routeMinutes = route ? Math.round(route.durationSeconds / 60) : null;
  const currentBudget = `${budget.dishQuery.trim() || t('app.anyFood')} · ≤${formatVndCompact(budget.maxVndPerPerson)}`;

  return <ScrollView contentContainerStyle={styles.page}>
    {error && route ? <View accessibilityRole="alert" style={styles.errorNotice}>
      <Text numberOfLines={2} style={styles.errorText}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}><Text style={styles.retryText}>{t('app.retry')}</Text></Pressable>
    </View> : null}

    {route ? <View style={styles.mapFrame}>
      <MapPreview height={382} route={route} foodOffers={mapOffers} selectedOfferId={selectedOffer?.id} onOfferPress={selectOffer} error={error} hideStatus>
        <View pointerEvents="box-none" style={styles.mapOverlay}>
          <View style={styles.routeCapsule}>
            <View style={styles.routeDots}>
              <View style={styles.originDot} /><View style={styles.routeLine} /><View style={styles.destinationDot} />
            </View>
            <View style={styles.addresses}>
              <Text numberOfLines={1} style={styles.address}>{journey.origin.label}</Text>
              <Text numberOfLines={1} style={styles.address}>{journey.destination.label}</Text>
              {routeKm && routeMinutes !== null ? <Text style={styles.routeMeta}>{routeKm} km · {routeMinutes} min</Text> : null}
            </View>
            <Pressable accessibilityRole="button" onPress={onSetup} style={styles.editButton}><Text style={styles.editText}>{t('app.edit')}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('commute.openMap')} onPress={onMap} style={styles.expandButton}><Text style={styles.expandIcon}>↗</Text></Pressable>
          </View>
          {phase === 'places' ? <View style={styles.progressBadge}><ActivityIndicator size="small" color={colors.forest} /><Text style={styles.progressText}>{t('app.loading.places')}</Text></View> : null}
        </View>
      </MapPreview>
    </View> : <View style={[styles.mapFrame, styles.mapLoading]}>
      {phase !== 'idle' ? <><ActivityIndicator size="large" color={colors.forest} /><Text style={styles.mapLoadingText}>{t(`app.loading.${phase}`)}</Text></>
        : error ? <><Text accessibilityRole="alert" style={styles.errorText}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.serviceUnavailable') })}</Text><ActionButton label={t('app.retry')} onPress={onRetry} /></>
          : <><ActivityIndicator size="large" color={colors.forest} /><Text style={styles.mapLoadingText}>{t('app.loading.route')}</Text></>}
    </View>}

    <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('app.editBudget')} accessibilityState={{ expanded: budgetOpen }} onPress={() => setBudgetOpen((open) => !open)} style={[styles.budgetChip, budgetOpen && styles.budgetChipOpen]}>
        <Text style={styles.budgetChipIcon}>＋</Text><Text numberOfLines={1} style={styles.budgetChipText}>{currentBudget}</Text>
      </Pressable>
      <FilterChip label={t('app.vegetarianOnly')} selected={preferences.vegetarianOnly} onPress={() => onPreferences({ ...preferences, vegetarianOnly: !preferences.vegetarianOnly })} />
      <FilterChip label={t('app.hideVisited')} selected={preferences.hideVisited} onPress={() => onPreferences({ ...preferences, hideVisited: !preferences.hideVisited })} />
    </ScrollView>
    {budgetOpen ? <MealBudgetCard budget={budget} matchCount={offers.length} onApply={onBudget} /> : null}
    {selectedOffer ? <SelectedOfferCard offer={selectedOffer} detourMinutes={detourMinutes} detourLoading={detourLoading} saved={selectedSaved} onOpen={() => onOpen(selectedOffer)} onSave={() => onSave(selectedOffer.place)} />
      : phase === 'idle' && offers.length === 0 && !error ? <View style={styles.mapHint}>
        <Text style={styles.mapHintTitle}>{t('app.budgetNoMatches')}</Text>
        <Pressable accessibilityRole="button" onPress={() => setBudgetOpen(true)}><Text style={styles.mapHintAction}>{t('app.editBudget')}</Text></Pressable>
      </View> : <View style={styles.mapHint}><Text style={styles.mapHintTitle}>{t('app.pinHint')}</Text></View>}
  </ScrollView>;
}

function SelectedOfferCard({ offer, detourMinutes, detourLoading, saved, onOpen, onSave }: { offer: FoodOffer; detourMinutes: number | null; detourLoading: boolean; saved: boolean; onOpen: () => void; onSave: () => void }) {
  const { t } = useTranslation();
  const itemLabel = offer.itemName ?? (offer.requestedFood || offer.suggestedFood
    ? t('app.estimatedQuery', { food: offer.requestedFood ?? offer.suggestedFood })
    : t('app.estimatedMeal', { category: t(`app.categories.${offer.place.category}`) }));
  const priceLabel = offer.priceRangeVnd.min === offer.priceRangeVnd.max
    ? formatVnd(offer.priceRangeVnd.min)
    : `${formatVnd(offer.priceRangeVnd.min)}–${formatVnd(offer.priceRangeVnd.max)}`;
  return <View style={styles.selectedCard}>
    <View style={styles.selectedTop}>
      <PlaceThumbnail accessibilityLabel={t('app.placeImage', { name: offer.place.name })} place={offer.place} size={52} />
      <Pressable accessibilityRole="button" accessibilityLabel={t('app.openFoodOffer', { item: itemLabel, name: offer.place.name })} onPress={onOpen} style={styles.selectedCopy}>
        <Text numberOfLines={1} style={styles.selectedFood}>{itemLabel}</Text>
        <Text numberOfLines={1} style={styles.selectedPlace}>{offer.place.name}</Text>
        <View style={styles.priceLine}><Text style={styles.selectedPrice}>{priceLabel}</Text><Text style={styles.perPerson}>/ {t('app.person')}</Text></View>
      </Pressable>
      <SaveButton compact place={offer.place} saved={saved} onPress={onSave} />
    </View>
    <View style={styles.selectedBottom}>
      {detourLoading ? <View style={styles.detourState}><ActivityIndicator size="small" color={colors.forest} /><Text style={styles.detourLoading}>{t('app.detourCalculating')}</Text></View>
        : detourMinutes !== null ? <Text style={styles.detourValue}>{t('app.detourShort', { minutes: detourMinutes })}</Text>
          : <Text style={styles.evidence}>{t(offer.evidence === 'user_report' ? 'app.reportedPriceShort' : 'app.estimatedPriceShort')}</Text>}
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.viewButton}><Text style={styles.viewText}>{t('app.viewPlace')} ↗</Text></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 12 },
  emptyPage: { flexGrow: 1, justifyContent: 'center' },
  welcome: { alignItems: 'flex-start', backgroundColor: colors.greenSoft, borderRadius: 28, padding: 24, gap: 18 },
  foodMark: { fontSize: 42 }, emptyTitle: { color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 39, maxWidth: 330 },
  routeCapsule: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, boxShadow: '0 4px 14px rgba(21,33,29,0.16)', flexDirection: 'row', gap: 10, minHeight: 72, paddingHorizontal: 12, paddingVertical: 9 },
  routeDots: { alignItems: 'center', justifyContent: 'center', width: 12 }, originDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.forest }, routeLine: { width: 2, height: 16, backgroundColor: colors.border }, destinationDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  addresses: { flex: 1, gap: 5 }, address: { color: colors.text, fontSize: 12, fontWeight: '750' }, routeMeta: { color: colors.secondaryText, fontSize: 10, fontWeight: '700' },
  editButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 12, backgroundColor: colors.greenSoft }, editText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  filters: { alignItems: 'center', gap: 8, paddingRight: 4 }, budgetChip: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 40, maxWidth: 220, paddingHorizontal: 12 }, budgetChipOpen: { backgroundColor: colors.greenSoft, borderColor: colors.forest }, budgetChipIcon: { color: colors.forest, fontSize: 17, fontWeight: '700' }, budgetChipText: { color: colors.forest, fontSize: 13, fontWeight: '800' },
  errorNotice: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 14, flexDirection: 'row', gap: 10, justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 }, errorText: { color: colors.accent, flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 }, retryButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 8 }, retryText: { color: colors.forest, fontSize: 13, fontWeight: '800' },
  mapFrame: { backgroundColor: colors.map, borderRadius: 26, height: 382, overflow: 'hidden', boxShadow: '0 8px 24px rgba(21,33,29,0.14)' }, mapLoading: { alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }, mapLoadingText: { color: colors.forest, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  mapOverlay: { bottom: 0, left: 0, padding: 11, position: 'absolute', right: 0, top: 0, zIndex: 20 }, expandButton: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: 13, height: 38, justifyContent: 'center', width: 38 }, expandIcon: { color: colors.forest, fontSize: 19, fontWeight: '800' },
  progressBadge: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: colors.white, borderRadius: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flexDirection: 'row', gap: 8, marginTop: 8, paddingHorizontal: 12, paddingVertical: 9 }, progressText: { color: colors.forest, fontSize: 11, fontWeight: '700' },
  mapHint: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: 16, flexDirection: 'row', gap: 10, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 14 }, mapHintTitle: { color: colors.forest, fontSize: 13, fontWeight: '800' }, mapHintAction: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  selectedCard: { backgroundColor: colors.white, borderRadius: 22, boxShadow: '0 6px 22px rgba(21,33,29,0.18)', gap: 8, marginBottom: 2, padding: 12 }, selectedTop: { alignItems: 'center', flexDirection: 'row', gap: 10 }, selectedCopy: { flex: 1, gap: 2 }, selectedFood: { color: colors.accent, fontSize: 13, fontWeight: '800' }, selectedPlace: { color: colors.text, fontSize: 14, fontWeight: '700' }, priceLine: { alignItems: 'baseline', flexDirection: 'row', gap: 4 }, selectedPrice: { color: colors.forest, fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] }, perPerson: { color: colors.secondaryText, fontSize: 10 },
  selectedBottom: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 34, paddingTop: 6 }, detourState: { alignItems: 'center', flexDirection: 'row', gap: 6 }, detourLoading: { color: colors.secondaryText, fontSize: 11, fontWeight: '700' }, detourValue: { color: colors.forest, fontSize: 13, fontWeight: '800' }, evidence: { color: colors.secondaryText, fontSize: 11, fontWeight: '700' }, viewButton: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 4 }, viewText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
});
