import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import i18n, { supportedLanguages, type SupportedLanguage } from '../i18n';
import { colors, spacing } from '../theme';

export function ProfileScreen() {
  const { t } = useTranslation();
  const currentLanguage: SupportedLanguage = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  const nextLanguage: SupportedLanguage = currentLanguage === 'en' ? 'vi' : 'en';
  const currentLanguageLabel =
    supportedLanguages.find((language) => language.code === currentLanguage)?.label ?? currentLanguage;

  const changeLanguage = () => {
    void i18n.changeLanguage(nextLanguage);
  };

  const rows = [
    { label: t('profile.notifications'), value: t('profile.comingSoon') },
    { label: t('profile.help'), value: t('profile.comingSoon') },
    { label: t('profile.privacy'), value: t('profile.comingSoon') },
  ];

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          onPress={changeLanguage}
          style={styles.row}
        >
          <Text style={styles.label}>{t('profile.language')}</Text>
          <Text style={styles.value}>{currentLanguageLabel}</Text>
        </Pressable>
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
