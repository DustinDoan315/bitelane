import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Place } from '../types';
import { colors } from '../theme';
import { Icon } from './Icon';

export function SaveButton({ place, saved, compact = false, onPress }: {
  place: Place; saved: boolean; compact?: boolean; onPress: () => void;
}) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const previousSaved = useRef(saved);

  useEffect(() => {
    if (previousSaved.current === saved) return;
    previousSaved.current = saved;
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { bounciness: 14, speed: 20, toValue: 1.18, useNativeDriver: false }),
        Animated.spring(scale, { bounciness: 10, speed: 18, toValue: 1, useNativeDriver: false }),
      ]),
      saved
        ? Animated.sequence([
          Animated.timing(ring, { duration: 120, toValue: 1, useNativeDriver: false }),
          Animated.timing(ring, { duration: 420, toValue: 0, useNativeDriver: false }),
        ])
        : Animated.timing(ring, { duration: 180, toValue: 0, useNativeDriver: false }),
    ]).start();
  }, [ring, saved, scale]);

  return <Pressable accessibilityRole="button" accessibilityLabel={t(saved ? 'app.removeSaved' : 'app.savePlace', { name: place.name })}
    accessibilityState={{ selected: saved }} onPress={onPress} style={[styles.button, compact && styles.compact, saved && styles.saved]}>
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.ring, styles.ringInactive, { opacity: ring, transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.35] }) }] }]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon name={saved ? 'heart' : 'heart-outline'} size={compact ? 22 : 21} color={saved ? colors.accent : colors.forest} />
      </Animated.View>
    </View>
    {!compact ? <View style={styles.copy}>
      <Text style={[styles.label, saved && styles.savedText]}>{saved ? t('app.savedState') : t('app.save')}</Text>
      {saved ? <Text style={styles.hint}>{t('app.savedHint')}</Text> : null}
    </View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: colors.greenSoft, borderColor: colors.greenSoft, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, paddingHorizontal: 16 },
  compact: { borderColor: colors.border, borderRadius: 24, height: 48, justifyContent: 'center', minHeight: 48, paddingHorizontal: 0, width: 48 },
  saved: { backgroundColor: colors.accentSoft, borderColor: colors.accent }, iconWrap: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  ring: { borderColor: colors.accent, borderRadius: 20, borderWidth: 2, height: 28, position: 'absolute', width: 28 }, ringInactive: { pointerEvents: 'none' }, copy: { gap: 1 }, label: { color: colors.forest, fontSize: 15, fontWeight: '800' }, savedText: { color: colors.accent }, hint: { color: colors.secondaryText, fontSize: 11 },
});
