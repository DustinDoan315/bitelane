import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { CommutePreferences, RouteData } from '../types';

type RouteMapScreenProps = {
  commute: CommutePreferences;
  error?: string | null;
  isLoading?: boolean;
  onBack: () => void;
  onRetry: () => void;
  route: RouteData | null;
};

export function RouteMapScreen({ commute, error, isLoading = false, onBack, onRetry, route }: RouteMapScreenProps) {
  const { t } = useTranslation();
  const routeMeta = route
    ? `${t(`commute.${commute.mode}`)} · ${Math.max(1, Math.round(route.durationSeconds / 60))} min · ${(route.distanceMeters / 1000).toFixed(1)} km`
    : t('home.routeMeta');

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <MapPreview error={error} fullScreen isLoading={isLoading} route={route} />

      <View pointerEvents="box-none" style={styles.overlay}>
        <Pressable
          accessibilityLabel={t('commute.closeMap')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={styles.closeButton}
        >
          <Icon color={colors.text} name="arrow-left" size={23} />
        </Pressable>
        <View style={styles.titlePill}>
          <Icon color={colors.forest} name="map-marker-path" size={17} />
          <Text style={styles.title}>{t('commute.fullMapTitle')}</Text>
        </View>
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.eyebrow}>{t('commute.fullMapSubtitle')}</Text>
        <Text numberOfLines={1} style={styles.addresses}>
          {commute.homeAddress} → {commute.workAddress}
        </Text>
        <Text style={styles.routeMeta}>{routeMeta}</Text>
        <PrimaryButton disabled={isLoading} iconName="refresh" labelKey="commute.refreshRoute" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.map,
    flex: 1,
  },
  overlay: {
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    width: 44,
  },
  titlePill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: -36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addresses: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  routeMeta: {
    color: colors.secondaryText,
    fontSize: 14,
  },
});
