import assert from 'node:assert/strict';
import { parseStoredState } from '../src/services/validation';

const state = {
  version: 2,
  journey: null,
  preferences: { vegetarianOnly: false, hideVisited: false },
  budget: { maxVndPerPerson: 50000, dishQuery: '' },
  reports: [],
  saved: [],
  visits: [],
  language: 'en',
};

assert.equal(parseStoredState(JSON.stringify(state)).hasSeenOnboarding, true);
assert.equal(parseStoredState(JSON.stringify({ ...state, hasSeenOnboarding: false })).hasSeenOnboarding, false);
assert.equal(parseStoredState(JSON.stringify({ ...state, version: 1 })).hasSeenOnboarding, true);
assert.throws(() => parseStoredState(JSON.stringify({ ...state, hasSeenOnboarding: 'no' })));
