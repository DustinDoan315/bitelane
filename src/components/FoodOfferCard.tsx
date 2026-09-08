import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FoodOffer } from '../types';
import { colors } from '../theme';
import { Icon } from './Icon';

const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}₫`;

export function FoodOfferCard({ offer, saved, onOpen, onSave }: { offer: FoodOffer; saved: boolean; onOpen: () => void; onSave: () => void }) {
  const { t } = useTranslation();
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('app.openFoodOffer', { item: offer.itemName, name: offer.place.name })} onPress={onOpen} style={styles.content}>
      <View style={styles.icon}><Icon name="silverware-fork-knife" color={colors.forest} size={24} /></View>
      <View style={styles.copy}>
        <Text style={styles.item}>{offer.itemName}</Text>
        <Text style={styles.store}>{offer.place.name}</Text>
        <Text style={styles.meta}>{formatVnd(offer.priceVnd)} / {t('app.person')} · {t('app.distance', { meters: Math.round(offer.distanceFromRouteMeters / 10) * 10 })}</Text>
        <Text style={styles.evidence}>{t('app.reportedPrice')}</Text>
      </View>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={t(saved ? 'app.unsavePlace' : 'app.savePlace', { name: offer.place.name })}
      accessibilityState={{ selected: saved }} onPress={onSave} style={styles.save}>
      <Icon name={saved ? 'heart' : 'heart-outline'} size={23} color={saved ? colors.accent : colors.forest} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  content: { flex: 1, flexDirection: 'row', gap: 12, padding: 16 }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 5 }, item: { color: colors.text, fontWeight: '800', fontSize: 18 }, store: { color: colors.forest, fontSize: 14, fontWeight: '700' }, meta: { color: colors.secondaryText, fontSize: 13, lineHeight: 19 }, evidence: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  save: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
