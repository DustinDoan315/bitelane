import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { colors, spacing } from '../theme';
import type { MapType } from '../types';

type MapTypeFilterProps = {
  onChange: (value: MapType) => void;
  onToggle: () => void;
  open: boolean;
  value: MapType;
};

const options: Array<{ icon: 'map' | 'satellite-variant' | 'layers-outline'; value: MapType }> = [
  { icon: 'map', value: 'standard' },
  { icon: 'satellite-variant', value: 'satellite' },
  { icon: 'layers-outline', value: 'hybrid' },
];

export function MapTypeFilter({ onChange, onToggle, open, value }: MapTypeFilterProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={t('commute.mapFilter')}
        accessibilityRole="button"
        onPress={onToggle}
        style={styles.trigger}
      >
        <Icon color={colors.forest} name="layers-outline" size={18} />
        <Text style={styles.triggerText}>{t('commute.mapFilter')}</Text>
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[styles.option, selected && styles.selectedOption]}
              >
                <Icon color={selected ? colors.forest : colors.secondaryText} name={option.icon} size={18} />
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                  {t(`commute.map${option.value[0].toUpperCase()}${option.value.slice(1)}`)}
                </Text>
                {selected ? <Icon color={colors.forest} name="check" size={17} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    position: 'relative',
    zIndex: 40,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  triggerText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 18,
    gap: 4,
    marginTop: spacing.xs,
    minWidth: 174,
    padding: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  option: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
  },
  selectedOption: {
    backgroundColor: colors.greenSoft,
  },
  optionText: {
    color: colors.secondaryText,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedOptionText: {
    color: colors.forest,
  },
});
