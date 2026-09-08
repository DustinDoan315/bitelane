import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

export function ActionButton({ label, onPress, secondary = false, disabled = false }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || pressed) && styles.dim]}>
    <Text style={[styles.text, secondary && styles.secondaryText]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { backgroundColor: colors.forest, borderRadius: 16, minHeight: 48, paddingHorizontal: 16, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' },
  secondary: { backgroundColor: colors.greenSoft }, text: { color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  secondaryText: { color: colors.forest }, dim: { opacity: 0.5 },
});
