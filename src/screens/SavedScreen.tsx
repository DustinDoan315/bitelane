import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../components/EmptyState';
import { MealCard } from '../components/MealCard';
import { colors, spacing } from '../theme';
import { Meal } from '../types';

type SavedScreenProps = {
  meals: Meal[];
  onToggleSaved: (meal: Meal) => void;
};

export function SavedScreen({ meals, onToggleSaved }: SavedScreenProps) {
  const { t } = useTranslation();

  if (meals.length === 0) {
    return <EmptyState titleKey="saved.emptyTitle" messageKey="saved.emptyMessage" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('saved.title')}</Text>
      <View style={styles.cards}>
        {meals.map((meal) => (
          <MealCard isSaved key={meal.id} meal={meal} onToggleSaved={onToggleSaved} />
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
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  cards: {
    gap: spacing.md,
  },
});
