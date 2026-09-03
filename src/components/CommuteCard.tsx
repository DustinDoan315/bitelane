import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { colors, spacing } from '../theme';
import type { CommuteMode } from '../types';

type CommuteCardProps = {
  mode: CommuteMode;
};

export function CommuteCard({ mode }: CommuteCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.iconTile}>
        <Icon color={colors.accent} name={mode === 'motorbike' ? 'motorbike' : 'car-outline'} size={19} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{t('home.route')}</Text>
        <Text style={styles.meta}>{t('home.routeMeta')}</Text>
      </View>
      <View style={styles.livePill}>
        <Text style={styles.liveText}>{t('home.live')}</Text>
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
