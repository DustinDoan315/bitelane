import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing } from '../theme';
import { Budget, RoutePreferences } from '../types';

type RouteScreenProps = {
  preferences: RoutePreferences;
  onApply: () => void;
  onChange: <Key extends keyof RoutePreferences>(
    key: Key,
    value: RoutePreferences[Key],
  ) => void;
};

const budgetOptions: Array<{ value: Budget; labelKey: string }> = [
  { value: 'any', labelKey: 'route.budgets.any' },
  { value: 'value', labelKey: 'route.budgets.value' },
  { value: 'premium', labelKey: 'route.budgets.premium' },
];

export function RouteScreen({ preferences, onApply, onChange }: RouteScreenProps) {
  const { t } = useTranslation();
  const hasRoute = Boolean(preferences.origin.trim() && preferences.destination.trim());

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.title}>{t('route.title')}</Text>
        <Text style={styles.subtitle}>{t('route.subtitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.locations')}</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onChange('origin', value)}
          placeholder={t('route.originPlaceholder')}
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={preferences.origin}
        />
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onChange('destination', value)}
          placeholder={t('route.destinationPlaceholder')}
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={preferences.destination}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.preferences')}</Text>
        <Text style={styles.label}>{t('route.budget')}</Text>
        <View style={styles.options}>
          {budgetOptions.map((option) => {
            const isSelected = preferences.budget === option.value;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                key={option.value}
                onPress={() => onChange('budget', option.value)}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {t(option.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          onChangeText={(value) => onChange('mood', value)}
          placeholder={t('route.moodPlaceholder')}
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={preferences.mood}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!hasRoute}
        onPress={onApply}
        style={[styles.button, !hasRoute && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{t('route.update')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  headingBlock: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  optionText: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.accent,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
