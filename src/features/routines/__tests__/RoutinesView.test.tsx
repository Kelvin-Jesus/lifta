import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { RoutinesView } from '../RoutinesView';
import { RoutineRepository } from '../../../storage/repositories/RoutineRepository';
import type { Routine } from '../../../domain/routine';
import { Effect } from 'effect';

describe('RoutinesView', () => {
  let container: HTMLDivElement;

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders header, add button, and routines list', async () => {
    const mockRoutine: Routine = {
      id: 'routine-test-1',
      name: 'Treino Teste A',
      scheduledDays: ['monday'],
      exercises: [
        {
          exerciseId: 'bench-press',
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          suggestedRestSeconds: 90,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await Effect.runPromise(RoutineRepository.save(mockRoutine));

    const onStartWorkout = vi.fn();
    render(() => <RoutinesView onStartWorkout={onStartWorkout} />, container);

    expect(container.textContent).toContain('Minhas Fichas');
    expect(container.querySelector('[data-testid="btn-add-routine-view"]')).not.toBeNull();

    await new Promise((r) => setTimeout(r, 60));
    expect(container.textContent).toContain('Treino Teste A');
    expect(container.textContent).toContain('Seg');
    expect(container.textContent).toContain('1 exercícios');

    // Start workout
    const startBtn = container.querySelector('[data-testid="btn-start-routine-routine-test-1"]') as HTMLButtonElement;
    startBtn.click();
    expect(onStartWorkout).toHaveBeenCalledWith(expect.objectContaining({ id: 'routine-test-1' }));
  });

  it('opens routine manager sheet when Nova Ficha button is clicked', async () => {
    render(() => <RoutinesView onStartWorkout={vi.fn()} />, container);

    const addBtn = container.querySelector('[data-testid="btn-add-routine-view"]') as HTMLButtonElement;
    addBtn.click();

    await new Promise((r) => setTimeout(r, 40));
    expect(container.querySelector('[data-testid="routine-manager-sheet"]')).not.toBeNull();
  });

  it('deletes a routine when delete button is clicked', async () => {
    const mockRoutine: Routine = {
      id: 'routine-to-delete',
      name: 'Treino Para Deletar',
      exercises: [
        {
          exerciseId: 'bench-press',
          targetSets: 3,
          suggestedRestSeconds: 60,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await Effect.runPromise(RoutineRepository.save(mockRoutine));

    render(() => <RoutinesView onStartWorkout={vi.fn()} />, container);

    await new Promise((r) => setTimeout(r, 60));
    expect(container.textContent).toContain('Treino Para Deletar');

    const deleteBtn = container.querySelector('[data-testid="btn-delete-card-routine-to-delete"]') as HTMLButtonElement;
    deleteBtn.click();

    await new Promise((r) => setTimeout(r, 60));
    expect(container.textContent).not.toContain('Treino Para Deletar');
  });
});
