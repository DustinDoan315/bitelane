import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import type { IconName } from './Icon';
import { colors, spacing } from '../theme';

type EmptyStateProps = {
  iconName?: IconName;
  titleKey: string;
  bodyKey: string;
};

export function EmptyState({ bodyKey, iconName = 'heart-outline', titleKey }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Icon color={colors.forest} name={iconName} size={48} />
      <Text style={styles.title}>{t(titleKey)}</Text>
      <Text style={styles.body}>{t(bodyKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
