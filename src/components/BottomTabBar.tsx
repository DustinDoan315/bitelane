import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import type { IconName } from './Icon';
import { colors } from '../theme';
import type { MainTab } from '../types';

type BottomTabBarProps = {
  bottomInset?: number;
  selectedTab: MainTab;
  onSelect: (tab: MainTab) => void;
};

const tabs: Array<{ key: MainTab; labelKey: string; icon: IconName }> = [
  { key: 'home', labelKey: 'tabs.pick', icon: 'home-outline' },
  { key: 'history', labelKey: 'tabs.history', icon: 'history' },
  { key: 'saved', labelKey: 'tabs.saved', icon: 'heart-outline' },
];

export function BottomTabBar({ bottomInset = 0, selectedTab, onSelect }: BottomTabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(8, bottomInset) }]}>
      {tabs.map((tab) => {
        const selected = tab.key === selectedTab;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={styles.tab}
          >
            <Icon color={selected ? colors.accent : colors.secondaryText} name={tab.icon} size={22} />
            <Text style={[styles.label, selected && styles.selected]}>{t(tab.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingBottom: 8,
    paddingTop: 9,
  },
  tab: {
    alignItems: 'center',
    minHeight: 48,
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },
  selected: {
    color: colors.accent,
  },
});
