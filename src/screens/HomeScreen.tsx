import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CommuteCard } from '../components/CommuteCard';
import { FeaturedMealCard } from '../components/FeaturedMealCard';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { CommutePreferences, Meal, RouteData } from '../types';

type HomeScreenProps = {
  featuredMeal: Meal;
  commute: CommutePreferences;
  isFeaturedSaved?: boolean;
  onEditCommute: () => void;
  onOpenMap: () => void;
  onNavigate: () => void;
  onToggleFeaturedSaved?: () => void;
  onToggleLanguage: () => void;
  onTryAnother: () => void;
  route?: RouteData | null;
  routeError?: string | null;
  isRouteLoading?: boolean;
};

export function HomeScreen({
  featuredMeal,
  commute,
  isFeaturedSaved = false,
  onEditCommute,
  onOpenMap,
  onNavigate,
  onToggleFeaturedSaved,
  onToggleLanguage,
  onTryAnother,
  route,
  routeError,
  isRouteLoading = false,
}: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headingBlock}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.subtitle}>{t('home.prompt')}</Text>
        </View>
        <Pressable accessibilityLabel={t('profile.language')} accessibilityRole="button" onPress={onToggleLanguage} style={styles.avatar}>
          <Text style={styles.avatarText}>D</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={onEditCommute}>
        <CommuteCard isLoading={isRouteLoading} mode={commute.mode} route={route} />
      </Pressable>

      <MapPreview error={routeError} isLoading={isRouteLoading} onPress={onOpenMap} route={route} />

      <FeaturedMealCard
        isSaved={isFeaturedSaved}
        meal={featuredMeal}
        onPress={onTryAnother}
        onToggleSaved={onToggleFeaturedSaved}
      />

      <PrimaryButton dark iconName="arrow-top-right" labelKey="home.takeMeThere" onPress={onNavigate} />

      <Pressable accessibilityRole="button" onPress={onTryAnother} style={styles.tryAnother}>
        <Icon color={colors.accent} name="refresh" size={17} />
        <Text style={styles.tryAnotherText}>{t('home.tryAnother')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingBlock: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    width: 38,
  },
  avatarText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  tryAnother: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  tryAnotherText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
