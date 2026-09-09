import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AddressSuggestion, Journey } from '../types';
import { searchAddresses } from '../services/routeService';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme';

export function JourneySetupScreen({ journey, onSave, onBack }: { journey: Journey | null; onSave: (journey: Journey) => void; onBack: () => void }) {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState(journey?.origin ?? null);
  const [destination, setDestination] = useState(journey?.destination ?? null);
  const same = origin && destination && origin.coordinate.latitude === destination.coordinate.latitude && origin.coordinate.longitude === destination.coordinate.longitude;
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <ActionButton secondary label={t('app.back')} onPress={onBack} />
      <Text style={styles.eyebrow}>{t('app.yourJourney')}</Text>
      <Text style={styles.title}>{t('app.setupTitle')}</Text>
      <Text style={styles.body}>{t('app.setupHelp')}</Text>
      <AddressSearch label={t('app.origin')} value={origin} onSelect={setOrigin} />
      <AddressSearch label={t('app.destination')} value={destination} onSelect={setDestination} />
      {same ? <Text accessibilityRole="alert" style={styles.error}>{t('app.errors.sameAddress')}</Text> : null}
      <ActionButton label={t('app.findFood')} disabled={!origin || !destination || !!same} onPress={() => { if (origin && destination) onSave({ origin, destination }); }} />
      <Text style={styles.small}>{t('app.privacy')}</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function AddressSearch({ label, value, onSelect }: { label: string; value: AddressSuggestion | null; onSelect: (value: AddressSuggestion | null) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value?.label ?? '');
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const search = useCallback(async (nextQuery: string) => {
    const normalized = nextQuery.trim();
    if (normalized.length < 3) return;
    const id = ++generation.current;
    setLoading(true); setError(null); setResults([]);
    try {
      const next = await searchAddresses(normalized);
      if (id === generation.current) { setResults(next); if (!next.length) setError('noAddresses'); }
    } catch (e) { if (id === generation.current) setError(e instanceof Error ? e.message : 'networkError'); }
    finally { if (id === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 3 || (value && normalized === value.label)) return;
    const timer = setTimeout(() => { void search(normalized); }, 350);
    return () => clearTimeout(timer);
  }, [query, search, value]);
  return <View style={styles.field}>
    <Text style={styles.label}>{label}{value ? ' ✓' : ''}</Text>
    <TextInput accessibilityLabel={label} placeholder={t('app.addressPlaceholder')} placeholderTextColor={colors.secondaryText}
      value={query} onChangeText={(next) => { ++generation.current; setQuery(next); onSelect(null); setResults([]); setError(null); setLoading(false); }}
      onSubmitEditing={() => void search(query)} returnKeyType="search" style={styles.input} />
    {loading ? <ActivityIndicator accessibilityLabel={t('app.searching')} color={colors.forest} /> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{t(`app.errors.${error}`, { defaultValue: t('app.errors.networkError') })}</Text> : null}
    {results.map((result) => <ActionButton key={result.id} secondary label={result.label} onPress={() => { ++generation.current; onSelect(result); setQuery(result.label); setResults([]); }} />)}
  </View>;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 18 }, eyebrow: { fontSize: 12, letterSpacing: 1, color: colors.accent, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '800', color: colors.text }, body: { color: colors.secondaryText, fontSize: 15, lineHeight: 23 },
  field: { gap: 10, backgroundColor: colors.white, borderRadius: 20, padding: 16 }, label: { color: colors.forest, fontWeight: '700', fontSize: 14 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, minHeight: 48, fontSize: 16, color: colors.text },
  error: { color: colors.accent, lineHeight: 21 }, small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 },
});
