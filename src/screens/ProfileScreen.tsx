import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

const rows = [
  { label: 'Language', value: 'English' },
  { label: 'Notifications', value: 'Coming soon' },
  { label: 'Help & feedback', value: 'Coming soon' },
  { label: 'Privacy', value: 'Coming soon' },
];

export function ProfileScreen() {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Personal preferences will live here.</Text>

      <View style={styles.card}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    color: colors.secondaryText,
    fontSize: 14,
  },
});
