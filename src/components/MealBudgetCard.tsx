import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from './ActionButton';
import type { BudgetSettings } from '../types';
import { colors } from '../theme';
import { getFoodSuggestions } from '../services/foodSuggestionService';
import { formatVnd, formatVndAmount } from '../services/format';

const presets = [30000, 50000, 80000];

export function MealBudgetCard({ budget, matchCount, onApply }: { budget: BudgetSettings; matchCount: number; onApply: (budget: BudgetSettings) => void }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(formatVndAmount(budget.maxVndPerPerson));
  const [dishQuery, setDishQuery] = useState(budget.dishQuery);
  const [isApplying, setIsApplying] = useState(false);
  const applyingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setAmount(formatVndAmount(budget.maxVndPerPerson)), [budget.maxVndPerPerson]);
  useEffect(() => setDishQuery(budget.dishQuery), [budget.dishQuery]);
  useEffect(() => () => { if (applyingTimer.current) clearTimeout(applyingTimer.current); }, []);
  const digits = amount.replace(/\D/g, '');
  const parsedAmount = digits ? Math.min(10000000, Math.max(1, Number(digits))) : 0;
  const changeAmount = (value: string) => {
    const nextDigits = value.replace(/\D/g, '');
    if (!nextDigits) {
      setAmount('');
      return;
    }
    setAmount(formatVndAmount(Math.min(10000000, Number(nextDigits))));
  };
  const isDirty = parsedAmount !== budget.maxVndPerPerson || dishQuery.trim() !== budget.dishQuery;
  const applyBudget = (nextBudget: BudgetSettings) => {
    if (applyingTimer.current) clearTimeout(applyingTimer.current);
    setIsApplying(true);
    onApply(nextBudget);
    applyingTimer.current = setTimeout(() => { applyingTimer.current = null; setIsApplying(false); }, 600);
  };
  const apply = () => { if (parsedAmount > 0 && isDirty) applyBudget({ maxVndPerPerson: parsedAmount, dishQuery: dishQuery.trim() }); };
  const suggestions = getFoodSuggestions(dishQuery);
  const chooseSuggestion = (label: string) => {
    setDishQuery(label);
    if (parsedAmount > 0) applyBudget({ maxVndPerPerson: parsedAmount, dishQuery: label });
  };
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{t('app.budgetEyebrow')}</Text>
    <Text style={styles.title}>{t('app.budgetTitle')}</Text>
    <Text style={styles.help}>{t('app.budgetHelp')}</Text>
    <Text style={styles.label}>{t('app.budgetPerPerson')}</Text>
    <View style={styles.presets}>
      {presets.map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: parsedAmount === value }} onPress={() => setAmount(formatVndAmount(value))}
        style={[styles.preset, parsedAmount === value && styles.presetSelected]}>
        <Text style={[styles.presetText, parsedAmount === value && styles.presetSelectedText]}>{formatVnd(value)}</Text>
      </Pressable>)}
    </View>
    <TextInput accessibilityLabel={t('app.budgetPerPerson')} keyboardType="numeric" value={amount} onChangeText={changeAmount} style={styles.input} placeholder={t('app.budgetPlaceholder')} placeholderTextColor={colors.secondaryText} />
    <Text style={styles.label}>{t('app.dishQueryLabel')}</Text>
    <TextInput accessibilityLabel={t('app.dishQueryLabel')} value={dishQuery} maxLength={80} onChangeText={setDishQuery} style={styles.input} placeholder={t('app.dishQueryPlaceholder')} placeholderTextColor={colors.secondaryText} returnKeyType="search" />
    {suggestions.length ? <View style={styles.suggestionGroup}>
      <Text style={styles.suggestionLabel}>{t('app.foodSuggestions')}</Text>
      <View style={styles.suggestions}>
        {suggestions.map(({ label }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={t('app.useFoodSuggestion', { food: label })} accessibilityState={{ disabled: isApplying }} disabled={isApplying} onPress={() => chooseSuggestion(label)} style={({ pressed }) => [styles.suggestion, (isApplying || pressed) && styles.suggestionDim]}>
          <Text style={styles.suggestionText}>{label}</Text>
        </Pressable>)}
      </View>
    </View> : null}
    <ActionButton disabled={parsedAmount <= 0 || !isDirty} loading={isApplying} label={t(isApplying ? 'app.budgetUpdating' : isDirty ? 'app.applyBudget' : 'app.budgetApplied')} onPress={apply} />
    {matchCount > 0 ? <Text accessibilityLiveRegion="polite" style={styles.matches}>{t('app.budgetMatches', { count: matchCount })}</Text> : <Text accessibilityLiveRegion="polite" style={styles.noMatches}>{t('app.budgetNoMatches')}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.peach, borderRadius: 20, padding: 18, gap: 10 }, eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' }, help: { color: colors.secondaryText, fontSize: 13, lineHeight: 20 }, label: { color: colors.forest, fontSize: 13, fontWeight: '800', marginTop: 4 },
  presets: { flexDirection: 'row', gap: 8 }, preset: { flex: 1, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.white, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }, presetSelected: { backgroundColor: colors.forest, borderColor: colors.forest }, presetText: { color: colors.forest, fontSize: 12, fontWeight: '800' }, presetSelectedText: { color: colors.white },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.white, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 13, color: colors.text, fontSize: 15 }, suggestionGroup: { gap: 7 }, suggestionLabel: { color: colors.secondaryText, fontSize: 12, fontWeight: '700' }, suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, suggestion: { minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.forest, backgroundColor: colors.greenSoft, justifyContent: 'center', paddingHorizontal: 13 }, suggestionDim: { opacity: 0.5 }, suggestionText: { color: colors.forest, fontSize: 13, fontWeight: '800' }, matches: { color: colors.forest, fontWeight: '800', fontSize: 13 }, noMatches: { color: colors.secondaryText, fontSize: 12, lineHeight: 18 },
});
