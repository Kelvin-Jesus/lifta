import 'fake-indexeddb/auto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { BottomSheet } from '../../../components/BottomSheet';
import { MuscleFocusCard } from '../MuscleFocusCard';
import { SubstituteExerciseSheet } from '../SubstituteExerciseSheet';
import { WorkoutDeck } from '../WorkoutDeck';
import { activeWorkoutStore } from '../activeWorkoutStore';
import type { Routine } from '../../../domain/routine';

describe('Exercise Carousel, Muscle Focus Card and Fluid Bottom Sheet', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const sampleRoutine: Routine = {
    id: 'routine-chest-arms',
    name: 'Treino A - Peitoral e Tríceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'bench-press',
        targetSets: 3,
        suggestedRestSeconds: 90,
      },
      {
        exerciseId: 'tricep-rope-pushdown',
        targetSets: 3,
        suggestedRestSeconds: 60,
      },
    ],
  };

  it('renders BottomSheet and handles close via backdrop and Esc key', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onClose = vi.fn();

    render(
      () => (
        <BottomSheet isOpen={true} onClose={onClose} title="Teste Sheet">
          <div data-testid="sheet-child">Conteúdo Interno</div>
        </BottomSheet>
      ),
      container
    );

    expect(container.querySelector('[data-testid="bottom-sheet"]')).not.toBeNull();
    expect(container.textContent).toContain('Conteúdo Interno');

    // Click backdrop
    const backdrop = container.querySelector('[data-testid="sheet-backdrop"]') as HTMLElement;
    backdrop.click();
    expect(onClose).toHaveBeenCalledTimes(1);

    // Press Escape key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('handles grabber gesture interactions in BottomSheet', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onClose = vi.fn();

    render(
      () => (
        <BottomSheet isOpen={true} onClose={onClose}>
          <div>Conteúdo</div>
        </BottomSheet>
      ),
      container
    );

    const grabber = container.querySelector('[data-testid="sheet-grabber"]') as HTMLElement;
    expect(grabber).not.toBeNull();

    // Mock setPointerCapture / releasePointerCapture
    grabber.setPointerCapture = vi.fn();
    grabber.releasePointerCapture = vi.fn();

    // Simulate drag start
    grabber.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientY: 100, bubbles: true })
    );
    expect(grabber.setPointerCapture).toHaveBeenCalledWith(1);

    // Simulate drag down (flick)
    grabber.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientY: 350, bubbles: true })
    );

    // Simulate pointer release
    grabber.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 1, clientY: 350, bubbles: true })
    );
    expect(grabber.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('renders MuscleFocusCard with anatomy thumbnail and triggers substitute', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onSubstitute = vi.fn();

    render(
      () => (
        <MuscleFocusCard
          exerciseId="bench-press"
          onOpenSubstitute={onSubstitute}
        />
      ),
      container
    );

    expect(container.textContent).toContain('chest');

    const substituteBtn = container.querySelector('[data-testid="btn-substitute-trigger"]') as HTMLButtonElement;
    expect(substituteBtn).not.toBeNull();
    substituteBtn.click();
    expect(onSubstitute).toHaveBeenCalledTimes(1);
  });

  it('renders SubstituteExerciseSheet and selects alternative exercise', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      () => (
        <SubstituteExerciseSheet
          isOpen={true}
          onClose={onClose}
          currentExerciseId="bench-press"
          onSelectSubstitute={onSelect}
        />
      ),
      container
    );

    expect(container.textContent).toContain('Substituir Aparelho Ocupado');

    // Should list alternatives for chest
    const substituteCandidate = container.querySelector(
      '[data-testid="substitute-item-incline-dumbbell-press"]'
    ) as HTMLButtonElement;

    expect(substituteCandidate).not.toBeNull();
    substituteCandidate.click();

    expect(onSelect).toHaveBeenCalledWith('incline-dumbbell-press');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders WorkoutDeck with 100dvh snap-mandatory carousel and progress segments', async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    expect(container.querySelector('[data-testid="workout-deck"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="deck-carousel"]')).not.toBeNull();

    // Segmented progress bar should have 2 segments
    const segment0 = container.querySelector('[data-testid="progress-segment-0"]');
    const segment1 = container.querySelector('[data-testid="progress-segment-1"]');
    expect(segment0).not.toBeNull();
    expect(segment1).not.toBeNull();

    // Progressive overload target banner should be visible
    expect(container.textContent).toContain('Sobrecarga Progressiva');
  });
});
