import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { PlaceCard } from '../components/PlaceCard';
import type { Place, Visit } from '../types';
import { colors } from '../theme';
import { marketLocale } from '../services/market';

export function LibraryScreen({ kind, saved, visits, onOpen, onSave, onDiscover, onRemoveVisit, profile = false, language, onLanguage }: {
  kind: 'history' | 'saved'; saved: Place[]; visits: Visit[]; onOpen: (place: Place) => void;
  onSave: (place: Place) => void; onDiscover: () => void; onRemoveVisit: (id: string) => void;
  profile?: boolean; language?: 'en' | 'vi'; onLanguage?: (language: 'en' | 'vi') => void;
}) {
  const { t, i18n } = useTranslation();
  const entries: Array<{ id: string; place: Place; visitedAt: string | null }> = kind === 'saved' ? saved.map((place) => ({ id: place.id, place, visitedAt: null })) : visits;
  return <FlatList data={entries} keyExtractor={(item) => item.id} contentContainerStyle={styles.page}
    ListHeaderComponent={<View style={styles.header}>
      {profile ? <>
        <Text style={styles.eyebrow}>{t('app.profileEyebrow')}</Text>
        <Text style={styles.title}>{t('app.profileTitle')}</Text>
        <Text style={styles.body}>{t('app.profileHelp')}</Text>
        <Text style={styles.languageLabel}>{t('app.language')}</Text>
        <View style={styles.languages}>
          {(['vi', 'en'] as const).map((code) => <ActionButton key={code} secondary={language !== code} label={code === 'vi' ? 'Tiếng Việt' : 'English'} onPress={() => onLanguage?.(code)} />)}
        </View>
        <Text style={styles.eyebrow}>{t('app.historyEyebrow')}</Text>
        <Text style={styles.sectionTitle}>{t('app.historyTitle')}</Text>
        <Text style={styles.body}>{t('app.historyHelp')}</Text>
      </> : <>
        <Text style={styles.eyebrow}>{t(`app.${kind}Eyebrow`)}</Text>
        <Text style={styles.title}>{t(`app.${kind}Title`)}</Text>
        <Text style={styles.body}>{t(`app.${kind}Help`)}</Text>
      </>}
      <Text style={styles.count}>{t(`app.${kind}Count`, { count: entries.length })}</Text>
    </View>}
    ListEmptyComponent={<View style={styles.empty}><Text style={styles.body}>{t(`app.${kind}Empty`)}</Text><ActionButton label={t('app.explore')} onPress={onDiscover} /></View>}
    renderItem={({ item }) => <View style={styles.entry}>
      <PlaceCard
        place={item.place}
        saved={saved.some((p) => p.id === item.place.id)}
        onSave={() => onSave(item.place)}
        onOpen={() => onOpen(item.place)}
        cornerActions={kind === 'history'}
        onRemove={kind === 'history' ? () => onRemoveVisit(item.id) : undefined}
        removeLabel={kind === 'history' ? t('app.undoVisit') : undefined}
        subtitle={item.visitedAt ? new Date(item.visitedAt).toLocaleString(marketLocale(item.place.countryCode, i18n.language), { dateStyle: 'medium', timeStyle: 'short' }) : undefined}
      />
    </View>} />;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18 }, header: { gap: 14, marginBottom: 8 }, eyebrow: { color: colors.accent, fontSize: 11, letterSpacing: 1, fontWeight: '800' },
  title: { fontSize: 34, fontWeight: '800', color: colors.text }, sectionTitle: { fontSize: 22, fontWeight: '800', color: colors.text }, body: { color: colors.secondaryText, lineHeight: 23, fontSize: 15 }, languageLabel: { color: colors.forest, fontWeight: '800' }, languages: { flexDirection: 'row', gap: 8 },
  count: { color: colors.forest, fontWeight: '700', fontSize: 15 }, empty: { backgroundColor: colors.greenSoft, borderRadius: 20, padding: 22, gap: 18 }, entry: { gap: 8 },
});
