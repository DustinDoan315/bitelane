import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import i18n from '../i18n';
import type { BudgetSettings, Candidate, Journey, Place, RouteData, StoredState } from '../types';
import { findPlaces } from '../services/placeService';
import { findFoodOffers } from '../services/menuService';
import { getCommuteRoute } from '../services/routeService';
import { parseStoredState } from '../services/validation';

const STORAGE_KEY = 'bitelane:v1';
const initialState = (): StoredState => ({
  version: 2, journey: null, preferences: { vegetarianOnly: false, hideVisited: false },
  budget: { maxVndPerPerson: 50000, dishQuery: '' }, reports: [], saved: [], visits: [],
  language: i18n.resolvedLanguage === 'vi' ? 'vi' : 'en',
});

export function useBiteLane() {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [phase, setPhase] = useState<'idle' | 'route' | 'places'>('idle');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const writeQueue = useRef(Promise.resolve());
  const canPersist = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      if (raw) setState(parseStoredState(raw));
      canPersist.current = true;
    }).catch(() => { if (!cancelled) setStorageError(true); })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; requestId.current++; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void i18n.changeLanguage(state.language);
    if (!canPersist.current) return; // Preserve unreadable storage rather than silently replacing it.
    const snapshot = JSON.stringify(state);
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot))
      .then(() => setStorageError(false)).catch(() => setStorageError(true));
  }, [ready, state]);

  const refresh = useCallback(async (journey: Journey) => {
    const id = ++requestId.current;
    setError(null); setRoute(null); setCandidates([]); setPhase('route');
    try {
      const nextRoute = await getCommuteRoute(journey);
      if (id !== requestId.current) return;
      setRoute(nextRoute); setPhase('places');
      const results = await findPlaces(nextRoute);
      if (id === requestId.current) setCandidates(results);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : 'serviceUnavailable');
    } finally {
      if (id === requestId.current) setPhase('idle');
    }
  }, []);

  useEffect(() => {
    if (ready && state.journey) void refresh(state.journey);
  }, [ready, state.journey, refresh]);

  const visible = useMemo(() => {
    const visited = new Set(state.visits.map((v) => v.place.id));
    return candidates.filter(({ place }) => (!state.preferences.vegetarianOnly || place.vegetarian)
      && (!state.preferences.hideVisited || !visited.has(place.id)));
  }, [candidates, state.preferences, state.visits]);
  const offers = useMemo(() => findFoodOffers(visible, state.reports, state.budget), [visible, state.reports, state.budget]);

  const toggleSaved = (place: Place) => setState((current) => ({ ...current,
    saved: current.saved.some((p) => p.id === place.id) ? current.saved.filter((p) => p.id !== place.id) : [place, ...current.saved],
  }));
  const recordVisit = (place: Place) => setState((current) => {
    // Repeated taps should not create duplicate visits; a later visit is still possible.
    const latest = current.visits.find((v) => v.place.id === place.id);
    if (latest && Date.now() - Date.parse(latest.visitedAt) < 60000) return current;
    const visitedAt = new Date().toISOString();
    return { ...current, visits: [{ id: `${place.id}/${visitedAt}`, place, visitedAt }, ...current.visits] };
  });
  const addMenuReport = (place: Place, itemName: string, priceVnd: number) => setState((current) => ({
    ...current,
    reports: [{ id: `${place.id}/${Date.now()}`, placeId: place.id, itemName: itemName.trim(), priceVnd, reportedAt: new Date().toISOString(), source: 'user_report' }, ...current.reports],
  }));

  const setBudget = (budget: BudgetSettings) => setState((current) => ({ ...current, budget }));
  return { state, setState, ready, storageError, route, visible, offers, phase, error, refresh, toggleSaved, recordVisit, addMenuReport, setBudget };
}
