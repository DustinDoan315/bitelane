import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from './ActionButton';
import type { BudgetSettings } from '../types';
import { colors } from '../theme';

const presets = [30000, 50000, 80000];

export function MealBudgetCard({ budget, matchCount, onApply }: { budget: BudgetSettings; matchCount: number; onApply: (budget: BudgetSettings) => void }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(String(budget.maxVndPerPerson));
  const [dishQuery, setDishQuery] = useState(budget.dishQuery);
  useEffect(() => setAmount(String(budget.maxVndPerPerson)), [budget.maxVndPerPerson]);
  useEffect(() => setDishQuery(budget.dishQuery), [budget.dishQuery]);
  const digits = amount.replace(/\D/g, '');
  const parsedAmount = digits ? Math.min(10000000, Math.max(1, Number(digits))) : 0;
  const apply = () => { if (parsedAmount > 0) onApply({ maxVndPerPerson: parsedAmount, dishQuery: dishQuery.trim() }); };
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{t('app.budgetEyebrow')}</Text>
    <Text style={styles.title}>{t('app.budgetTitle')}</Text>
    <Text style={styles.help}>{t('app.budgetHelp')}</Text>
    <Text style={styles.label}>{t('app.budgetPerPerson')}</Text>
    <View style={styles.presets}>
      {presets.map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: parsedAmount === value }} onPress={() => setAmount(String(value))}
        style={[styles.preset, parsedAmount === value && styles.presetSelected]}>
        <Text style={[styles.presetText, parsedAmount === value && styles.presetSelectedText]}>{value / 1000}k</Text>
      </Pressable>)}
    </View>
    <TextInput accessibilityLabel={t('app.budgetPerPerson')} keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} placeholder={t('app.budgetPlaceholder')} placeholderTextColor={colors.secondaryText} />
    <Text style={styles.label}>{t('app.dishQueryLabel')}</Text>
    <TextInput accessibilityLabel={t('app.dishQueryLabel')} value={dishQuery} maxLength={80} onChangeText={setDishQuery} style={styles.input} placeholder={t('app.dishQueryPlaceholder')} placeholderTextColor={colors.secondaryText} returnKeyType="search" />
    <ActionButton disabled={parsedAmount <= 0} label={t('app.applyBudget')} onPress={apply} />
    {matchCount > 0 ? <Text style={styles.matches}>{t('app.budgetMatches', { count: matchCount })}</Text> : <Text style={styles.noMatches}>{t('app.budgetNoMatches')}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.peach, borderRadius: 20, padding: 18, gap: 10 }, eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' }, help: { color: colors.secondaryText, fontSize: 13, lineHeight: 20 }, label: { color: colors.forest, fontSize: 13, fontWeight: '800', marginTop: 4 },
  presets: { flexDirection: 'row', gap: 8 }, preset: { minWidth: 64, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.white, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, presetSelected: { backgroundColor: colors.forest, borderColor: colors.forest }, presetText: { color: colors.forest, fontWeight: '800' }, presetSelectedText: { color: colors.white },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.white, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 13, color: colors.text, fontSize: 15 }, matches: { color: colors.forest, fontWeight: '800', fontSize: 13 }, noMatches: { color: colors.secondaryText, fontSize: 12, lineHeight: 18 },
});
