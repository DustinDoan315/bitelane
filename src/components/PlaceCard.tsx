import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Place } from '../types';
import { colors } from '../theme';
import { Icon } from './Icon';
import { PlaceRating } from './PlaceRating';
import { PlaceThumbnail } from './PlaceThumbnail';
import { SaveButton } from './SaveButton';

export function PlaceCard({ place, saved, onOpen, onSave, distance, subtitle, cornerActions = false, onRemove, removeLabel }: {
  place: Place; saved: boolean; onOpen: () => void; onSave: () => void; distance?: number; subtitle?: string; cornerActions?: boolean; onRemove?: () => void; removeLabel?: string;
}) {
  const { t } = useTranslation();
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('app.openPlace', { name: place.name })} onPress={onOpen} style={[styles.content, cornerActions && styles.historyContent]}>
      <PlaceThumbnail accessibilityLabel={t('app.placeImage', { name: place.name })} place={place} tone="green" />
      <View style={styles.copy}>
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        <Text numberOfLines={cornerActions ? 2 : 1} style={styles.name}>{place.name}</Text>
        <PlaceRating place={place} />
        {distance !== undefined ? <Text numberOfLines={1} style={styles.distance}>{t('app.distance', { meters: Math.round(distance / 10) * 10 })}</Text> : null}
        {place.vegetarian && !cornerActions ? <Text numberOfLines={1} style={styles.tag}>{t('app.vegetarianTag')}</Text> : null}
      </View>
    </Pressable>
    {cornerActions ? <>
      <View style={styles.cornerSave}><SaveButton compact place={place} saved={saved} onPress={onSave} /></View>
      <Pressable accessibilityRole="button" accessibilityLabel={removeLabel ?? t('app.undoVisit')} hitSlop={8} onPress={onRemove} style={styles.removeButton}>
        <Icon name="trash-can-outline" size={21} color={colors.accent} />
      </Pressable>
    </> : <SaveButton compact place={place} saved={saved} onPress={onSave} />}
  </View>;
}
const styles = StyleSheet.create({
  card: { alignItems: 'flex-start', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 20, borderWidth: 1, flexDirection: 'row', height: 164, overflow: 'hidden', position: 'relative' },
  content: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, height: '100%', padding: 16 }, historyContent: { paddingBottom: 8, paddingLeft: 16, paddingRight: 16, paddingTop: 64 },
  copy: { flex: 1, gap: 5, minWidth: 0 }, name: { color: colors.text, fontWeight: '800', fontSize: 18 },
  distance: { color: colors.forest, fontSize: 12, fontWeight: '600' }, tag: { color: colors.forest, fontSize: 12 },
  subtitle: { color: colors.accent, fontSize: 12, fontWeight: '700' }, cornerSave: { left: 10, position: 'absolute', top: 10, zIndex: 2 }, removeButton: { alignItems: 'center', backgroundColor: colors.accentSoft, borderColor: colors.border, borderRadius: 24, borderWidth: 1, height: 48, justifyContent: 'center', position: 'absolute', right: 10, top: 10, width: 48, zIndex: 2 },
});
