import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Linking, SafeAreaView, StyleSheet, View } from 'react-native';

import i18n from './src/i18n';
import { AlternativesScreen } from './src/screens/AlternativesScreen';
import { FeedbackScreen } from './src/screens/FeedbackScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MemoryScreen } from './src/screens/MemoryScreen';
import { SetupCommuteScreen } from './src/screens/SetupCommuteScreen';
import { SetupGoalScreen } from './src/screens/SetupGoalScreen';
import { alternativeMeals, featuredMeal, recentMeals, savedMeals } from './src/data/mockRecommendations';
import { BottomTabBar } from './src/components/BottomTabBar';
import type { AppScreen, CommutePreferences, MainTab } from './src/types';
import { colors } from './src/theme';
import { getCommuteRoute, getFallbackRoute } from './src/services/routeService';
import type { RouteData } from './src/types';

const initialCommute: CommutePreferences = {
  homeAddress: '123 Nguyễn Văn Linh, Quận 7',
  workAddress: '18 Nguyễn Đình Chiểu, Quận 3',
  mode: 'motorbike',
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('goal');
  const [selectedTab, setSelectedTab] = useState<MainTab>('home');
  const [commuteReturnScreen, setCommuteReturnScreen] = useState<'goal' | 'home'>('goal');
  const [commute, setCommute] = useState<CommutePreferences>(initialCommute);
  const [route, setRoute] = useState<RouteData>(() => getFallbackRoute(initialCommute));
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(true);
  const routeRequestRef = useRef(0);
  const [savedMealIds, setSavedMealIds] = useState<Set<string>>(
    () => new Set(savedMeals.map((meal) => meal.id)),
  );

  const saved = useMemo(
    () => [...savedMeals, featuredMeal].filter((meal) => savedMealIds.has(meal.id)),
    [savedMealIds],
  );

  const updateCommute = <Key extends keyof CommutePreferences>(
    key: Key,
    value: CommutePreferences[Key],
  ) => {
    setCommute((current) => ({ ...current, [key]: value }));
  };

  const selectTab = (tab: MainTab) => {
    setSelectedTab(tab);
    setScreen(tab);
  };

  const toggleSaved = (mealId: string) => {
    setSavedMealIds((current) => {
      const next = new Set(current);

      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }

      return next;
    });
  };

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.resolvedLanguage === 'vi' ? 'en' : 'vi');
  };

  const refreshRoute = async (nextCommute: CommutePreferences) => {
    const requestId = routeRequestRef.current + 1;
    routeRequestRef.current = requestId;
    setIsRouteLoading(true);
    setRouteError(null);

    try {
      const nextRoute = await getCommuteRoute(nextCommute);

      if (requestId !== routeRequestRef.current) {
        return;
      }

      setRoute(nextRoute);
    } catch (error) {
      if (requestId !== routeRequestRef.current) {
        return;
      }

      setRoute(getFallbackRoute(nextCommute));
      setRouteError(error instanceof Error ? error.message : 'Unable to update route.');
    } finally {
      if (requestId === routeRequestRef.current) {
        setIsRouteLoading(false);
      }
    }
  };

  useEffect(() => {
    void refreshRoute(initialCommute);
  }, []);

  if (screen === 'goal') {
    return (
      <SetupGoalScreen
        onContinue={() => {
          setCommuteReturnScreen('goal');
          setScreen('commute');
        }}
        onSkip={() => setScreen('home')}
      />
    );
  }

  if (screen === 'commute') {
    return (
      <SetupCommuteScreen
        onBack={() => setScreen(commuteReturnScreen)}
        onChange={updateCommute}
        onSave={async (nextCommute) => {
          setCommute(nextCommute);
          await refreshRoute(nextCommute);
          setScreen('home');
        }}
        preferences={commute}
        route={route}
        routeError={routeError}
        isSaving={isRouteLoading}
      />
    );
  }

  let content: ReactNode = null;

  switch (screen) {
    case 'home':
      content = (
        <HomeScreen
          commute={commute}
          featuredMeal={featuredMeal}
          isRouteLoading={isRouteLoading}
          onEditCommute={() => {
            setCommuteReturnScreen('home');
            setScreen('commute');
          }}
          onNavigate={() => {
            void Linking.openURL(
              `https://maps.apple.com/?daddr=${encodeURIComponent(commute.workAddress)}`,
            );
          }}
          onToggleLanguage={toggleLanguage}
          onTryAnother={() => setScreen('feedback')}
          route={route}
          routeError={routeError}
        />
      );
      break;
    case 'history':
      content = <MemoryScreen recentMeals={recentMeals} savedMeals={saved} segment="recent" />;
      break;
    case 'saved':
      content = <MemoryScreen recentMeals={recentMeals} savedMeals={saved} segment="saved" />;
      break;
    case 'alternatives':
      content = (
        <AlternativesScreen
          meals={alternativeMeals}
          onBack={() => setScreen('feedback')}
          onBackToPick={() => setScreen('home')}
        />
      );
      break;
    case 'feedback':
      content = (
        <FeedbackScreen
          onClose={() => setScreen('home')}
          onShowBetter={() => setScreen('alternatives')}
        />
      );
      break;
    default:
      content = null;
  }

  const showTabBar = screen === 'home' || screen === 'history' || screen === 'saved';

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.content}>{content}</View>
      {showTabBar ? <BottomTabBar selectedTab={selectedTab} onSelect={selectTab} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
