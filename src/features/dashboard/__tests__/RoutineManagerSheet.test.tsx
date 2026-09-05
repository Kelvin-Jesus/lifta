import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { RoutineManagerSheet } from '../RoutineManagerSheet';
import { RoutineRepository } from '../../../storage/repositories/RoutineRepository';
import type { Routine } from '../../../domain/routine';
import { Effect } from 'effect';

describe('RoutineManagerSheet', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders routine list and handles creating a new routine', async () => {
    const mockRoutine: Routine = {
      id: 'routine-sheet-1',
      name: 'Ficha Hipertrofia',
      scheduledDays: ['monday', 'friday'],
      exercises: [
        {
          exerciseId: 'bench-press',
          targetSets: 4,
          suggestedRestSeconds: 90,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const onRoutinesUpdated = vi.fn();
    const onClose = vi.fn();

    render(
      () => (
        <RoutineManagerSheet
          isOpen={true}
          onClose={onClose}
          routines={[mockRoutine]}
          onRoutinesUpdated={onRoutinesUpdated}
        />
      ),
      container
    );

    expect(container.textContent).toContain('Gerenciar Rotinas');
    expect(container.textContent).toContain('Ficha Hipertrofia');

    // Click Nova Ficha
    const buttons = Array.from(container.querySelectorAll('button'));
    const newRoutineBtn = buttons.find((b) => b.textContent?.includes('Criar Nova Rotina') || b.textContent?.includes('Nova Ficha'));
    expect(newRoutineBtn).toBeDefined();
    newRoutineBtn?.click();

    await new Promise((r) => setTimeout(r, 40));

    // Name input
    const nameInput = container.querySelector('input[placeholder*="Ex: Treino A"]') as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    nameInput.value = 'Novo Treino Teste';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 40));

    // Select Monday
    const dayButtons = Array.from(container.querySelectorAll('button'));
    const segBtn = dayButtons.find((b) => b.textContent?.trim() === 'Seg');
    segBtn?.click();

    // Add exercise: Supino Reto com Barra
    const exBtn = container.querySelector('[data-testid="catalog-item-bench-press"]') as HTMLButtonElement;
    expect(exBtn).not.toBeNull();
    exBtn.click();

    await new Promise((r) => setTimeout(r, 40));

    // Save routine
    const saveBtn = container.querySelector('[data-testid="btn-save-routine"]') as HTMLButtonElement;
    expect(saveBtn).not.toBeNull();
    saveBtn.click();

    await new Promise((r) => setTimeout(r, 100));
    const all = await Effect.runPromise(RoutineRepository.listAll());
    expect(all.some((r) => r.name === 'Novo Treino Teste')).toBe(true);
    expect(onRoutinesUpdated).toHaveBeenCalled();
  });

  it('deletes an existing routine when delete button is clicked', async () => {
    const mockRoutine: Routine = {
      id: 'routine-to-remove',
      name: 'Ficha Para Remover',
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

    const onRoutinesUpdated = vi.fn();
    render(
      () => (
        <RoutineManagerSheet
          isOpen={true}
          onClose={vi.fn()}
          routines={[mockRoutine]}
          onRoutinesUpdated={onRoutinesUpdated}
        />
      ),
      container
    );

    const deleteBtn = container.querySelector('[data-testid="btn-delete-routine-routine-to-remove"]') as HTMLButtonElement;
    deleteBtn?.click();

    await new Promise((r) => setTimeout(r, 100));
    const all = await Effect.runPromise(RoutineRepository.listAll());
    expect(all.some((r) => r.id === 'routine-to-remove')).toBe(false);
    expect(onRoutinesUpdated).toHaveBeenCalled();
  });
});
