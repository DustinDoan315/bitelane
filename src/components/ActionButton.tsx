import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function ActionButton({ label, onPress, secondary = false, disabled = false, loading = false }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean;
}) {
  const unavailable = disabled || loading;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: unavailable, busy: loading }} disabled={unavailable} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (unavailable || pressed) && styles.dim]}>
    <View style={styles.content}>
      {loading ? <ActivityIndicator size="small" color={secondary ? colors.forest : colors.white} /> : null}
      <Text style={[styles.text, secondary && styles.secondaryText]}>{label}</Text>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { backgroundColor: colors.forest, borderRadius: 16, minHeight: 48, paddingHorizontal: 16, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' },
  secondary: { backgroundColor: colors.greenSoft }, text: { color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  secondaryText: { color: colors.forest }, content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, dim: { opacity: 0.5 },
});
