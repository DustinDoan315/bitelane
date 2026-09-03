import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>♡</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    color: colors.accent,
    fontSize: 50,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
