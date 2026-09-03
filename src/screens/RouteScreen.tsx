import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

const budgetOptions: Array<{ value: Budget; label: string }> = [
  { value: 'any', label: 'Any budget' },
  { value: 'value', label: 'Good value' },
  { value: 'premium', label: 'Premium' },
];

export function RouteScreen({ preferences, onApply, onChange }: RouteScreenProps) {
  const hasRoute = Boolean(preferences.origin.trim() && preferences.destination.trim());

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.title}>Your route</Text>
        <Text style={styles.subtitle}>
          Tell us where you are going and we will find food along the way.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locations</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onChange('origin', value)}
          placeholder="Starting point"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={preferences.origin}
        />
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onChange('destination', value)}
          placeholder="Destination"
          placeholderTextColor={colors.secondaryText}
          style={styles.input}
          value={preferences.destination}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Text style={styles.label}>Budget</Text>
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
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          onChangeText={(value) => onChange('mood', value)}
          placeholder="Mood (optional)"
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
        <Text style={styles.buttonText}>Update recommendations</Text>
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
