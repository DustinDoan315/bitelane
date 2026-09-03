import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { MealCard } from '../components/MealCard';
import { colors, spacing } from '../theme';
import { Meal } from '../types';

type SavedScreenProps = {
  meals: Meal[];
  onToggleSaved: (meal: Meal) => void;
};

export function SavedScreen({ meals, onToggleSaved }: SavedScreenProps) {
  if (meals.length === 0) {
    return <EmptyState title="No saved meals yet" message="Bookmark a recommendation and it will appear here." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Saved meals</Text>
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
