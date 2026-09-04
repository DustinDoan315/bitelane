import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import type { IconName } from './Icon';
import type { Meal } from '../types';
import { colors, spacing } from '../theme';

type MealRowAction = {
  accessibilityLabel: string;
  iconName?: IconName;
  onPress: () => void;
};

type MealRowProps = {
  meal: Meal;
  metaVariant?: 'saved' | 'recent' | 'alternative';
  onPress?: () => void;
  trailingAction?: MealRowAction;
};

export function MealRow({ meal, metaVariant = 'alternative', onPress, trailingAction }: MealRowProps) {
  const { t } = useTranslation();
  const tileBackground = {
    green: colors.greenSoft,
    peach: colors.peach,
    yellow: colors.yellow,
  }[meal.tileColor];
  const meta = t(meal.metaKey, {
    closing: meal.closingTime,
    minutes: meal.distanceMinutes,
    price: meal.priceText,
    rating: meal.rating,
  });
  const row = (
    <View style={styles.row}>
      <View style={[styles.iconTile, { backgroundColor: tileBackground }]}>
        <Icon color={colors.forest} name={meal.iconName} size={28} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>{t(meal.nameKey)}</Text>
        <Text numberOfLines={1} style={styles.meta}>{meta}</Text>
      </View>
      {metaVariant === 'alternative' && meal.alternativeTime ? (
        <View style={[styles.timePill, meal.tileColor === 'peach' && styles.timePillPeach]}>
          <Text style={styles.timeText}>{t('meal.alternativeTime', { minutes: meal.alternativeTime })}</Text>
        </View>
      ) : null}
      {trailingAction ? (
        <Pressable
          accessibilityLabel={trailingAction.accessibilityLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={trailingAction.onPress}
          style={styles.actionButton}
        >
          <Icon color={colors.accent} name={trailingAction.iconName ?? 'heart'} size={20} />
        </Pressable>
      ) : (
        <Icon color={colors.accent} name="chevron-right" size={24} />
      )}
    </View>
  );

  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {row}
    </Pressable>
  ) : (
    row
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.sm,
  },
  iconTile: {
    alignItems: 'center',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.secondaryText,
    fontSize: 13,
  },
  timePill: {
    backgroundColor: colors.greenSoft,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  timePillPeach: {
    backgroundColor: colors.peach,
  },
  timeText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
