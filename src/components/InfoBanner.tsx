import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { colors, spacing } from '../theme';

type InfoBannerProps = {
  titleKey: string;
  bodyKey: string;
};

export function InfoBanner({ titleKey, bodyKey }: InfoBannerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.banner}>
      <Icon color={colors.forest} name="star-four-points" size={22} />
      <View style={styles.copy}>
        <Text style={styles.title}>{t(titleKey)}</Text>
        <Text style={styles.body}>{t(bodyKey)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'flex-start',
    backgroundColor: '#F2F9ED',
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },
});
