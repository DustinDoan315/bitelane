import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

export function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress}
    style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
    <Text style={[styles.label, selected && styles.selectedLabel]}>{selected ? '✓ ' : ''}{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  chip: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 14 },
  selected: { backgroundColor: colors.greenSoft, borderColor: colors.forest }, label: { color: colors.secondaryText, fontSize: 13, fontWeight: '700' },
  selectedLabel: { color: colors.forest }, pressed: { opacity: 0.65 },
});
