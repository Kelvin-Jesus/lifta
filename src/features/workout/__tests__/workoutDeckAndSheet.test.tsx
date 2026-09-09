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
      {
        exerciseId: 'incline-dumbbell-press',
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

    expect(container.textContent).toContain('Peitoral');

    const substituteBtn = container.querySelector('[data-testid="btn-substitute-trigger"]') as HTMLButtonElement;
    expect(substituteBtn).not.toBeNull();
    substituteBtn.click();
    expect(onSubstitute).toHaveBeenCalledTimes(1);
  });

  it('prioritizes execution GIF by default and allows 1-tap toggle to muscle anatomy', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => <MuscleFocusCard exerciseId="bench-press" />,
      container
    );

    // Default view: Execution GIF
    expect(container.textContent).toContain('Demonstração do Movimento');
    expect(container.textContent).toContain('Peitoral');
    const gifThumbnail = container.querySelector('[data-testid="exercise-gif-thumbnail"]') as HTMLElement;
    expect(gifThumbnail).not.toBeNull();
    const gifImg = gifThumbnail.querySelector('img') as HTMLImageElement;
    expect(gifImg).not.toBeNull();
    expect(gifImg.src).toContain('.gif');

    // Switch to Muscles Anatomy
    const toggleMusclesBtn = container.querySelector('[data-testid="btn-media-toggle-muscles"]') as HTMLButtonElement;
    expect(toggleMusclesBtn).not.toBeNull();
    toggleMusclesBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    expect(container.textContent).toContain('Foco Muscular');
    const anatomyThumbnail = container.querySelector('[data-testid="exercise-anatomy-thumbnail"]') as HTMLElement;
    expect(anatomyThumbnail).not.toBeNull();

    // Switch back to Execution GIF
    const toggleExecutionBtn = container.querySelector('[data-testid="btn-media-toggle-execution"]') as HTMLButtonElement;
    expect(toggleExecutionBtn).not.toBeNull();
    toggleExecutionBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    expect(container.textContent).toContain('Demonstração do Movimento');
    expect(container.querySelector('[data-testid="exercise-gif-thumbnail"]')).not.toBeNull();
  });

  it('opens full exercise details bottom sheet with looping GIF, instructions, and full anatomy', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => <MuscleFocusCard exerciseId="bench-press" />,
      container
    );

    // Click details button to open bottom sheet
    const detailsBtn = container.querySelector('[data-testid="btn-open-exercise-details"]') as HTMLButtonElement;
    expect(detailsBtn).not.toBeNull();
    detailsBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    // Verify sheet content
    expect(container.querySelector('[data-testid="sheet-execution-gif"]')).not.toBeNull();
    expect(container.textContent).toContain('Instruções de Postura e Execução');
    expect(container.textContent).toContain('Músculos Primários (100% ativação)');
    expect(container.textContent).toContain('Músculos Sinergistas (42% ativação)');
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

    // Segmented progress bar should have 3 segments
    const segment0 = container.querySelector('[data-testid="progress-segment-0"]');
    const segment1 = container.querySelector('[data-testid="progress-segment-1"]');
    const segment2 = container.querySelector('[data-testid="progress-segment-2"]');
    expect(segment0).not.toBeNull();
    expect(segment1).not.toBeNull();
    expect(segment2).not.toBeNull();

    // Progressive overload target banner should be visible
    expect(container.textContent).toContain('Sobrecarga Progressiva');
  });

  it('renders native snap-mandatory container and confirms absence of artificial carousel buttons', async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const carousel = container.querySelector('[data-testid="deck-carousel"]') as HTMLElement;
    expect(carousel).not.toBeNull();
    expect(carousel.className).toContain('overflow-x-auto');
    expect(carousel.className).toContain('snap-x');
    expect(carousel.className).toContain('snap-mandatory');

    // Regression check: artificial floating carousel buttons must NOT exist
    expect(container.querySelector('[data-testid="btn-deck-prev"]')).toBeNull();
    expect(container.querySelector('[data-testid="btn-deck-next"]')).toBeNull();

    // Pages must be direct snap-center children
    const page0 = container.querySelector('[data-testid="deck-page-0"]') as HTMLElement;
    expect(page0).not.toBeNull();
    expect(page0.className).toContain('snap-center');
    expect(page0.className).toContain('min-w-full');
  });

  it('navigates exercises via keyboard arrows and segmented progress bar', async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // ArrowRight navigates to next
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);

    // ArrowRight again navigates to 2
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);

    // At last exercise, ArrowRight doesn't go out of bounds
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);

    // ArrowLeft navigates back to 1
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);

    // Segment progress button navigates directly
    const segment0 = container.querySelector('[data-testid="progress-segment-0"]') as HTMLButtonElement;
    segment0.click();
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);
  });

  it('syncs active exercise index on native scroll event', async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const carousel = container.querySelector('[data-testid="deck-carousel"]') as HTMLElement;
    expect(carousel).not.toBeNull();
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Mock clientWidth and scrollLeft
    Object.defineProperty(carousel, 'clientWidth', { value: 375, writable: true, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', { value: 375, writable: true, configurable: true });

    carousel.dispatchEvent(new Event('scroll'));

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);
  });
});

