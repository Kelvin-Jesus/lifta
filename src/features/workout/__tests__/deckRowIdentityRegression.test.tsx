import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { WorkoutDeck } from '../WorkoutDeck';
import { activeWorkoutStore } from '../activeWorkoutStore';
import type { Routine } from '../../../domain/routine';

const routine: Routine = {
  id: 'routine-identity',
  name: 'Treino Identidade',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  exercises: [
    { exerciseId: 'bench-press', targetSets: 3, suggestedRestSeconds: 90 },
    { exerciseId: 'tricep-rope-pushdown', targetSets: 3, suggestedRestSeconds: 60 },
    { exerciseId: 'incline-dumbbell-press', targetSets: 3, suggestedRestSeconds: 90 },
  ],
};

describe('WorkoutDeck DOM identity regression', () => {
  beforeEach(async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(routine);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('[REGRESSION] keeps deck pages and set rows alive when a set is edited', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const pageBefore = container.querySelector('[data-testid="deck-page-0"]');
    const rowBefore = container.querySelector('[data-testid="set-row-0"]');
    const anatomyBefore = container.querySelector('[data-testid="muscle-focus-card"]');
    expect(pageBefore).not.toBeNull();
    expect(rowBefore).not.toBeNull();

    await activeWorkoutStore.adjustWeight(0, 0, 2.5);

    // Re-creating every page on each store write rebuilt N anatomy SVGs and
    // gif cards per tap, and silently reset per-card UI state.
    expect(container.querySelector('[data-testid="deck-page-0"]')).toBe(pageBefore);
    expect(container.querySelector('[data-testid="set-row-0"]')).toBe(rowBefore);
    expect(container.querySelector('[data-testid="muscle-focus-card"]')).toBe(anatomyBefore);
  });

  it('[REGRESSION] still reflects edited values and completion state in place', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const weightDisplay = container.querySelector('[data-testid="weight-display-0"]') as HTMLElement;
    const before = weightDisplay.textContent;

    await activeWorkoutStore.adjustWeight(0, 0, 2.5);
    expect(weightDisplay.textContent).not.toBe(before);

    await activeWorkoutStore.adjustReps(0, 0, 1);
    await activeWorkoutStore.completeSet(0, 0);

    expect(activeWorkoutStore.session()?.exercises[0].sets[0].completed).toBe(true);
    expect(container.querySelector('[data-testid="set-row-0"]')).not.toBeNull();
  });

  it('[REGRESSION] adds and removes set rows without rebuilding the page', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const page = container.querySelector('[data-testid="deck-page-0"]') as HTMLElement;
    const rowsBefore = page.querySelectorAll('[data-testid^="set-row-"]').length;

    await activeWorkoutStore.addSet(0);
    expect(page.querySelectorAll('[data-testid^="set-row-"]').length).toBe(rowsBefore + 1);
    expect(container.querySelector('[data-testid="deck-page-0"]')).toBe(page);

    await activeWorkoutStore.removeSet(0, rowsBefore);
    expect(page.querySelectorAll('[data-testid^="set-row-"]').length).toBe(rowsBefore);
    expect(container.querySelector('[data-testid="deck-page-0"]')).toBe(page);
  });
});
