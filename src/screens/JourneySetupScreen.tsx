import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AddressSuggestion, Journey } from '../types';
import { searchAddresses, searchCities } from '../services/routeService';
import { vietnamCities, type VietnamCity } from '../services/vietnamCityService';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme';

export function JourneySetupScreen({ journey, onSave, onBack }: { journey: Journey | null; onSave: (journey: Journey) => void; onBack: () => void }) {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState(journey?.origin ?? null);
  const [destination, setDestination] = useState(journey?.destination ?? null);
  const [selectedCity, setSelectedCity] = useState<VietnamCity | null>(null);
  const same = origin && destination && origin.coordinate.latitude === destination.coordinate.latitude && origin.coordinate.longitude === destination.coordinate.longitude;
  const chooseCity = (city: VietnamCity | null) => {
    setSelectedCity(city);
    setOrigin(null);
    setDestination(null);
  };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <ActionButton secondary label={t('app.back')} onPress={onBack} />
      <Text style={styles.eyebrow}>{t('app.yourJourney')}</Text>
      <Text style={styles.title}>{t('app.setupTitle')}</Text>
      <Text style={styles.body}>{t('app.setupHelp')}</Text>
      <View style={styles.citySection}>
        <Text style={styles.cityTitle}>{t('app.recommendedCitiesTitle')}</Text>
        <Text style={styles.small}>{t('app.cityPickerHelp')}</Text>
        <View style={styles.cityChoices}>
          {vietnamCities.map((city) => <Pressable key={city.id} accessibilityRole="radio"
            accessibilityLabel={city.label} accessibilityState={{ checked: selectedCity?.id === city.id }}
            onPress={() => chooseCity(city)} style={[styles.cityChoice, selectedCity?.id === city.id && styles.cityChoiceSelected]}>
            <Text style={[styles.cityChoiceText, selectedCity?.id === city.id && styles.cityChoiceTextSelected]}>{city.label}</Text>
          </Pressable>)}
          <Pressable accessibilityRole="radio" accessibilityLabel={t('app.allVietnamCities')}
            accessibilityState={{ checked: selectedCity === null }} onPress={() => chooseCity(null)}
            style={[styles.cityChoice, selectedCity === null && styles.cityChoiceSelected]}>
            <Text style={[styles.cityChoiceText, selectedCity === null && styles.cityChoiceTextSelected]}>{t('app.allVietnamCities')}</Text>
          </Pressable>
        </View>
        <CitySearch selectedCity={selectedCity} onSelect={chooseCity} />
      </View>
      <AddressSearch key={`origin-${selectedCity?.id ?? 'all'}`} cityQuery={selectedCity?.searchName} label={t('app.origin')} value={origin} onSelect={setOrigin} />
      <AddressSearch key={`destination-${selectedCity?.id ?? 'all'}`} cityQuery={selectedCity?.searchName} label={t('app.destination')} value={destination} onSelect={setDestination} />
      {same ? <Text accessibilityRole="alert" style={styles.error}>{t('app.errors.sameAddress')}</Text> : null}
      <ActionButton label={t('app.findFood')} disabled={!origin || !destination || !!same} onPress={() => { if (origin && destination) onSave({ origin, destination }); }} />
      <Text style={styles.small}>{t('app.privacy')}</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function CitySearch({ selectedCity, onSelect }: { selectedCity: VietnamCity | null; onSelect: (city: VietnamCity | null) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(selectedCity?.label ?? '');
  const [results, setResults] = useState<VietnamCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const generation = useRef(0);
  const previousSelectedCityId = useRef(selectedCity?.id);
  useEffect(() => {
    if (selectedCity && selectedCity.id !== previousSelectedCityId.current) setQuery(selectedCity.label);
    previousSelectedCityId.current = selectedCity?.id;
  }, [selectedCity]);
  useEffect(() => () => { generation.current++; }, []);
  const search = useCallback(async (nextQuery: string) => {
    const normalized = nextQuery.trim();
    if (normalized.length < 2) return;
    const id = ++generation.current;
    setLoading(true); setError(false); setResults([]);
    try {
      const next = await searchCities(normalized);
      if (id === generation.current) setResults(next);
    } catch {
      if (id === generation.current) setError(true);
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2 || normalized === selectedCity?.label) return;
    const timer = setTimeout(() => { void search(normalized); }, 350);
    return () => clearTimeout(timer);
  }, [query, search, selectedCity]);
  return <View style={styles.citySearch}>
    <TextInput accessibilityLabel={t('app.cityPickerInput')} placeholder={t('app.cityPickerPlaceholder')}
      placeholderTextColor={colors.secondaryText} value={query} onChangeText={(next) => { ++generation.current; setQuery(next); setResults([]); setError(false); onSelect(null); }}
      onSubmitEditing={() => void search(query)} returnKeyType="search" style={styles.cityInput} />
    {loading ? <ActivityIndicator accessibilityLabel={t('app.citySearching')} color={colors.forest} /> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{t('app.errors.networkError')}</Text> : null}
    {results.map((result) => <Pressable key={result.id} accessibilityRole="button" accessibilityLabel={t('app.useCity', { city: result.label })}
      onPress={() => { ++generation.current; onSelect(result); setQuery(result.label); setResults([]); }} style={styles.cityResult}>
      <Text style={styles.cityResultText}>{result.label}</Text>
    </Pressable>)}
  </View>;
}

function AddressSearch({ cityQuery, label, value, onSelect }: { cityQuery?: string; label: string; value: AddressSuggestion | null; onSelect: (value: AddressSuggestion | null) => void }) {
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
      const next = await searchAddresses(cityQuery ? `${normalized}, ${cityQuery}` : normalized);
      if (id === generation.current) { setResults(next); if (!next.length) setError('noAddresses'); }
    } catch (e) { if (id === generation.current) setError(e instanceof Error ? e.message : 'networkError'); }
    finally { if (id === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 3 || (value && normalized === value.label)) return;
    const timer = setTimeout(() => { void search(normalized); }, 350);
    return () => clearTimeout(timer);
  }, [cityQuery, query, search, value]);
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
  citySection: { backgroundColor: colors.peach, borderRadius: 20, padding: 16, gap: 10 }, cityTitle: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }, cityChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, cityChoice: { backgroundColor: colors.white, borderColor: colors.white, borderRadius: 18, borderWidth: 1, minHeight: 38, justifyContent: 'center', paddingHorizontal: 13 }, cityChoiceSelected: { backgroundColor: colors.forest, borderColor: colors.forest }, cityChoiceText: { color: colors.forest, fontSize: 13, fontWeight: '800' }, cityChoiceTextSelected: { color: colors.white }, citySearch: { gap: 8 }, cityInput: { backgroundColor: colors.white, borderColor: colors.white, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 46, paddingHorizontal: 13 }, cityResult: { backgroundColor: colors.white, borderRadius: 12, minHeight: 42, justifyContent: 'center', paddingHorizontal: 13 }, cityResultText: { color: colors.forest, fontSize: 14, fontWeight: '700' },
  error: { color: colors.accent, lineHeight: 21 }, small: { color: colors.secondaryText, fontSize: 12, lineHeight: 19 },
});
