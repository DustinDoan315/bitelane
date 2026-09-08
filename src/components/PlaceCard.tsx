import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Place } from '../types';
import { colors } from '../theme';
import { Icon } from './Icon';

export function PlaceCard({ place, saved, onOpen, onSave, distance, subtitle }: {
  place: Place; saved: boolean; onOpen: () => void; onSave: () => void; distance?: number; subtitle?: string;
}) {
  const { t } = useTranslation();
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('app.openPlace', { name: place.name })} onPress={onOpen} style={styles.content}>
      <View style={styles.icon}><Icon name={place.category === 'cafe' ? 'coffee-outline' : 'silverware-fork-knife'} color={colors.forest} size={24} /></View>
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.meta}>{place.cuisine || t(`app.categories.${place.category}`)}</Text>
        {distance !== undefined ? <Text style={styles.distance}>{t('app.distance', { meters: Math.round(distance / 10) * 10 })}</Text> : null}
        {place.vegetarian ? <Text style={styles.tag}>{t('app.vegetarianTag')}</Text> : null}
      </View>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={t(saved ? 'app.unsavePlace' : 'app.savePlace', { name: place.name })}
      accessibilityState={{ selected: saved }} onPress={onSave} style={styles.save}>
      <Icon name={saved ? 'heart' : 'heart-outline'} size={23} color={saved ? colors.accent : colors.forest} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  content: { flex: 1, flexDirection: 'row', gap: 12, padding: 16 }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 5 }, name: { color: colors.text, fontWeight: '800', fontSize: 18 }, meta: { color: colors.secondaryText, fontSize: 13, lineHeight: 19 },
  distance: { color: colors.forest, fontSize: 12, fontWeight: '600' }, tag: { color: colors.forest, fontSize: 12 },
  save: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, subtitle: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});
