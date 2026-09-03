import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { FoodGoal } from '../types';

type SetupGoalScreenProps = {
  onContinue: (goal: FoodGoal) => void;
  onSkip: () => void;
};

const goals: FoodGoal[] = ['healthier', 'saveTime', 'budget'];

export function SetupGoalScreen({ onContinue, onSkip }: SetupGoalScreenProps) {
  const { t } = useTranslation();
  const [selectedGoal, setSelectedGoal] = useState<FoodGoal>('healthier');

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>{t('onboarding.logo')}</Text>
        <Pressable accessibilityRole="button" onPress={onSkip}>
          <Text style={styles.skip}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      <View style={styles.illustration}>
        <View style={styles.plate}>
          <View style={[styles.foodDot, styles.dotOne]} />
          <View style={[styles.foodDot, styles.dotTwo]} />
          <View style={[styles.foodDot, styles.dotThree]} />
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{t('onboarding.eyebrow')}</Text>
        <Text style={styles.title}>{t('onboarding.title')}</Text>
      </View>

      <View style={styles.options}>
        {goals.map((goal) => {
          const selected = selectedGoal === goal;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={goal}
              onPress={() => setSelectedGoal(goal)}
              style={styles.option}
            >
              <View style={styles.optionLabel}>
                <View style={[styles.check, selected && styles.checkSelected]}>
                  {selected ? <Icon color={colors.forest} name="check" size={17} /> : null}
                </View>
                <Text style={styles.optionTitle}>{t(`onboarding.goals.${goal}`)}</Text>
              </View>
              <Text style={[styles.optionDetail, selected && styles.optionDetailSelected]}>
                {t(`onboarding.goalDetails.${goal}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        iconName="arrow-right"
        labelKey="onboarding.continue"
        onPress={() => onContinue(selectedGoal)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    color: colors.forest,
    fontSize: 21,
    fontWeight: '800',
  },
  skip: {
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: colors.peach,
    borderRadius: 28,
    height: 238,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  plate: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: colors.white,
    borderRadius: 84,
    borderWidth: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    height: 168,
    justifyContent: 'center',
    padding: 25,
    width: 168,
  },
  foodDot: {
    borderRadius: 20,
    height: 29,
    width: 29,
  },
  dotOne: { backgroundColor: '#D6F267' },
  dotTwo: { backgroundColor: '#B9EE69' },
  dotThree: { backgroundColor: '#FFC13D' },
  copy: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 35,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  optionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  check: {
    alignItems: 'center',
    backgroundColor: '#F2F2ED',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  checkSelected: {
    backgroundColor: colors.greenSoft,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  optionDetail: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  optionDetailSelected: {
    color: colors.forest,
    fontWeight: '600',
  },
});
