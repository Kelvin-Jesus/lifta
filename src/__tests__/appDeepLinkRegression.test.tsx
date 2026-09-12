import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { App, readInitialLocation } from '../App';
import { activeWorkoutStore } from '../features/workout/activeWorkoutStore';
import type { Routine } from '../domain/routine';

const routine: Routine = {
  id: 'routine-deeplink',
  name: 'Treino Deep Link',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  exercises: [
    { exerciseId: 'bench-press', targetSets: 2, suggestedRestSeconds: 90 },
    { exerciseId: 'tricep-rope-pushdown', targetSets: 2, suggestedRestSeconds: 60 },
  ],
};

const flush = () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, 60);
  return promise;
};

/** App startup seeds IndexedDB before it can resume a workout. */
const waitFor = async (predicate: () => boolean, timeoutMs = 3000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await flush();
  }
  return predicate();
};

describe('Deep-linked screens', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
  });

  it('maps supported query params to the initial tab and screen', () => {
    expect(readInitialLocation('')).toEqual({ tab: 'train', screen: 'tabs' });
    expect(readInitialLocation('?tab=history')).toEqual({ tab: 'history', screen: 'tabs' });
    expect(readInitialLocation('?tab=exercises')).toEqual({ tab: 'exercises', screen: 'tabs' });
    expect(readInitialLocation('?screen=workout')).toEqual({ tab: 'train', screen: 'workout' });
  });

  it('ignores unknown tabs and screens instead of rendering an empty shell', () => {
    expect(readInitialLocation('?tab=bogus')).toEqual({ tab: 'train', screen: 'tabs' });
    expect(readInitialLocation('?screen=bogus')).toEqual({ tab: 'train', screen: 'tabs' });
    expect(readInitialLocation('?tab=history&screen=workout')).toEqual({
      tab: 'history',
      screen: 'workout',
    });
  });

  it('opens the requested tab on load', async () => {
    window.history.replaceState({}, '', '/?tab=history');
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <App />, container);
    await flush();

    expect(container.querySelector('[data-testid="history-view"], .tab-content')).not.toBeNull();
    expect(container.querySelector('[data-testid="home-dashboard"]')).toBeNull();
  });

  it('resumes an active workout when deep-linked to the workout screen', async () => {
    await activeWorkoutStore.startWorkout(routine);
    window.history.replaceState({}, '', '/?screen=workout');

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <App />, container);
    await waitFor(() => container.querySelector('[data-testid="workout-deck"]') !== null);

    expect(container.querySelector('[data-testid="workout-deck"]')).not.toBeNull();
  });

  it('falls back to the dashboard when no workout is active', async () => {
    window.history.replaceState({}, '', '/?screen=workout');
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <App />, container);
    await waitFor(() => container.querySelector('[data-testid="home-dashboard"]') !== null);

    expect(container.querySelector('[data-testid="workout-deck"]')).toBeNull();
    expect(container.querySelector('[data-testid="home-dashboard"]')).not.toBeNull();
  });
});
