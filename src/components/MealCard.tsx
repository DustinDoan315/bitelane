import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';
import { Meal } from '../types';

type MealCardProps = {
  meal: Meal;
  isSaved: boolean;
  onToggleSaved: (meal: Meal) => void;
};

export function MealCard({ meal, isSaved, onToggleSaved }: MealCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{meal.symbol}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.name}>{meal.name}</Text>
          <Text style={styles.secondary}>{meal.cuisine}</Text>
          <Text style={styles.venue}>{meal.venue}</Text>
        </View>

        <Pressable
          accessibilityLabel={isSaved ? 'Remove from saved meals' : 'Save meal'}
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onToggleSaved(meal)}
          style={styles.saveButton}
        >
          <Text style={[styles.bookmark, isSaved && styles.bookmarkSelected]}>
            {isSaved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.reason}>{meal.matchReason}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.secondary}>↗ {meal.distanceText}</Text>
        <Text style={styles.price}>{meal.priceText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    gap: spacing.md,
    padding: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  symbolContainer: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  symbol: {
    fontSize: 25,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  venue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  secondary: {
    color: colors.secondaryText,
    fontSize: 13,
  },
  saveButton: {
    padding: 4,
  },
  bookmark: {
    color: colors.accent,
    fontSize: 25,
  },
  bookmarkSelected: {
    color: colors.accent,
  },
  reason: {
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
});
