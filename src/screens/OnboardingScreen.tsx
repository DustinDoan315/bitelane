import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '../components/ActionButton';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { colors } from '../theme';

const slides: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'map-marker-path', title: 'onboarding.routeTitle', body: 'onboarding.routeBody' },
  { icon: 'silverware-fork-knife', title: 'onboarding.mealTitle', body: 'onboarding.mealBody' },
  { icon: 'heart-outline', title: 'onboarding.saveTitle', body: 'onboarding.saveBody' },
];

export function OnboardingScreen({ onSkip, onStart }: { onSkip: () => void; onStart: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const finalStep = step === slides.length - 1;

  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.topRow}>
      <Text style={styles.stepLabel}>{t('onboarding.step', { current: step + 1, total: slides.length })}</Text>
      <Pressable accessibilityRole="button" onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </Pressable>
    </View>
    <View style={styles.content}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.illustration}>
        {step === 0 ? <MapIntroAnimation /> : <View style={styles.iconCircle}>
          <Icon color={colors.forest} name={slide.icon} size={76} />
        </View>}
        <View style={styles.artTag}>
          <Icon color={colors.accent} name="food" size={18} />
          <Text style={styles.artTagText}>{t('onboarding.artLabel')}</Text>
        </View>
      </View>
      <Text style={styles.title}>{t(slide.title)}</Text>
      <Text style={styles.body}>{t(slide.body)}</Text>
    </View>
    <View style={styles.footer}>
      <View accessibilityLabel={t('onboarding.step', { current: step + 1, total: slides.length })} style={styles.dots}>
        {slides.map((item, index) => <View key={item.title} style={[styles.dot, index === step && styles.activeDot]} />)}
      </View>
      <View style={styles.actions}>
        {step > 0 ? <ActionButton secondary label={t('onboarding.back')} onPress={() => setStep(step - 1)} /> : null}
        <View style={styles.primaryAction}>
          <ActionButton label={t(finalStep ? 'onboarding.start' : 'onboarding.next')} onPress={() => finalStep ? onStart() : setStep(step + 1)} />
        </View>
      </View>
    </View>
  </ScrollView>;
}

function MapIntroAnimation() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(250),
      Animated.timing(progress, { toValue: 1, duration: 2100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(progress, { toValue: 0, duration: 1, useNativeDriver: true }),
      Animated.delay(350),
    ]));
    animation.start();
    return () => animation.stop();
  }, [progress]);
  const reveal = (from: number, to: number) => progress.interpolate({ inputRange: [from, to], outputRange: [0, 1], extrapolate: 'clamp' });
  const pop = progress.interpolate({ inputRange: [0.42, 0.58], outputRange: [0.5, 1], extrapolate: 'clamp' });

  return <View style={styles.mapCard}>
    <View style={styles.mapPark} />
    <View style={[styles.street, styles.streetHorizontal, { top: 32 }]} />
    <View style={[styles.street, styles.streetHorizontal, { top: 77 }]} />
    <View style={[styles.street, styles.streetHorizontal, { top: 122 }]} />
    <View style={[styles.street, styles.streetVertical, { left: 34, transform: [{ rotate: '8deg' }] }]} />
    <View style={[styles.street, styles.streetVertical, { left: 91, transform: [{ rotate: '-7deg' }] }]} />
    <View style={[styles.street, styles.streetVertical, { left: 159, transform: [{ rotate: '6deg' }] }]} />
    <Animated.View style={[styles.routeSegment, { left: 27, top: 127, width: 39, opacity: reveal(0.08, 0.24) }]} />
    <Animated.View style={[styles.routeSegment, { left: 63, top: 98, width: 4, height: 32, opacity: reveal(0.2, 0.36) }]} />
    <Animated.View style={[styles.routeSegment, { left: 64, top: 97, width: 52, opacity: reveal(0.32, 0.49) }]} />
    <Animated.View style={[styles.routeSegment, { left: 113, top: 68, width: 4, height: 32, opacity: reveal(0.46, 0.63) }]} />
    <Animated.View style={[styles.routeSegment, { left: 114, top: 67, width: 73, opacity: reveal(0.6, 0.8) }]} />
    <Animated.View style={[styles.mapStart, { opacity: reveal(0.02, 0.12) }]} />
    <Animated.View style={[styles.foodPin, { opacity: reveal(0.44, 0.57), transform: [{ scale: pop }] }]}>
      <Icon color={colors.white} name="silverware-fork-knife" size={13} />
    </Animated.View>
    <Animated.View style={[styles.mapDestination, { opacity: reveal(0.76, 0.88), transform: [{ scale: pop }] }]} />
  </View>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'space-between', padding: 24, gap: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  skipButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { color: colors.forest, fontSize: 14, fontWeight: '700' },
  content: { flexGrow: 1, justifyContent: 'center', gap: 18 },
  illustration: { height: 260, borderRadius: 28, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 164, height: 164, borderRadius: 82, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  mapCard: { width: 228, height: 168, marginBottom: 16, borderRadius: 20, backgroundColor: colors.white, overflow: 'hidden' },
  mapPark: { position: 'absolute', left: 147, top: 14, width: 36, height: 20, borderRadius: 6, backgroundColor: colors.greenSoft },
  street: { position: 'absolute', backgroundColor: colors.border },
  streetHorizontal: { left: -8, width: 244, height: 8, borderRadius: 4 },
  streetVertical: { top: -12, width: 8, height: 196, borderRadius: 4 },
  routeSegment: { position: 'absolute', height: 4, borderRadius: 3, backgroundColor: colors.forest },
  mapStart: { position: 'absolute', left: 20, top: 120, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.white },
  foodPin: { position: 'absolute', left: 102, top: 54, width: 27, height: 27, borderRadius: 14, backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  mapDestination: { position: 'absolute', left: 180, top: 60, width: 17, height: 17, borderRadius: 9, backgroundColor: colors.forest, borderWidth: 3, borderColor: colors.white },
  artTag: { position: 'absolute', right: 18, bottom: 18, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 8 },
  artTagText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', lineHeight: 38 },
  body: { color: colors.secondaryText, fontSize: 16, lineHeight: 24 },
  footer: { gap: 18 }, dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border }, activeDot: { width: 22, backgroundColor: colors.accent },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 }, primaryAction: { flex: 1 },
});
