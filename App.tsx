import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { TabBar } from './src/components/TabBar';
import { getMockRecommendations } from './src/data/mockRecommendations';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RouteScreen } from './src/screens/RouteScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { AppTab, Meal, RoutePreferences } from './src/types';

const initialPreferences: RoutePreferences = {
  origin: '',
  destination: '',
  budget: 'any',
  mood: '',
};

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [selectedTab, setSelectedTab] = useState<AppTab>('discover');
  const [routePreferences, setRoutePreferences] = useState(initialPreferences);
  const [recommendations, setRecommendations] = useState(() =>
    getMockRecommendations(initialPreferences),
  );
  const [savedMealIds, setSavedMealIds] = useState<Set<string>>(new Set());

  const savedMeals = useMemo(
    () => recommendations.filter((meal) => savedMealIds.has(meal.id)),
    [recommendations, savedMealIds],
  );

  const updatePreference = <Key extends keyof RoutePreferences>(
    key: Key,
    value: RoutePreferences[Key],
  ) => {
    setRoutePreferences((current) => ({ ...current, [key]: value }));
  };

  const toggleSaved = (meal: Meal) => {
    setSavedMealIds((current) => {
      const next = new Set(current);

      if (next.has(meal.id)) {
        next.delete(meal.id);
      } else {
        next.add(meal.id);
      }

      return next;
    });
  };

  const refreshRecommendations = () => {
    setRecommendations(getMockRecommendations(routePreferences));
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onContinue={() => setHasCompletedOnboarding(true)} />;
  }

  const content = {
    discover: (
      <DiscoverScreen
        preferences={routePreferences}
        recommendations={recommendations}
        savedMealIds={savedMealIds}
        onOpenRoute={() => setSelectedTab('route')}
        onRefresh={refreshRecommendations}
        onToggleSaved={toggleSaved}
      />
    ),
    route: (
      <RouteScreen
        preferences={routePreferences}
        onApply={refreshRecommendations}
        onChange={updatePreference}
      />
    ),
    saved: <SavedScreen meals={savedMeals} onToggleSaved={toggleSaved} />,
    profile: <ProfileScreen />,
  }[selectedTab];

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.content}>{content}</View>
      <TabBar selectedTab={selectedTab} onSelect={setSelectedTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  content: {
    flex: 1,
  },
});
