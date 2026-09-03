import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { getKnownAddressCoordinate, searchAddresses } from '../services/routeService';
import { colors, spacing } from '../theme';
import type { AddressSuggestion } from '../services/routeService';
import type { CommuteMode, CommutePreferences, Coordinate, RouteData } from '../types';

type SetupCommuteScreenProps = {
  preferences: CommutePreferences;
  onBack: () => void;
  onChange: <Key extends keyof CommutePreferences>(key: Key, value: CommutePreferences[Key]) => void;
  onSave: (preferences: CommutePreferences) => void | Promise<void>;
  route?: RouteData | null;
  routeError?: string | null;
  isSaving?: boolean;
};

type AddressKey = 'homeAddress' | 'workAddress';

const modes: Array<{ key: CommuteMode; icon: 'motorbike' | 'car-outline'; labelKey: string }> = [
  { key: 'motorbike', icon: 'motorbike', labelKey: 'commute.motorbike' },
  { key: 'car', icon: 'car-outline', labelKey: 'commute.car' },
];

export function SetupCommuteScreen({
  preferences,
  onBack,
  onChange,
  onSave,
  route,
  routeError,
  isSaving = false,
}: SetupCommuteScreenProps) {
  const { t } = useTranslation();
  const homeInputRef = useRef<TextInput>(null);
  const workInputRef = useRef<TextInput>(null);
  const [drafts, setDrafts] = useState({
    homeAddress: preferences.homeAddress,
    workAddress: preferences.workAddress,
  });
  const [draftCoordinates, setDraftCoordinates] = useState<{
    homeAddress?: Coordinate;
    workAddress?: Coordinate;
  }>({
    homeAddress: preferences.homeCoordinate,
    workAddress: preferences.workCoordinate,
  });
  const [activeField, setActiveField] = useState<AddressKey | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [remoteSuggestions, setRemoteSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setDrafts({ homeAddress: preferences.homeAddress, workAddress: preferences.workAddress });
    setDraftCoordinates({ homeAddress: preferences.homeCoordinate, workAddress: preferences.workCoordinate });
  }, [preferences.homeAddress, preferences.homeCoordinate, preferences.workAddress, preferences.workCoordinate]);

  const staticSuggestions: Record<AddressKey, AddressSuggestion[]> = {
    homeAddress: [
      { coordinate: getKnownAddressCoordinate(t('commute.homeAddress')), id: 'home-default', label: t('commute.homeAddress') },
      { id: 'home-suggestion', label: t('commute.homeSuggestion') },
    ],
    workAddress: [
      { coordinate: getKnownAddressCoordinate(t('commute.workAddress')), id: 'work-default', label: t('commute.workAddress') },
      { id: 'work-suggestion', label: t('commute.workSuggestion') },
    ],
  };

  const activeQuery = activeField ? drafts[activeField].trim() : '';

  useEffect(() => {
    setRemoteSuggestions([]);
    setIsSearching(false);

    if (!activeField || activeQuery.length < 3 || activeQuery === preferences[activeField]) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      void searchAddresses(activeQuery)
        .then((results) => {
          if (!cancelled) {
            setRemoteSuggestions(results);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRemoteSuggestions([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeField, activeQuery, preferences.homeAddress, preferences.workAddress]);

  const visibleSuggestions = activeField
    ? [...remoteSuggestions, ...staticSuggestions[activeField]].filter(
        (suggestion, index, all) => all.findIndex((item) => item.label === suggestion.label) === index,
      ).slice(0, 5)
    : [];

  const updateDraft = (key: AddressKey, value: string) => {
    setValidationError(null);
    setDrafts((current) => ({ ...current, [key]: value }));
    setDraftCoordinates((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const selectSuggestion = (key: AddressKey, suggestion: AddressSuggestion) => {
    updateDraft(key, suggestion.label);
    setDraftCoordinates((current) => ({
      ...current,
      [key]: suggestion.coordinate,
    }));
    setActiveField(null);
    Keyboard.dismiss();
  };

  const handleSave = () => {
    const homeAddress = drafts.homeAddress.trim();
    const workAddress = drafts.workAddress.trim();

    if (!homeAddress || !workAddress) {
      setValidationError(t('commute.addressRequired'));
      return;
    }

    setActiveField(null);
    Keyboard.dismiss();
    void onSave({
      ...preferences,
      homeAddress,
      homeCoordinate: draftCoordinates.homeAddress,
      workAddress,
      workCoordinate: draftCoordinates.workAddress,
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader onBack={onBack} />

        <View style={styles.headingBlock}>
          <Text style={styles.title}>{t('commute.title')}</Text>
          <Text style={styles.subtitle}>{t('commute.subtitle')}</Text>
        </View>

        <MapPreview error={routeError} isLoading={isSaving} route={route} />

        <View style={styles.addresses}>
          <AddressField
            active={activeField === 'homeAddress'}
            inputRef={homeInputRef}
            labelKey="commute.home"
            onChangeText={(value) => updateDraft('homeAddress', value)}
            onFocus={() => setActiveField('homeAddress')}
            onSubmitEditing={() => workInputRef.current?.focus()}
            placeholder={t('commute.homePlaceholder')}
            returnKeyType="next"
            suggestions={activeField === 'homeAddress' ? visibleSuggestions : staticSuggestions.homeAddress}
            value={drafts.homeAddress}
            accent={colors.forest}
            onSelectSuggestion={(suggestion) => selectSuggestion('homeAddress', suggestion)}
            isSearching={activeField === 'homeAddress' && isSearching}
          />
          <AddressField
            active={activeField === 'workAddress'}
            inputRef={workInputRef}
            labelKey="commute.work"
            onChangeText={(value) => updateDraft('workAddress', value)}
            onFocus={() => setActiveField('workAddress')}
            onSubmitEditing={handleSave}
            placeholder={t('commute.workPlaceholder')}
            returnKeyType="done"
            suggestions={activeField === 'workAddress' ? visibleSuggestions : staticSuggestions.workAddress}
            value={drafts.workAddress}
            accent={colors.accent}
            onSelectSuggestion={(suggestion) => selectSuggestion('workAddress', suggestion)}
            isSearching={activeField === 'workAddress' && isSearching}
          />
        </View>

        {validationError ? (
          <View style={styles.errorBanner}>
            <Icon color={colors.accent} name="alert-circle-outline" size={17} />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}

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

        <PrimaryButton disabled={isSaving} iconName="arrow-right" labelKey="commute.save" onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type AddressFieldProps = {
  active: boolean;
  accent: string;
  inputRef: RefObject<TextInput | null> | undefined;
  labelKey: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onSubmitEditing: () => void;
  placeholder: string;
  returnKeyType: 'done' | 'next';
  suggestions: AddressSuggestion[];
  value: string;
  isSearching: boolean;
};

function AddressField({
  active,
  accent,
  inputRef,
  labelKey,
  onChangeText,
  onFocus,
  onSelectSuggestion,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  suggestions,
  value,
  isSearching,
}: AddressFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.fieldGroup}>
      <Pressable
        accessibilityRole="button"
        onPress={() => inputRef?.current?.focus()}
        style={[styles.addressCard, active && styles.addressCardActive]}
      >
        <View style={[styles.addressDot, { backgroundColor: accent }]}>
          <Icon color={colors.white} name="map-marker" size={12} />
        </View>
        <View style={styles.addressCopy}>
          <Text style={styles.addressLabel}>{t(labelKey)}</Text>
          <TextInput
            accessibilityLabel={t(labelKey)}
            autoCapitalize="words"
            autoCorrect={false}
            blurOnSubmit={false}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={colors.secondaryText}
            ref={inputRef}
            returnKeyType={returnKeyType}
            selectionColor={colors.accent}
            style={styles.addressInput}
            textContentType="fullStreetAddress"
            value={value}
          />
        </View>
        {value ? (
          <Pressable
            accessibilityLabel={t('commute.clearAddress')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <Icon color={colors.secondaryText} name="close-circle" size={19} />
          </Pressable>
        ) : null}
      </Pressable>

      {active ? (
        <View style={styles.suggestions}>
          <View style={styles.suggestionHeading}>
            <Text style={styles.suggestionTitle}>{t('commute.suggestionTitle')}</Text>
            {isSearching ? <ActivityIndicator color={colors.forest} size="small" /> : null}
          </View>
          {suggestions.map((suggestion) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={suggestion.label}
              key={suggestion.id}
              onPress={() => onSelectSuggestion(suggestion)}
              style={styles.suggestion}
            >
              <Icon color={colors.forest} name="map-marker-outline" size={18} />
              <Text numberOfLines={1} style={styles.suggestionText}>{suggestion.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  fieldGroup: {
    gap: spacing.xs,
  },
  addressCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 66,
    paddingHorizontal: spacing.md,
  },
  addressCardActive: {
    borderColor: colors.forest,
  },
  addressDot: {
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    fontSize: 15,
    minHeight: 24,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  suggestions: {
    backgroundColor: colors.card,
    borderRadius: 15,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  suggestionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 24,
    paddingHorizontal: spacing.xs,
  },
  suggestionTitle: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  suggestion: {
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 38,
    paddingHorizontal: spacing.xs,
  },
  suggestionText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
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
