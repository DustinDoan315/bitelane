import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import type { CommuteMode, CommutePreferences } from '../types';

type SetupCommuteScreenProps = {
  preferences: CommutePreferences;
  onBack: () => void;
  onChange: <Key extends keyof CommutePreferences>(
    key: Key,
    value: CommutePreferences[Key],
  ) => void;
  onSave: () => void;
};

const modes: Array<{ key: CommuteMode; icon: 'motorbike' | 'car-outline'; labelKey: string }> = [
  { key: 'motorbike', icon: 'motorbike', labelKey: 'commute.motorbike' },
  { key: 'car', icon: 'car-outline', labelKey: 'commute.car' },
];

export function SetupCommuteScreen({ preferences, onBack, onChange, onSave }: SetupCommuteScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader onBack={onBack} />

      <View style={styles.headingBlock}>
        <Text style={styles.title}>{t('commute.title')}</Text>
        <Text style={styles.subtitle}>{t('commute.subtitle')}</Text>
      </View>

      <MapPreview />

      <View style={styles.addresses}>
        <AddressField
          labelKey="commute.home"
          onChangeText={(value) => onChange('homeAddress', value)}
          placeholder={t('commute.homeAddress')}
          value={preferences.homeAddress}
          accent={colors.forest}
        />
        <AddressField
          labelKey="commute.work"
          onChangeText={(value) => onChange('workAddress', value)}
          placeholder={t('commute.workAddress')}
          value={preferences.workAddress}
          accent={colors.accent}
        />
      </View>

      <View style={styles.modeBlock}>
        <Text style={styles.modeQuestion}>{t('commute.travelQuestion')}</Text>
        <View style={styles.modeRow}>
          {modes.map((mode) => {
            const selected = preferences.mode === mode.key;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={mode.key}
                onPress={() => onChange('mode', mode.key)}
                style={[styles.modeButton, selected && styles.modeButtonSelected]}
              >
                <Icon color={selected ? colors.forest : colors.secondaryText} name={mode.icon} size={17} />
                <Text style={[styles.modeLabel, selected && styles.modeLabelSelected]}>{t(mode.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PrimaryButton iconName="arrow-right" labelKey="commute.save" onPress={onSave} />
    </ScrollView>
  );
}

type AddressFieldProps = {
  labelKey: string;
  placeholder: string;
  value: string;
  accent: string;
  onChangeText: (value: string) => void;
};

function AddressField({ labelKey, placeholder, value, accent, onChangeText }: AddressFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.addressCard}>
      <View style={[styles.addressDot, { backgroundColor: accent }]} />
      <View style={styles.addressCopy}>
        <Text style={styles.addressLabel}>{t(labelKey)}</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text}
          style={styles.addressInput}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  headingBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
  },
  addresses: {
    gap: spacing.sm,
  },
  addressCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 66,
    paddingHorizontal: spacing.md,
  },
  addressDot: {
    borderRadius: 9,
    height: 18,
    width: 18,
  },
  addressCopy: {
    flex: 1,
    gap: 1,
  },
  addressLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  addressInput: {
    color: colors.text,
    fontSize: 15,
    padding: 0,
  },
  modeBlock: {
    gap: spacing.sm,
  },
  modeQuestion: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 49,
  },
  modeButtonSelected: {
    backgroundColor: colors.greenSoft,
  },
  modeLabel: {
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  modeLabelSelected: {
    color: colors.forest,
  },
});
