import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import type { IconName } from './Icon';
import { colors, spacing } from '../theme';

type PrimaryButtonProps = {
  labelKey: string;
  onPress: () => void;
  iconName?: IconName;
  dark?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  labelKey,
  onPress,
  iconName,
  dark = false,
  disabled = false,
}: PrimaryButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, dark ? styles.dark : styles.forest, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{t(labelKey)}</Text>
      {iconName ? <Icon color={dark ? colors.lime : colors.white} name={iconName} size={22} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  forest: {
    backgroundColor: colors.forest,
  },
  dark: {
    backgroundColor: colors.black,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
