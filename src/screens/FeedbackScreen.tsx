import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { FeedbackReason } from '../types';

type FeedbackScreenProps = {
  onClose: () => void;
  onShowBetter: (reason: FeedbackReason) => void;
};

const reasons: Array<{ key: FeedbackReason; labelKey: string }> = [
  { key: 'tooFar', labelKey: 'feedback.tooFar' },
  { key: 'tooExpensive', labelKey: 'feedback.tooExpensive' },
  { key: 'similar', labelKey: 'feedback.similar' },
  { key: 'notForMe', labelKey: 'feedback.notForMe' },
];

export function FeedbackScreen({ onClose, onShowBetter }: FeedbackScreenProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<FeedbackReason>('similar');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable accessibilityLabel={t('feedback.close')} accessibilityRole="button" hitSlop={10} onPress={onClose}>
        <Icon name="close" size={26} />
      </Pressable>

      <View style={styles.illustration}>
        <Icon color={colors.accent} name="bowl-mix" size={56} />
      </View>

      <View style={styles.headingBlock}>
        <Text style={styles.title}>{t('feedback.title')}</Text>
        <Text style={styles.subtitle}>{t('feedback.subtitle')}</Text>
      </View>

      <View style={styles.options}>
        {reasons.map((reason) => {
          const selected = selectedReason === reason.key;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={reason.key}
              onPress={() => setSelectedReason(reason.key)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.optionCopy}>
                {selected ? (
                  <View style={styles.selectedIcon}>
                    <Icon color={colors.white} name="check" size={14} />
                  </View>
                ) : null}
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {t(reason.labelKey)}
                </Text>
              </View>
              {selected ? <Text style={styles.selectedLabel}>{t('feedback.selected')}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton dark iconName="arrow-right" labelKey="feedback.showBetter" onPress={() => onShowBetter(selectedReason)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: colors.peach,
    borderRadius: 25,
    height: 150,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  headingBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 21,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: '#F2F9ED',
  },
  optionCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectedIcon: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  optionTextSelected: {
    fontWeight: '700',
  },
  selectedLabel: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '600',
  },
});
