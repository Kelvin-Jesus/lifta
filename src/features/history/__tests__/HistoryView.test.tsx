import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { HistoryView } from '../HistoryView';
import { WorkoutSessionRepository } from '../../../storage/repositories/WorkoutSessionRepository';
import type { WorkoutSession } from '../../../domain/session';
import { Effect } from 'effect';

describe('HistoryView', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders empty state when there are no completed sessions', async () => {
    render(() => <HistoryView />, container);

    expect(container.textContent).toContain('Histórico');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('Nenhum treino concluído ainda.');
  });

  it('renders summary cards and session cards when sessions exist', async () => {
    const mockSession: WorkoutSession = {
      id: 'session-hist-1',
      routineId: 'routine-a',
      routineName: 'Treino A — Peito e Tríceps',
      startedAt: '2026-09-01T10:00:00.000Z',
      endedAt: '2026-09-01T10:45:00.000Z',
      durationMinutes: 45,
      estimatedCalories: 320,
      totalVolumeKg: 800,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Supino Reto com Barra',
          sets: [
            {
              type: 'resistance',
              kind: 'normal',
              weightKg: 80,
              reps: 10,
              completed: true,
            },
          ],
        },
      ],
    };

    await Effect.runPromise(WorkoutSessionRepository.save(mockSession));

    render(() => <HistoryView />, container);

    await new Promise((r) => setTimeout(r, 60));
    expect(container.textContent).toContain('Treino A — Peito e Tríceps');
    expect(container.textContent).toContain('320 kcal');
    expect(container.textContent).toContain('45 min');
  });
});
