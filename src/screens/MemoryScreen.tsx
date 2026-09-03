import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MealRow } from '../components/MealRow';
import { colors, spacing } from '../theme';
import type { Meal } from '../types';

type MemorySegment = 'saved' | 'recent';

type MemoryScreenProps = {
  savedMeals: Meal[];
  recentMeals: Meal[];
  segment: MemorySegment;
};

export function MemoryScreen({ savedMeals, recentMeals, segment }: MemoryScreenProps) {
  const { t } = useTranslation();
  const meals = segment === 'saved' ? savedMeals : recentMeals;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.title}>{t('memory.title')}</Text>
        <Text style={styles.subtitle}>{t('memory.subtitle')}</Text>
      </View>

      <View style={styles.segmentedControl}>
        <View style={[styles.segment, segment === 'saved' && styles.segmentSelected]}>
          <Text style={[styles.segmentText, segment === 'saved' && styles.segmentTextSelected]}>
            {t('memory.savedTab')}
          </Text>
        </View>
        <View style={[styles.segment, segment === 'recent' && styles.segmentSelected]}>
          <Text style={[styles.segmentText, segment === 'recent' && styles.segmentTextSelected]}>
            {t('memory.recentTab')}
          </Text>
        </View>
      </View>

      {meals.length === 0 ? (
        <EmptyState titleKey="memory.emptyTitle" bodyKey="memory.emptyBody" />
      ) : (
        <>
          <Text style={styles.sectionLabel}>
            {segment === 'saved' ? t('memory.savedSection') : t('memory.recentSection')}
          </Text>
          <View style={styles.list}>
            {meals.map((meal) => (
              <MealRow key={meal.id} meal={meal} metaVariant={segment} />
            ))}
          </View>
          <InfoBanner titleKey="memory.varietyTitle" bodyKey="memory.varietyBody" />
        </>
      )}
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
  segmentedControl: {
    backgroundColor: colors.white,
    borderRadius: 22,
    flexDirection: 'row',
    padding: 3,
    width: 226,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 19,
    flex: 1,
    paddingVertical: 8,
  },
  segmentSelected: {
    backgroundColor: colors.greenSoft,
  },
  segmentText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: colors.forest,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: -spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
});
