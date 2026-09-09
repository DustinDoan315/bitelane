import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { useBiteLane } from './src/hooks/useBiteLane';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { JourneySetupScreen } from './src/screens/JourneySetupScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlaceDetailsScreen } from './src/screens/PlaceDetailsScreen';
import { RouteMapScreen } from './src/screens/RouteMapScreen';
import type { FoodOffer, MainTab, Place } from './src/types';
import { colors } from './src/theme';

export default function App() {
  const app = useBiteLane();
  const { t } = useTranslation();
  const [tab, setTab] = useState<MainTab>('home');
  const [overlay, setOverlay] = useState<'setup' | 'map' | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [offer, setOffer] = useState<FoodOffer | null>(null);
  const [reportOnOpen, setReportOnOpen] = useState(false);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (offer) { setOffer(null); return true; }
      if (place) { setPlace(null); setReportOnOpen(false); return true; }
      if (overlay) { setOverlay(null); return true; }
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [offer, place, overlay, tab]);
  const retry = () => { if (app.state.journey) void app.refresh(app.state.journey); };
  const saved = (target: Place) => app.state.saved.some((p) => p.id === target.id);
  const openOffer = (target: FoodOffer) => { setOffer(target); setPlace(null); setReportOnOpen(false); };
  const openPlace = (target: Place, startReport = false) => { setPlace(target); setOffer(null); setOverlay(null); setReportOnOpen(startReport); };
  const closePlace = () => { setPlace(null); setReportOnOpen(false); };
  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.logo}>BiteLane<Text style={{ color: colors.accent }}>.</Text></Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('app.changeLanguage')} style={styles.language} onPress={() => app.setState((s) => ({ ...s, language: s.language === 'en' ? 'vi' : 'en' }))}>
          <Text style={styles.languageText}>{app.state.language === 'en' ? 'Tiếng Việt' : 'English'}</Text>
        </Pressable>
      </View>
      {app.storageError ? <Text accessibilityRole="alert" style={styles.notice}>{t('app.errors.storageError')}</Text> : null}
      <View style={styles.content}>
        {!app.ready ? <ActivityIndicator style={{ flex: 1 }} color={colors.forest} />
          : offer ? <PlaceDetailsScreen key={`offer-${offer.id}`} offer={offer} place={offer.place} journey={app.state.journey} baseRoute={app.route} reports={app.state.reports.filter((report) => report.placeId === offer.place.id)} saved={saved(offer.place)} onSave={() => app.toggleSaved(offer.place)} onVisit={() => app.recordVisit(offer.place)} onReport={(itemName, priceVnd) => app.addMenuReport(offer.place, itemName, priceVnd)} onBack={() => setOffer(null)} />
          : place ? <PlaceDetailsScreen key={place.id} offer={null} place={place} journey={app.state.journey} baseRoute={app.route} reports={app.state.reports.filter((report) => report.placeId === place.id)} saved={saved(place)} initialReportOpen={reportOnOpen} onSave={() => app.toggleSaved(place)} onVisit={() => app.recordVisit(place)} onReport={(itemName, priceVnd) => app.addMenuReport(place, itemName, priceVnd)} onBack={closePlace} />
          : overlay === 'setup' ? <JourneySetupScreen journey={app.state.journey} onBack={() => setOverlay(null)} onSave={(journey) => { app.setState((s) => ({ ...s, journey })); setOverlay(null); setTab('home'); }} />
          : overlay === 'map' && app.state.journey ? <RouteMapScreen journey={app.state.journey} places={app.visible.slice(0, 30).map((c) => c.place)} route={app.route} error={app.error} isLoading={app.phase !== 'idle'} onBack={() => setOverlay(null)} onOpenPlace={openPlace} onRetry={retry} />
          : tab === 'home' ? <DiscoverScreen journey={app.state.journey} route={app.route} offers={app.offers} budget={app.state.budget} phase={app.phase} error={app.error}
            preferences={app.state.preferences} onPreferences={(preferences) => app.setState((s) => ({ ...s, preferences }))} saved={app.state.saved}
            onBudget={app.setBudget} onSetup={() => setOverlay('setup')} onRetry={retry} onMap={() => setOverlay('map')} onOpen={openOffer} onSave={app.toggleSaved} />
          : <LibraryScreen kind={tab} saved={app.state.saved} visits={app.state.visits} onOpen={setPlace} onSave={app.toggleSaved} onDiscover={() => setTab('home')}
            onRemoveVisit={(id) => app.setState((s) => ({ ...s, visits: s.visits.filter((v) => v.id !== id) }))} />}
      </View>
      {Platform.OS === 'web' ? <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => {}); }} style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors · ODbL</Text>
      </Pressable> : null}
      {!place && !offer && !overlay && app.ready ? <BottomTabBar selectedTab={tab} onSelect={setTab} /> : null}
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, app: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  content: { flex: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
  logo: { color: colors.forest, fontSize: 25, fontWeight: '800' }, language: { padding: 12, minHeight: 44 }, languageText: { color: colors.forest, fontWeight: '600' },
  attribution: { alignItems: 'center', padding: 8 }, attributionText: { fontSize: 10, color: colors.secondaryText },
  notice: { color: colors.accent, padding: 12, fontSize: 13 },
});
