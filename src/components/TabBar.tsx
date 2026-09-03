import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';
import { AppTab } from '../types';

type TabBarProps = {
  selectedTab: AppTab;
  onSelect: (tab: AppTab) => void;
};

const tabs: Array<{ key: AppTab; labelKey: string; icon: string }> = [
  { key: 'discover', labelKey: 'tabs.discover', icon: '⌕' },
  { key: 'route', labelKey: 'tabs.route', icon: '↗' },
  { key: 'saved', labelKey: 'tabs.saved', icon: '♡' },
  { key: 'profile', labelKey: 'tabs.profile', icon: '◯' },
];

export function TabBar({ selectedTab, onSelect }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.key;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={styles.tab}
          >
            <Text style={[styles.icon, isSelected && styles.selected]}>{tab.icon}</Text>
            <Text style={[styles.label, isSelected && styles.selected]}>{t(tab.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: colors.white,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  icon: {
    color: colors.secondaryText,
    fontSize: 22,
    lineHeight: 24,
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
