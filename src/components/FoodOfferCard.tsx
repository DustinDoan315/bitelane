import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FoodOffer } from '../types';
import { colors } from '../theme';
import { PlaceThumbnail } from './PlaceThumbnail';
import { PlaceRating } from './PlaceRating';
import { formatVnd } from '../services/format';
import { SaveButton } from './SaveButton';

export function FoodOfferCard({ offer, saved, onOpen, onSave }: { offer: FoodOffer; saved: boolean; onOpen: () => void; onSave: () => void }) {
  const { t } = useTranslation();
  const itemLabel = offer.itemName ?? (offer.requestedFood || offer.suggestedFood
    ? t('app.estimatedQuery', { food: offer.requestedFood ?? offer.suggestedFood })
    : t('app.estimatedMeal', { category: t(`app.categories.${offer.place.category}`) }));
  const priceLabel = offer.priceRangeVnd.min === offer.priceRangeVnd.max
    ? formatVnd(offer.priceRangeVnd.min)
    : `${formatVnd(offer.priceRangeVnd.min)}–${formatVnd(offer.priceRangeVnd.max)}`;
  const evidenceLabel = offer.evidence === 'user_report'
    ? t('app.reportedPrice')
    : t(offer.fit === 'likely' ? 'app.estimatedPriceLikely' : 'app.estimatedPricePossible');
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('app.openFoodOffer', { item: itemLabel, name: offer.place.name })} onPress={onOpen} style={styles.content}>
      <PlaceThumbnail accessibilityLabel={t('app.placeImage', { name: offer.place.name })} place={offer.place} />
      <View style={styles.copy}>
        <Text style={styles.item}>{itemLabel}</Text>
        <Text style={styles.store}>{offer.place.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{priceLabel} / {t('app.person')} · {t('app.distance', { meters: Math.round(offer.distanceFromRouteMeters / 10) * 10 })}</Text>
          <PlaceRating place={offer.place} />
        </View>
        <Text style={[styles.evidence, offer.evidence === 'estimated' && styles.estimate]}>{evidenceLabel}</Text>
      </View>
    </Pressable>
    <SaveButton compact place={offer.place} saved={saved} onPress={onSave} />
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  content: { flex: 1, flexDirection: 'row', gap: 12, padding: 16 },
  copy: { flex: 1, gap: 5 }, item: { color: colors.text, fontWeight: '800', fontSize: 18 }, store: { color: colors.forest, fontSize: 14, fontWeight: '700' }, metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, meta: { color: colors.secondaryText, flexShrink: 1, fontSize: 13, lineHeight: 19 }, evidence: { color: colors.accent, fontSize: 12, fontWeight: '700' }, estimate: { color: colors.forest },
});
