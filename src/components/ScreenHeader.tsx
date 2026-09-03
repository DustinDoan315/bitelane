import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { colors, spacing } from '../theme';

type ScreenHeaderProps = {
  onBack?: () => void;
  onRightPress?: () => void;
  rightLabelKey?: string;
};

export function ScreenHeader({ onBack, onRightPress, rightLabelKey }: ScreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityLabel={t('commute.back')}
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.iconButton}
        >
          <Icon name="arrow-left" size={24} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}

      {rightLabelKey && onRightPress ? (
        <Pressable accessibilityRole="button" onPress={onRightPress}>
          <Text style={styles.rightLabel}>{t(rightLabelKey)}</Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  iconButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rightLabel: {
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '700',
    padding: spacing.xs,
  },
});
