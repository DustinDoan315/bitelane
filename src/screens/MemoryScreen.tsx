import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { InfoBanner } from '../components/InfoBanner';
import { MealRow } from '../components/MealRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { Meal } from '../types';

type MemorySegment = 'saved' | 'recent';

type MemoryScreenProps = {
  savedMeals: Meal[];
  recentMeals: Meal[];
  segment: MemorySegment;
  onOpenPicker?: () => void;
  onToggleSaved?: (mealId: string) => void;
};

export function MemoryScreen({
  onOpenPicker,
  onToggleSaved,
  recentMeals,
  savedMeals,
  segment,
}: MemoryScreenProps) {
  return segment === 'saved' ? (
    <SavedMemoryScreen meals={savedMeals} onOpenPicker={onOpenPicker} onToggleSaved={onToggleSaved} />
  ) : (
    <HistoryMemoryScreen meals={recentMeals} onOpenPicker={onOpenPicker} />
  );
}

function HistoryMemoryScreen({ meals, onOpenPicker }: { meals: Meal[]; onOpenPicker?: () => void }) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>{t('memory.historyEyebrow')}</Text>
        <Text style={styles.title}>{t('memory.historyTitle')}</Text>
        <Text style={styles.subtitle}>{t('memory.historySubtitle')}</Text>
      </View>

      <MemorySummary
        iconName="history"
        label={t('memory.historyCount', { count: meals.length })}
        body={t('memory.historyInsight')}
      />

      {meals.length === 0 ? (
        <EmptyState
          bodyKey="memory.historyEmptyBody"
          iconName="history"
          titleKey="memory.historyEmptyTitle"
        />
      ) : (
        <>
          <Text style={styles.sectionLabel}>{t('memory.historySection')}</Text>
          <View style={styles.historyList}>
            {meals.map((meal, index) => (
              <View key={meal.id} style={styles.historyItem}>
                <View style={styles.timeline}>
                  <View style={styles.timelineDot}>
                    <Icon color={colors.white} name="check" size={11} />
                  </View>
                  {index < meals.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyLabel}>{t('memory.chosenMeal')}</Text>
                  <MealRow meal={meal} metaVariant="recent" />
                </View>
              </View>
            ))}
          </View>
          <InfoBanner titleKey="memory.historyBannerTitle" bodyKey="memory.historyBannerBody" />
        </>
      )}

      {onOpenPicker ? (
        <PrimaryButton labelKey="memory.seeTodaysPick" onPress={onOpenPicker} />
      ) : null}
    </ScrollView>
  );
}

function SavedMemoryScreen({
  meals,
  onOpenPicker,
  onToggleSaved,
}: {
  meals: Meal[];
  onOpenPicker?: () => void;
  onToggleSaved?: (mealId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>{t('memory.savedEyebrow')}</Text>
        <Text style={styles.title}>{t('memory.savedTitle')}</Text>
        <Text style={styles.subtitle}>{t('memory.savedSubtitle')}</Text>
      </View>

      <MemorySummary
        iconName="heart"
        label={t('memory.savedCount', { count: meals.length })}
        body={t('memory.savedInsight')}
      />

      {meals.length === 0 ? (
        <EmptyState bodyKey="memory.savedEmptyBody" titleKey="memory.savedEmptyTitle" />
      ) : (
        <>
          <Text style={styles.sectionLabel}>{t('memory.savedSection')}</Text>
          <View style={styles.list}>
            {meals.map((meal) => (
              <MealRow
                key={meal.id}
                meal={meal}
                metaVariant="saved"
                trailingAction={onToggleSaved ? {
                  accessibilityLabel: t('memory.removeSaved'),
                  iconName: 'heart',
                  onPress: () => onToggleSaved(meal.id),
                } : undefined}
              />
            ))}
          </View>
          <InfoBanner titleKey="memory.savedBannerTitle" bodyKey="memory.savedBannerBody" />
        </>
      )}

      {onOpenPicker ? (
        <PrimaryButton iconName="arrow-right" labelKey="memory.findMeal" onPress={onOpenPicker} />
      ) : null}
    </ScrollView>
  );
}

function MemorySummary({
  body,
  iconName,
  label,
}: {
  body: string;
  iconName: 'heart' | 'history';
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Icon color={colors.accent} name={iconName} size={22} />
      </View>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryBody}>{body}</Text>
      </View>
    </View>
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
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 21,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  summaryCopy: {
    flex: 1,
    gap: 3,
  },
  summaryLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryBody: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
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
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeline: {
    alignItems: 'center',
    paddingTop: 16,
    width: 18,
  },
  timelineDot: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
    zIndex: 1,
  },
  timelineLine: {
    backgroundColor: colors.greenSoft,
    flex: 1,
    marginVertical: -1,
    width: 2,
  },
  historyContent: {
    flex: 1,
    gap: spacing.xs,
  },
  historyLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
});
