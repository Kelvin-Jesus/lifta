import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { MuscleFocusCard } from '../MuscleFocusCard';
import { ExerciseCard } from '../ExerciseCard';
import { ExerciseGifModal } from '../ExerciseGifModal';
import { activeWorkoutStore } from '../activeWorkoutStore';
import type { LoggedExercise } from '../../../domain/session';
import type { Routine } from '../../../domain/routine';

const sampleRoutine: Routine = {
  id: 'routine-bench',
  name: 'Treino A',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  exercises: [
    {
      exerciseId: 'bench-press',
      targetSets: 3,
      suggestedRestSeconds: 90,
    },
  ],
};

const sampleLoggedExercise: LoggedExercise = {
  exerciseId: 'bench-press',
  exerciseName: 'Supino Reto com Barra',
  sets: [
    {
      type: 'resistance',
      kind: 'normal',
      weightKg: 80,
      reps: 10,
      completed: false,
    },
  ],
};

describe('Exercise GIF Rounded Corners and Expand Modal Regression Suite', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);
  });

  it('[REGRESSION] MuscleFocusCard renders execution GIF with rounded-2xl container, rounded-xl image and Ampliar badge', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <MuscleFocusCard exerciseId="bench-press" />, container);

    const thumbnail = container.querySelector('[data-testid="exercise-gif-thumbnail"]') as HTMLElement;
    expect(thumbnail).not.toBeNull();

    // Must have rounded-2xl matching the design system
    expect(thumbnail.classList.contains('rounded-2xl')).toBe(true);
    expect(thumbnail.classList.contains('overflow-hidden')).toBe(true);

    const img = thumbnail.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.classList.contains('rounded-xl')).toBe(true);

    // Visual expand affordance badge
    const badge = container.querySelector('[data-testid="gif-expand-badge"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('Ampliar');
  });

  it('[REGRESSION] Clicking execution GIF thumbnail opens high-fidelity ExerciseGifModal with expanded view', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <MuscleFocusCard exerciseId="bench-press" />, container);

    expect(container.querySelector('[data-testid="exercise-gif-modal"]')).toBeNull();

    const thumbnail = container.querySelector('[data-testid="exercise-gif-thumbnail"]') as HTMLElement;
    thumbnail.click();

    // Modal must now be open
    const modal = container.querySelector('[data-testid="exercise-gif-modal"]') as HTMLElement;
    expect(modal).not.toBeNull();

    const modalCard = container.querySelector('[data-testid="gif-modal-card"]') as HTMLElement;
    expect(modalCard).not.toBeNull();
    expect(modalCard.classList.contains('rounded-3xl')).toBe(true);

    const expandedGif = container.querySelector('[data-testid="expanded-exercise-gif"]') as HTMLImageElement;
    expect(expandedGif).not.toBeNull();
    expect(expandedGif.src).toContain('.gif');
    expect(expandedGif.classList.contains('rounded-xl')).toBe(true);

    const containerGif = container.querySelector('[data-testid="expanded-gif-container"]') as HTMLElement;
    expect(containerGif.classList.contains('rounded-2xl')).toBe(true);
  });

  it('[REGRESSION] ExerciseGifModal can be dismissed via close button, bottom button, and Escape key', async () => {
    const onClose = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <ExerciseGifModal
          isOpen={true}
          onClose={onClose}
          gifUrl="/assets/exercises/bench-press.gif"
          exerciseName="Supino Reto"
          primaryMuscles={['chest']}
        />
      ),
      container
    );

    // 1. Close via top close button
    const closeBtn = container.querySelector('[data-testid="btn-close-gif-modal"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(onClose).toHaveBeenCalledTimes(1);

    // 2. Close via bottom dismiss button
    const dismissBtn = container.querySelector('[data-testid="btn-dismiss-gif-modal"]') as HTMLButtonElement;
    expect(dismissBtn).not.toBeNull();
    dismissBtn.click();
    expect(onClose).toHaveBeenCalledTimes(2);

    // 3. Close via Escape key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(3);

    // 4. Close via backdrop click
    const backdrop = container.querySelector('[data-testid="exercise-gif-modal"]') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it('[REGRESSION] ExerciseCard collapsible anatomy view has rounded-2xl GIF container and triggers expand modal', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <ExerciseCard
          exerciseIndex={0}
          exercise={sampleLoggedExercise}
          totalExercises={1}
          onToggleCompleteSet={() => {}}
          onAdjustWeight={() => {}}
          onSetWeight={() => {}}
          onAdjustReps={() => {}}
          onSetReps={() => {}}
          onCycleKind={() => {}}
          onAddSet={() => {}}
          onRemoveSet={() => {}}
        />
      ),
      container
    );

    // Toggle open anatomy view
    const toggleBtn = container.querySelector('[data-testid="btn-toggle-anatomy"]') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();
    toggleBtn.click();

    const gifPreview = container.querySelector('[data-testid="exercise-card-gif-preview"]') as HTMLElement;
    expect(gifPreview).not.toBeNull();
    expect(gifPreview.classList.contains('rounded-2xl')).toBe(true);

    const img = gifPreview.querySelector('img') as HTMLImageElement;
    expect(img.classList.contains('rounded-xl')).toBe(true);

    // Clicking preview opens modal
    gifPreview.click();
    expect(container.querySelector('[data-testid="exercise-gif-modal"]')).not.toBeNull();
  });
});
