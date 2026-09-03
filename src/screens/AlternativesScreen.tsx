import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { InfoBanner } from '../components/InfoBanner';
import { MealRow } from '../components/MealRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import type { Meal } from '../types';

type AlternativesScreenProps = {
  meals: Meal[];
  onBack: () => void;
  onBackToPick: () => void;
};

export function AlternativesScreen({ meals, onBack, onBackToPick }: AlternativesScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader onBack={onBack} />

      <View style={styles.headingBlock}>
        <Text style={styles.title}>{t('alternatives.title')}</Text>
        <Text style={styles.subtitle}>{t('alternatives.subtitle')}</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterPill}>
          <Text style={styles.filterText}>{t('alternatives.filter')}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => undefined}>
          <Text style={styles.refine}>{t('alternatives.refine')}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {meals.map((meal) => (
          <MealRow key={meal.id} meal={meal} metaVariant="alternative" />
        ))}
      </View>

      <InfoBanner titleKey="alternatives.varietyTitle" bodyKey="alternatives.varietyBody" />
      <PrimaryButton labelKey="alternatives.backToPick" onPress={onBackToPick} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  headingBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 15,
  },
  filters: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterPill: {
    backgroundColor: colors.greenSoft,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  filterText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  refine: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
  },
});
