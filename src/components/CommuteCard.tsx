import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { colors, spacing } from '../theme';
import type { CommuteMode, RouteData } from '../types';

type CommuteCardProps = {
  isLoading?: boolean;
  mode: CommuteMode;
  route?: RouteData | null;
};

export function CommuteCard({ isLoading = false, mode, route }: CommuteCardProps) {
  const { t } = useTranslation();
  const routeMeta = route
    ? `${t(`commute.${mode}`)} · ${Math.max(1, Math.round(route.durationSeconds / 60))} min · ${(route.distanceMeters / 1000).toFixed(1)} km`
    : t('home.routeMeta');
  const statusLabel = isLoading
    ? t('commute.updatingRoute')
    : route?.source === 'live'
      ? t('home.live')
      : t('commute.routeFallback');

  return (
    <View style={styles.card}>
      <View style={styles.iconTile}>
        <Icon color={colors.accent} name={mode === 'motorbike' ? 'motorbike' : 'car-outline'} size={19} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{t('home.route')}</Text>
        <Text style={styles.meta}>{routeMeta}</Text>
      </View>
      <View style={styles.livePill}>
        <Text style={styles.liveText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 13,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.secondaryText,
    fontSize: 13,
  },
  livePill: {
    backgroundColor: colors.greenSoft,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  liveText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
});
