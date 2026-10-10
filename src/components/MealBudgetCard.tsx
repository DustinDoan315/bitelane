import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from './ActionButton';
import type { BudgetSettings } from '../types';
import { colors } from '../theme';
import { formatMoney, marketLocale, normalizeCurrencyAmount } from '../services/market';

const presets: Record<BudgetSettings['currency'], number[]> = {
  VND: [30000, 50000, 80000], GBP: [8, 12, 18], EUR: [10, 15, 25], USD: [10, 18, 25],
};

export function MealBudgetCard({ budget, matchCount, onApply }: { budget: BudgetSettings; matchCount: number; onApply: (budget: BudgetSettings) => void }) {
  const { t, i18n } = useTranslation();
  const locale = marketLocale(budget.countryCode, i18n.language);
  const [amount, setAmount] = useState(String(budget.maxPerPerson));
  const [dishQuery, setDishQuery] = useState(budget.dishQuery);
  const [isApplying, setIsApplying] = useState(false);
  const applyingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setAmount(String(budget.maxPerPerson)), [budget.maxPerPerson, budget.currency]);
  useEffect(() => setDishQuery(budget.dishQuery), [budget.dishQuery]);
  useEffect(() => () => { if (applyingTimer.current) clearTimeout(applyingTimer.current); }, []);
  const normalizedText = budget.currency === 'VND' ? amount.replace(/\D/g, '') : amount.replace(',', '.');
  const parsedAmount = Number(normalizedText);
  const normalizedAmount = normalizeCurrencyAmount(parsedAmount, budget.currency);
  const validAmount = Number.isFinite(parsedAmount) && normalizedAmount > 0 && parsedAmount <= 10000000;
  const isDirty = parsedAmount !== budget.maxPerPerson || dishQuery.trim() !== budget.dishQuery;
  const applyBudget = (nextBudget: BudgetSettings) => {
    if (applyingTimer.current) clearTimeout(applyingTimer.current);
    setIsApplying(true);
    onApply(nextBudget);
    applyingTimer.current = setTimeout(() => { applyingTimer.current = null; setIsApplying(false); }, 600);
  };
  const apply = () => { if (validAmount && isDirty) applyBudget({ ...budget, maxPerPerson: normalizedAmount, dishQuery: dishQuery.trim() }); };
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{t('app.budgetEyebrow')}</Text>
    <Text style={styles.title}>{t('app.budgetTitle')}</Text>
    <Text style={styles.help}>{t('app.budgetHelp')}</Text>
    <Text style={styles.label}>{t('app.budgetPerPerson')}</Text>
    <View style={styles.presets}>
      {presets[budget.currency].map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: parsedAmount === value }} onPress={() => setAmount(String(value))}
        style={[styles.preset, parsedAmount === value && styles.presetSelected]}>
        <Text style={[styles.presetText, parsedAmount === value && styles.presetSelectedText]}>{formatMoney(value, budget.currency, locale)}</Text>
      </Pressable>)}
    </View>
    <TextInput accessibilityLabel={t('app.budgetPerPerson')} keyboardType="decimal-pad" value={amount} onChangeText={(value) => setAmount(value.replace(/[^\d.,]/g, ''))} style={styles.input} placeholder={t('app.budgetPlaceholder')} placeholderTextColor={colors.secondaryText} />
    <Text style={styles.label}>{t('app.dishQueryLabel')}</Text>
    <TextInput accessibilityLabel={t('app.dishQueryLabel')} value={dishQuery} maxLength={80} onChangeText={setDishQuery} style={styles.input} placeholder={t('app.dishQueryPlaceholder')} placeholderTextColor={colors.secondaryText} returnKeyType="search" />
    <ActionButton disabled={!validAmount || !isDirty} loading={isApplying} label={t(isApplying ? 'app.budgetUpdating' : isDirty ? 'app.applyBudget' : 'app.budgetApplied')} onPress={apply} />
    {matchCount > 0 ? <Text accessibilityLiveRegion="polite" style={styles.matches}>{t('app.budgetMatches', { count: matchCount })}</Text> : <Text accessibilityLiveRegion="polite" style={styles.noMatches}>{t('app.budgetNoMatches')}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.peach, borderRadius: 20, padding: 18, gap: 10 }, eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' }, help: { color: colors.secondaryText, fontSize: 13, lineHeight: 20 }, label: { color: colors.forest, fontSize: 13, fontWeight: '800', marginTop: 4 },
  presets: { flexDirection: 'row', gap: 8 }, preset: { flex: 1, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.white, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }, presetSelected: { backgroundColor: colors.forest, borderColor: colors.forest }, presetText: { color: colors.forest, fontSize: 12, fontWeight: '800' }, presetSelectedText: { color: colors.white },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.white, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 13, color: colors.text, fontSize: 15 }, matches: { color: colors.forest, fontWeight: '800', fontSize: 13 }, noMatches: { color: colors.secondaryText, fontSize: 12, lineHeight: 18 },
});
