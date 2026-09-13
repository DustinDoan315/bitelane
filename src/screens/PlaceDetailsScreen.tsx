import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FoodOffer, Journey, MenuReport, Place, RouteData } from '../types';
import { ActionButton } from '../components/ActionButton';
import { MapPreview } from '../components/MapPreview';
import { PlaceThumbnail } from '../components/PlaceThumbnail';
import { SaveButton } from '../components/SaveButton';
import { getRoute } from '../services/routeService';
import { getNavigationUrl } from '../services/navigationService';
import { formatVnd } from '../services/format';
import { colors } from '../theme';

export function PlaceDetailsScreen({ offer, place, journey, baseRoute, reports, saved, initialReportOpen = false, onSave, onVisit, onReport, onBack }: {
  offer: FoodOffer | null; place: Place; journey: Journey | null; baseRoute: RouteData | null; reports: MenuReport[]; saved: boolean; initialReportOpen?: boolean; onSave: () => void; onVisit: () => void; onReport: (itemName: string, priceVnd: number) => void; onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const offerPrice = offer
    ? `${offer.priceRangeVnd.min === offer.priceRangeVnd.max
      ? formatVnd(offer.priceRangeVnd.min)
      : `${formatVnd(offer.priceRangeVnd.min)}–${formatVnd(offer.priceRangeVnd.max)}`} / ${t('app.person')}`
    : null;
  const offerEvidence = offer?.evidence === 'user_report'
    ? t('app.reportedPrice')
    : offer
      ? t(offer.fit === 'likely' ? 'app.estimatedPriceLikely' : 'app.estimatedPricePossible')
      : null;
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visited, setVisited] = useState(false);
  const [reportOpen, setReportOpen] = useState(initialReportOpen);
  const [itemName, setItemName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [reportNotice, setReportNotice] = useState(false);
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
  const priceVnd = Number(priceText.replace(/\D/g, ''));
  const submitReport = () => {
    if (!itemName.trim() || !Number.isInteger(priceVnd) || priceVnd <= 0) return;
    onReport(itemName, priceVnd);
    setItemName(''); setPriceText(''); setReportOpen(false); setReportNotice(true);
  };
  const offerLabel = offer?.itemName ?? (offer?.requestedFood || offer?.suggestedFood
    ? t('app.estimatedQuery', { food: offer.requestedFood ?? offer.suggestedFood })
    : t('app.estimatedMeal', { category: t(`app.categories.${place.category}`) }));
  return <ScrollView contentContainerStyle={styles.page}>
    <ActionButton secondary label={t('app.back')} onPress={onBack} />
    <View style={styles.hero}>
      <PlaceThumbnail accessibilityLabel={t('app.placeImage', { name: place.name })} place={place} size={88} />
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>{offer ? t('app.mealMatch') : t(`app.categories.${place.category}`)}</Text>
        {offer ? <Text style={styles.mealName}>{offerLabel}</Text> : null}
        <Text style={styles.title}>{place.name}</Text>
        {offer ? <Text style={styles.offerPrice}>{offerPrice}</Text> : null}
        {offer ? <Text style={styles.small}>{offerEvidence}</Text> : null}
      </View>
    </View>
    <View style={styles.primaryActions}>
      <ActionButton label={t('app.navigate')} onPress={() => void open(getNavigationUrl(place))} />
      <SaveButton place={place} saved={saved} onPress={onSave} />
    </View>
    <View style={styles.facts}>
      <Text style={styles.body}>{place.address || t('app.addressUnknown')}</Text>
      {place.cuisine ? <Text style={styles.body}>{place.cuisine}</Text> : null}
      <View style={styles.factBlock}>
        <Text style={styles.label}>{t('app.hours')}</Text>
        <Text style={styles.body}>{place.openingHours || t('app.hoursUnknown')}</Text>
        <Text style={styles.small}>{t('app.hoursNote')}</Text>
      </View>
      {!offer ? <View style={styles.factBlock}><Text style={styles.label}>{t('app.price')}</Text><Text style={styles.body}>{t('app.priceUnknown')}</Text></View> : null}
      {place.vegetarian ? <Text style={styles.body}>{t('app.vegetarianNote')}</Text> : null}
    </View>
    <View style={styles.reportCard}>
      <Text style={styles.label}>{t('app.reportMenuTitle')}</Text>
      <Text style={styles.small}>{t('app.reportMenuHelp')}</Text>
      {reports.length ? reports.slice(0, 3).map((report) => <View key={report.id} style={styles.reportRow}>
        <Text style={styles.body}>{report.itemName} · {formatVnd(report.priceVnd)}</Text>
        <Text style={styles.small}>{t('app.reportedPrice')} · {new Date(report.reportedAt).toLocaleDateString(i18n.language)}</Text>
      </View>) : <Text style={styles.small}>{t('app.reportEmpty')}</Text>}
      {reportOpen ? <>
        <TextInput accessibilityLabel={t('app.reportItemLabel')} value={itemName} maxLength={120} onChangeText={setItemName} placeholder={t('app.reportItemPlaceholder')} placeholderTextColor={colors.secondaryText} style={styles.input} />
        <TextInput accessibilityLabel={t('app.reportPriceLabel')} value={priceText} onChangeText={setPriceText} keyboardType="numeric" placeholder={t('app.reportPricePlaceholder')} placeholderTextColor={colors.secondaryText} style={styles.input} />
        <ActionButton disabled={!itemName.trim() || !Number.isInteger(priceVnd) || priceVnd <= 0} label={t('app.reportSubmit')} onPress={submitReport} />
        <ActionButton secondary label={t('app.reportCancel')} onPress={() => { setReportOpen(false); setReportNotice(false); }} />
      </> : <ActionButton secondary label={t('app.reportMenuTitle')} onPress={() => { setReportOpen(true); setReportNotice(false); }} />}
      {reportNotice ? <Text style={styles.saved}>{t('app.reportSaved')}</Text> : null}
    </View>
    {journey && baseRoute ? <>
      <MapPreview height={220} route={route ?? baseRoute} places={[place]} isLoading={loading} />
      <ActionButton secondary disabled={loading} label={t('app.checkDetour')} onPress={() => void checkDetour()} />
      {loading ? <ActivityIndicator color={colors.forest} /> : null}
      {route ? <Text style={styles.label}>{t('app.detour', { minutes: Math.ceil(Math.max(0, route.durationSeconds - baseRoute.durationSeconds) / 60) })}</Text> : null}
      <Text style={styles.small}>{t('app.detourNote')}</Text>
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.networkError') })}</Text> : null}
    <View style={styles.secondaryActions}>
      <Text style={styles.sectionLabel}>{t('app.morePlaceActions')}</Text>
      {place.menuUrl ? <LinkAction label={t('app.openMenu')} onPress={() => void open(place.menuUrl!)} /> : null}
      {place.websiteUrl && place.websiteUrl !== place.menuUrl ? <LinkAction label={t('app.openWebsite')} onPress={() => void open(place.websiteUrl!)} /> : null}
      <ActionButton secondary disabled={visited} label={t(visited ? 'app.visitRecorded' : 'app.recordVisit')} onPress={() => { onVisit(); setVisited(true); }} />
      <Text style={styles.small}>{t('app.visitNote')}</Text>
      <LinkAction label={t('app.viewSource')} onPress={() => void open(place.sourceUrl)} />
    </View>
    <Text style={styles.small}>{t('app.fetched', { date: new Date(place.fetchedAt).toLocaleString(i18n.language) })}</Text>
  </ScrollView>;
}
function LinkAction({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.linkAction}><Text style={styles.linkText}>{label} ↗</Text></Pressable>;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18, paddingBottom: 36 }, eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  hero: { backgroundColor: colors.peach, borderRadius: 22, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' }, heroCopy: { flex: 1, gap: 5 }, mealName: { color: colors.text, fontSize: 21, fontWeight: '800' }, offerPrice: { color: colors.forest, fontSize: 18, fontWeight: '800' },
  title: { fontSize: 25, color: colors.text, fontWeight: '800' }, body: { color: colors.secondaryText, fontSize: 15, lineHeight: 23 }, primaryActions: { gap: 10 },
  label: { color: colors.forest, fontSize: 14, fontWeight: '700' }, facts: { backgroundColor: colors.white, borderRadius: 20, padding: 18, gap: 12 }, factBlock: { gap: 4 }, reportCard: { backgroundColor: colors.peach, borderRadius: 20, padding: 18, gap: 12 }, reportRow: { gap: 3 }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.white, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 13, color: colors.text, fontSize: 15 }, saved: { color: colors.forest, fontWeight: '700', fontSize: 13 },
  secondaryActions: { backgroundColor: colors.white, borderRadius: 20, padding: 18, gap: 12 }, sectionLabel: { color: colors.text, fontSize: 16, fontWeight: '800' }, linkAction: { minHeight: 42, justifyContent: 'center' }, linkText: { color: colors.forest, fontSize: 14, fontWeight: '800' },
  small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 }, error: { color: colors.accent, lineHeight: 22 },
});
