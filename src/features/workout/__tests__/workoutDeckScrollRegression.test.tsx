import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { WorkoutDeck } from '../WorkoutDeck';
import { activeWorkoutStore } from '../activeWorkoutStore';
import type { Routine } from '../../../domain/routine';

const sampleRoutine: Routine = {
  id: 'routine-reg-scroll',
  name: 'Treino Regressão Scroll',
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
      suggestedRestSeconds: 90,
    },
  ],
};

describe('WorkoutDeck Horizontal Scroll Regression Suite', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);
  });

  it('[REGRESSION] renders native hardware-accelerated scroll container with snap-mandatory and NO carousel buttons', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const carousel = container.querySelector('[data-testid="deck-carousel"]') as HTMLElement;
    expect(carousel).not.toBeNull();

    // 1. Mandatory native CSS classes for horizontal snap scroll
    expect(carousel.classList.contains('overflow-x-auto')).toBe(true);
    expect(carousel.classList.contains('snap-x')).toBe(true);
    expect(carousel.classList.contains('snap-mandatory')).toBe(true);
    expect(carousel.classList.contains('flex')).toBe(true);
    expect(carousel.classList.contains('scroll-smooth')).toBe(true);

    // 2. Inline style must support webkit touch scrolling and hide scrollbar
    const styleAttr = carousel.getAttribute('style') ?? '';
    expect(styleAttr.replace(/\s+/g, '')).toContain('-webkit-overflow-scrolling:touch');

    // 3. Absolute regression: No intrusive prev/next chevron buttons
    expect(container.querySelector('[data-testid="btn-deck-prev"]')).toBeNull();
    expect(container.querySelector('[data-testid="btn-deck-next"]')).toBeNull();

    // 4. No intermediate transform wrapper - pages must be direct children of main
    const pages = carousel.querySelectorAll('[data-testid^="deck-page-"]');
    expect(pages.length).toBe(3);
    for (const page of Array.from(pages)) {
      expect(page.parentElement).toBe(carousel);
      expect((page as HTMLElement).classList.contains('snap-center')).toBe(true);
      expect((page as HTMLElement).classList.contains('min-w-full')).toBe(true);
    }
  });

  it('[REGRESSION] synchronizes active exercise index and segmented progress on native scroll events', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    const carousel = container.querySelector('[data-testid="deck-carousel"]') as HTMLElement;
    expect(carousel).not.toBeNull();
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Mock clientWidth to 400px and scroll to second page (400px)
    Object.defineProperty(carousel, 'clientWidth', { value: 400, writable: true, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', { value: 400, writable: true, configurable: true });

    carousel.dispatchEvent(new Event('scroll'));

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);

    // Scroll to third page (800px)
    carousel.scrollLeft = 800;
    carousel.dispatchEvent(new Event('scroll'));

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);
  });

  it('[REGRESSION] navigates correctly with keyboard ArrowRight and ArrowLeft', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Advance with ArrowRight
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);

    // Bound check: cannot exceed total exercises
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);

    // Go back with ArrowLeft
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Bound check: cannot go below 0
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);
  });

  it('[REGRESSION] ignores keyboard navigation when input elements are focused', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    // Must remain 0 because user is typing in an input
    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    input.blur();
    document.body.removeChild(input);
  });

  it('[REGRESSION] segmented progress bar allows jumping directly to any exercise', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck />, container);

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(0);

    // Click segment 2 (third exercise)
    const segment2 = container.querySelector('[data-testid="progress-segment-2"]') as HTMLButtonElement;
    expect(segment2).not.toBeNull();
    segment2.click();

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(2);

    // Click segment 1 (second exercise)
    const segment1 = container.querySelector('[data-testid="progress-segment-1"]') as HTMLButtonElement;
    expect(segment1).not.toBeNull();
    segment1.click();

    expect(activeWorkoutStore.session()?.activeExerciseIndex).toBe(1);
  });
});
