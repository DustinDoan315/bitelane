import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import type { Meal } from '../types';
import { colors, spacing } from '../theme';

type FeaturedMealCardProps = {
  isSaved?: boolean;
  meal: Meal;
  onPress?: () => void;
  onToggleSaved?: () => void;
};

export function FeaturedMealCard({ isSaved = false, meal, onPress, onToggleSaved }: FeaturedMealCardProps) {
  const { t } = useTranslation();
  const tileBackground = {
    green: colors.greenSoft,
    peach: colors.peach,
    yellow: colors.yellow,
  }[meal.tileColor];
  const cardContent = (
    <>
      <View style={[styles.illustration, { backgroundColor: tileBackground }]}>
        <View style={styles.illustrationCircle}>
          <Icon color={colors.peach} name={meal.iconName} size={45} />
        </View>
        <View style={styles.detourBadge}>
          <Text style={styles.detourText}>+{meal.distanceMinutes} min detour</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.eyebrow}>{t('home.featuredBadge')}</Text>
        <Text style={styles.name}>{t(meal.nameKey)}</Text>
        <Text style={styles.meta}>
          {t(meal.metaKey, {
            closing: meal.closingTime,
            price: meal.priceText,
            rating: meal.rating,
          })}
        </Text>
        <Text style={styles.reason}>{meal.reasonKey ? t(meal.reasonKey) : null}</Text>
        <View style={styles.footer}>
          <Text style={styles.note}>{meal.noteKey ? t(meal.noteKey) : null}</Text>
          <View style={styles.arrowButton}>
            <Icon color={colors.accent} name="chevron-right" size={25} />
          </View>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {cardContent}
        </Pressable>
      ) : cardContent}
      {onToggleSaved ? (
        <Pressable
          accessibilityLabel={t(isSaved ? 'meal.removeSaved' : 'meal.save')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onToggleSaved}
          style={styles.saveButton}
        >
          <Icon color={colors.accent} name={isSaved ? 'heart' : 'heart-outline'} size={21} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  illustration: {
    height: 105,
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderRadius: 52,
    height: 92,
    justifyContent: 'center',
    marginRight: 30,
    width: 92,
  },
  detourBadge: {
    backgroundColor: colors.white,
    borderRadius: 15,
    bottom: -1,
    left: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: 'absolute',
  },
  detourText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  details: {
    gap: 6,
    padding: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: colors.secondaryText,
    fontSize: 13,
  },
  reason: {
    color: colors.text,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  note: {
    color: colors.secondaryText,
    flex: 1,
    fontSize: 13,
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 36,
    zIndex: 2,
  },
});
