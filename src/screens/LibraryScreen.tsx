import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { PlaceCard } from '../components/PlaceCard';
import type { Place, Visit } from '../types';
import { colors } from '../theme';

export function LibraryScreen({ kind, saved, visits, onOpen, onSave, onDiscover, onRemoveVisit }: {
  kind: 'history' | 'saved'; saved: Place[]; visits: Visit[]; onOpen: (place: Place) => void;
  onSave: (place: Place) => void; onDiscover: () => void; onRemoveVisit: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const entries: Array<{ id: string; place: Place; visitedAt: string | null }> = kind === 'saved' ? saved.map((place) => ({ id: place.id, place, visitedAt: null })) : visits;
  return <FlatList data={entries} keyExtractor={(item) => item.id} contentContainerStyle={styles.page}
    ListHeaderComponent={<View style={styles.header}>
      <Text style={styles.eyebrow}>{t(`app.${kind}Eyebrow`)}</Text>
      <Text style={styles.title}>{t(`app.${kind}Title`)}</Text>
      <Text style={styles.body}>{t(`app.${kind}Help`)}</Text>
      <Text style={styles.count}>{t(`app.${kind}Count`, { count: entries.length })}</Text>
    </View>}
    ListEmptyComponent={<View style={styles.empty}><Text style={styles.body}>{t(`app.${kind}Empty`)}</Text><ActionButton label={t('app.explore')} onPress={onDiscover} /></View>}
    renderItem={({ item }) => <View style={styles.entry}>
      <PlaceCard place={item.place} saved={saved.some((p) => p.id === item.place.id)} onSave={() => onSave(item.place)} onOpen={() => onOpen(item.place)}
        subtitle={item.visitedAt ? new Date(item.visitedAt).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }) : undefined} />
      {kind === 'history' ? <ActionButton secondary label={t('app.undoVisit')} onPress={() => onRemoveVisit(item.id)} /> : null}
    </View>} />;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18 }, header: { gap: 14, marginBottom: 8 }, eyebrow: { color: colors.accent, fontSize: 11, letterSpacing: 1, fontWeight: '800' },
  title: { fontSize: 34, fontWeight: '800', color: colors.text }, body: { color: colors.secondaryText, lineHeight: 23, fontSize: 15 },
  count: { color: colors.forest, fontWeight: '700', fontSize: 15 }, empty: { backgroundColor: colors.greenSoft, borderRadius: 20, padding: 22, gap: 18 }, entry: { gap: 8 },
});
