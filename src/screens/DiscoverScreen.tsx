import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MealCard } from '../components/MealCard';
import { colors, spacing } from '../theme';
import { Meal, RoutePreferences } from '../types';

type DiscoverScreenProps = {
  preferences: RoutePreferences;
  recommendations: Meal[];
  savedMealIds: Set<string>;
  onOpenRoute: () => void;
  onRefresh: () => void;
  onToggleSaved: (meal: Meal) => void;
};

export function DiscoverScreen({
  preferences,
  recommendations,
  savedMealIds,
  onOpenRoute,
  onRefresh,
  onToggleSaved,
}: DiscoverScreenProps) {
  const { t } = useTranslation();
  const routeSummary = preferences.origin.trim() && preferences.destination.trim()
    ? t('discover.routeSummary', {
        origin: preferences.origin,
        destination: preferences.destination,
      })
    : t('discover.routeEmpty');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>{t('discover.eyebrow')}</Text>
        <Text style={styles.title}>{t('discover.title')}</Text>
        <Text style={styles.subtitle}>{t('discover.subtitle')}</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={onOpenRoute} style={styles.routeCard}>
        <Text style={styles.routeIcon}>⌖</Text>
        <View style={styles.routeText}>
          <Text style={styles.routeLabel}>{t('discover.routeLabel')}</Text>
          <Text numberOfLines={2} style={styles.routeSummary}>{routeSummary}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.recommendationHeader}>
        <Text style={styles.sectionTitle}>{t('discover.recommendations')}</Text>
        <Pressable accessibilityRole="button" onPress={onRefresh}>
          <Text style={styles.refresh}>{t('discover.refresh')}</Text>
        </Pressable>
      </View>

      <View style={styles.cards}>
        {recommendations.map((meal) => (
          <MealCard
            isSaved={savedMealIds.has(meal.id)}
            key={meal.id}
            meal={meal}
            onToggleSaved={onToggleSaved}
          />
        ))}
      </View>
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
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
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
  routeCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  routeIcon: {
    color: colors.accent,
    fontSize: 25,
  },
  routeText: {
    flex: 1,
    gap: 3,
  },
  routeLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  routeSummary: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    color: colors.secondaryText,
    fontSize: 28,
  },
  recommendationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  refresh: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  cards: {
    gap: spacing.md,
  },
});
