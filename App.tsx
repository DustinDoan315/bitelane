import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { useBiteLane } from './src/hooks/useBiteLane';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { JourneySetupScreen } from './src/screens/JourneySetupScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PlaceDetailsScreen } from './src/screens/PlaceDetailsScreen';
import type { FoodOffer, MainTab, Place } from './src/types';
import { colors } from './src/theme';
import { currencyForCountry, defaultBudget } from './src/services/market';

export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const app = useBiteLane();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MainTab>('home');
  const [overlay, setOverlay] = useState<'setup' | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [offer, setOffer] = useState<FoodOffer | null>(null);
  const [reportOnOpen, setReportOnOpen] = useState(false);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (offer) { setOffer(null); return true; }
      if (place) { setPlace(null); setReportOnOpen(false); return true; }
      if (overlay) { setOverlay(null); return true; }
      if (app.ready && !app.state.hasSeenOnboarding) { app.setState((s) => ({ ...s, hasSeenOnboarding: true })); return true; }
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [app.ready, app.state.hasSeenOnboarding, app.setState, offer, place, overlay, tab]);
  const retry = () => { if (app.state.journey) void app.refresh(app.state.journey); };
  const saved = (target: Place) => app.state.saved.some((p) => p.id === target.id);
  const openOffer = (target: FoodOffer) => { setOffer(target); setPlace(null); setReportOnOpen(false); };
  const openPlace = (target: Place, startReport = false) => { setPlace(target); setOffer(null); setOverlay(null); setReportOnOpen(startReport); };
  const closePlace = () => { setPlace(null); setReportOnOpen(false); };
  return <View style={styles.root}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.logo}>BiteLane<Text style={{ color: colors.accent }}>.</Text></Text>
      </View>
      {app.storageError ? <Text accessibilityRole="alert" style={styles.notice}>{t('app.errors.storageError')}</Text> : null}
      <View style={styles.content}>
        {!app.ready ? <ActivityIndicator style={{ flex: 1 }} color={colors.forest} />
          : offer ? <PlaceDetailsScreen key={`offer-${offer.id}`} offer={offer} place={offer.place} journey={app.state.journey} baseRoute={app.route} reports={app.state.reports.filter((report) => report.placeId === offer.place.id)} saved={saved(offer.place)} onSave={() => app.toggleSaved(offer.place)} onVisit={() => app.recordVisit(offer.place)} onReport={(itemName, amount, currency) => app.addMenuReport(offer.place, itemName, amount, currency)} onBack={() => setOffer(null)} />
          : place ? <PlaceDetailsScreen key={place.id} offer={null} place={place} journey={app.visible.some((candidate) => candidate.place.id === place.id) ? app.state.journey : null} baseRoute={app.visible.some((candidate) => candidate.place.id === place.id) ? app.route : null} reports={app.state.reports.filter((report) => report.placeId === place.id)} saved={saved(place)} initialReportOpen={reportOnOpen} onSave={() => app.toggleSaved(place)} onVisit={() => app.recordVisit(place)} onReport={(itemName, amount, currency) => app.addMenuReport(place, itemName, amount, currency)} onBack={closePlace} />
          : !app.state.hasSeenOnboarding ? <OnboardingScreen
            onSkip={() => app.setState((s) => ({ ...s, hasSeenOnboarding: true }))}
            onStart={() => { app.setState((s) => ({ ...s, hasSeenOnboarding: true })); setOverlay('setup'); }} />
          : overlay === 'setup' ? <JourneySetupScreen journey={app.state.journey} budget={app.state.budget} maxDetourMinutes={app.state.preferences.maxDetourMinutes} onBack={() => setOverlay(null)} onSave={(journey, budget, maxDetourMinutes) => { const currency = currencyForCountry(journey.origin.countryCode) ?? 'VND'; app.setState((s) => ({ ...s, journey, budget: budget.currency === currency && budget.countryCode === journey.origin.countryCode ? budget : defaultBudget(currency, journey.origin.countryCode), preferences: { ...s.preferences, maxDetourMinutes } })); setOverlay(null); setTab('home'); }} />
          : tab === 'home' ? <DiscoverScreen journey={app.state.journey} route={app.route} candidates={app.visible} detours={app.detours} offers={app.offers} budget={app.state.budget} phase={app.phase} error={app.error}
            preferences={app.state.preferences} onPreferences={(preferences) => app.setState((s) => ({ ...s, preferences }))} saved={app.state.saved}
            onBudget={app.setBudget} onSetup={() => setOverlay('setup')} onRetry={retry} onOpenOffer={openOffer} onOpenPlace={(target) => openPlace(target)} onSave={app.toggleSaved} />
          : <LibraryScreen kind={tab === 'saved' ? 'saved' : 'history'} profile={tab === 'profile'} language={app.state.language} onLanguage={(language) => app.setState((s) => ({ ...s, language }))} saved={app.state.saved} visits={app.state.visits} onOpen={setPlace} onSave={app.toggleSaved} onDiscover={() => setTab('home')}
            onRemoveVisit={(id) => app.setState((s) => ({ ...s, visits: s.visits.filter((v) => v.id !== id) }))} />}
      </View>
      {Platform.OS === 'web' ? <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => {}); }} style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors · ODbL</Text>
      </Pressable> : null}
      </View>
    </SafeAreaView>
    {!place && !offer && !overlay && app.state.hasSeenOnboarding && app.ready ? <View style={styles.bottomDock}>
      <BottomTabBar bottomInset={insets.bottom} selectedTab={tab} onSelect={setTab} />
    </View> : null}
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, safe: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', backgroundColor: colors.background }, app: { flex: 1, width: '100%' }, bottomDock: { width: '100%', maxWidth: 760, alignSelf: 'center', backgroundColor: colors.white },
  content: { flex: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
  logo: { color: colors.forest, fontSize: 25, fontWeight: '800' },
  attribution: { alignItems: 'center', padding: 8 }, attributionText: { fontSize: 10, color: colors.secondaryText },
  notice: { color: colors.accent, padding: 12, fontSize: 13 },
});
