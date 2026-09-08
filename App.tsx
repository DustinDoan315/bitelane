import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { useBiteLane } from './src/hooks/useBiteLane';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { JourneySetupScreen } from './src/screens/JourneySetupScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlaceDetailsScreen } from './src/screens/PlaceDetailsScreen';
import { RouteMapScreen } from './src/screens/RouteMapScreen';
import type { MainTab, Place } from './src/types';
import { colors } from './src/theme';

export default function App() {
  const app = useBiteLane();
  const { t } = useTranslation();
  const [tab, setTab] = useState<MainTab>('home');
  const [overlay, setOverlay] = useState<'setup' | 'map' | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (place) { setPlace(null); return true; }
      if (overlay) { setOverlay(null); return true; }
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [place, overlay, tab]);
  const retry = () => { if (app.state.journey) void app.refresh(app.state.journey); };
  const saved = (target: Place) => app.state.saved.some((p) => p.id === target.id);
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
          : place ? <PlaceDetailsScreen key={place.id} place={place} journey={app.state.journey} baseRoute={app.route} saved={saved(place)} onSave={() => app.toggleSaved(place)} onVisit={() => app.recordVisit(place)} onBack={() => setPlace(null)} />
          : overlay === 'setup' ? <JourneySetupScreen journey={app.state.journey} onBack={() => setOverlay(null)} onSave={(journey) => { app.setState((s) => ({ ...s, journey })); setOverlay(null); setTab('home'); }} />
          : overlay === 'map' && app.state.journey ? <RouteMapScreen journey={app.state.journey} places={app.visible.slice(0, 30).map((c) => c.place)} route={app.route} error={app.error} isLoading={app.phase !== 'idle'} onBack={() => setOverlay(null)} onRetry={retry} />
          : tab === 'home' ? <DiscoverScreen journey={app.state.journey} route={app.route} candidates={app.visible} phase={app.phase} error={app.error}
            preferences={app.state.preferences} onPreferences={(preferences) => app.setState((s) => ({ ...s, preferences }))} saved={app.state.saved}
            onSetup={() => setOverlay('setup')} onRetry={retry} onMap={() => setOverlay('map')} onOpen={setPlace} onSave={app.toggleSaved} />
          : <LibraryScreen kind={tab} saved={app.state.saved} visits={app.state.visits} onOpen={setPlace} onSave={app.toggleSaved} onDiscover={() => setTab('home')}
            onRemoveVisit={(id) => app.setState((s) => ({ ...s, visits: s.visits.filter((v) => v.id !== id) }))} />}
      </View>
      <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => {}); }} style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors · ODbL</Text>
      </Pressable>
      {!place && !overlay && app.ready ? <BottomTabBar selectedTab={tab} onSelect={setTab} /> : null}
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
