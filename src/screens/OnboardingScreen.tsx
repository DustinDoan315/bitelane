import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type OnboardingScreenProps = {
  onContinue: () => void;
};

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🍴</Text>
        <Text style={styles.title}>BiteLane</Text>
        <Text style={styles.subtitle}>Your next meal, already on the way.</Text>
        <Text style={styles.body}>
          Find food that fits your route, budget, and mood without wasting time deciding.
        </Text>
      </View>

      <Pressable accessibilityRole="button" onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>Start exploring</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  logo: {
    backgroundColor: colors.accentSoft,
    borderRadius: 48,
    fontSize: 56,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  body: {
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
    maxWidth: 320,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
