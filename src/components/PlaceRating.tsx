import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Place } from '../types';
import { formatRating } from '../services/format';
import { colors } from '../theme';

export function PlaceRating({ place }: { place: Place }) {
  const { i18n, t } = useTranslation();
  if (place.rating === undefined) return null;

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
  const value = formatRating(place.rating, locale);
  const count = place.ratingCount !== undefined && place.ratingCount > 0
    ? ` · ${new Intl.NumberFormat(locale).format(place.ratingCount)}`
    : '';

  return <View accessibilityLabel={t('app.ratingLabel', { value })} style={styles.badge}>
    <Text style={styles.star}>★</Text>
    <Text style={styles.value}>{value}</Text>
    {count ? <Text style={styles.count}>{count}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.yellow, borderColor: colors.peach, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 3, maxWidth: '100%', paddingHorizontal: 7, paddingVertical: 3 },
  star: { color: colors.accent, fontSize: 12, fontWeight: '900' }, value: { color: colors.text, fontSize: 12, fontWeight: '800' }, count: { color: colors.secondaryText, fontSize: 11, fontWeight: '600' },
});
