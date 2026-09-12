import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { Effect } from 'effect';
import { RoutinesView } from '../RoutinesView';
import { HomeDashboard } from '../../dashboard/HomeDashboard';
import { RoutineManagerSheet } from '../../dashboard/RoutineManagerSheet';
import { RoutineRepository } from '../../../storage/repositories/RoutineRepository';
import type { Routine } from '../../../domain/routine';

const routine: Routine = {
  id: 'routine-preview-1',
  name: 'Treino Preview',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scheduledDays: ['monday'],
  exercises: [
    { exerciseId: 'bench-press', targetSets: 3, suggestedRestSeconds: 90 },
    { exerciseId: 'tricep-rope-pushdown', targetSets: 3, suggestedRestSeconds: 60 },
  ],
};

const settle = (ms = 80) => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

describe('Starting a workout is always explicit', () => {
  let container: HTMLDivElement;

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
    await Effect.runPromise(RoutineRepository.save(routine));
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = '';
  });

  it('[REGRESSION] previews the routine instead of starting it when a row is tapped', async () => {
    const onStartWorkout = vi.fn();
    render(() => <RoutinesView onStartWorkout={onStartWorkout} />, container);
    await settle();

    const row = container.querySelector(
      '[data-testid="routine-card-routine-preview-1"] .row-title'
    ) as HTMLElement;
    row.click();
    await settle();

    const preview = document.querySelector('[data-testid="routine-preview-sheet"]');
    expect(preview).not.toBeNull();
    expect(onStartWorkout).not.toHaveBeenCalled();

    // The preview lists what the routine contains before committing to it.
    expect(preview!.textContent).toContain('Supino Reto com Barra');
    expect(preview!.textContent).toContain('2 exercícios');
  });

  it('[REGRESSION] starts only from the explicit action inside the preview', async () => {
    const onStartWorkout = vi.fn();
    render(() => <RoutinesView onStartWorkout={onStartWorkout} />, container);
    await settle();

    (
      container.querySelector('[data-testid="routine-card-routine-preview-1"] .row-title') as HTMLElement
    ).click();
    await settle();

    const startBtn = document.querySelector(
      '[data-testid="btn-preview-start-workout"]'
    ) as HTMLButtonElement;
    startBtn.click();
    await settle();

    expect(onStartWorkout).toHaveBeenCalledWith(expect.objectContaining({ id: 'routine-preview-1' }));
    // Sheet closes so the deck is not rendered behind an open modal.
    expect(document.querySelector('[data-testid="routine-preview-sheet"]')).toBeNull();
  });

  it('[REGRESSION] dashboard quick-access rows preview rather than start', async () => {
    const onStartWorkout = vi.fn();
    render(() => <HomeDashboard onStartWorkout={onStartWorkout} />, container);
    await settle(150);

    const rows = container.querySelectorAll('[data-testid^="other-routine-"]');
    if (rows.length === 0) return; // suggested routine is the only one on screen
    (rows[0] as HTMLElement).click();
    await settle();

    expect(onStartWorkout).not.toHaveBeenCalled();
    expect(document.querySelector('[data-testid="routine-preview-sheet"]')).not.toBeNull();
  });
});

describe('RoutineManagerSheet row taps', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = '';
  });

  it('[REGRESSION] expands an exercise preview and never deletes on a row tap', async () => {
    await Effect.runPromise(RoutineRepository.save(routine));
    const onRoutinesUpdated = vi.fn();

    render(
      () => (
        <RoutineManagerSheet
          isOpen={true}
          onClose={vi.fn()}
          routines={[routine]}
          onRoutinesUpdated={onRoutinesUpdated}
        />
      ),
      container
    );

    expect(
      container.querySelector('[data-testid="routine-preview-routine-preview-1"]')
    ).toBeNull();

    (
      container.querySelector('[data-testid="btn-preview-routine-routine-preview-1"]') as HTMLElement
    ).click();
    await settle(40);

    const list = container.querySelector('[data-testid="routine-preview-routine-preview-1"]');
    expect(list).not.toBeNull();
    expect(list!.textContent).toContain('Supino Reto com Barra');
    expect(onRoutinesUpdated).not.toHaveBeenCalled();
    expect(await Effect.runPromise(RoutineRepository.listAll())).toHaveLength(1);
  });
});
