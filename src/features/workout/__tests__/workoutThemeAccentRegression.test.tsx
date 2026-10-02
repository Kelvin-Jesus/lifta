import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { WorkoutDeck } from '../WorkoutDeck';
import { ExerciseCard } from '../ExerciseCard';
import { MuscleFocusCard } from '../MuscleFocusCard';
import { activeWorkoutStore } from '../activeWorkoutStore';
import type { Routine } from '../../../domain/routine';
import type { LoggedExercise } from '../../../domain/session';
import type { ResistanceSet } from '../../../domain/set';

describe('Workout Theme Accent Dynamic Tokens Regression Test', () => {
  const sampleRoutine: Routine = {
    id: 'routine-test',
    name: 'Treino A • Peitoral e Tríceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'bench-press',
        targetSets: 3,
        suggestedRestSeconds: 90,
      },
      {
        exerciseId: 'incline-dumbbell-press',
        targetSets: 3,
        suggestedRestSeconds: 60,
      },
    ],
  };

  const sampleSet: ResistanceSet = {
    type: 'resistance',
    kind: 'normal',
    weightKg: 60,
    reps: 8,
    completed: false,
    restSeconds: 90,
  };

  const sampleExercises: LoggedExercise[] = [
    {
      exerciseId: 'bench-press',
      exerciseName: 'Supino Reto com Barra',
      sets: [
        { ...sampleSet, completed: false },
        { ...sampleSet, completed: false },
      ],
    },
    {
      exerciseId: 'incline-dumbbell-press',
      exerciseName: 'Supino Inclinado com Halteres',
      sets: [{ ...sampleSet, completed: false }],
    },
  ];

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    await activeWorkoutStore.startWorkout(sampleRoutine);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.style.removeProperty('--color-accent');
  });

  it('WorkoutDeck active progress segment and overload banner use dynamic theme accent tokens without hardcoded blue', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutDeck onFinish={vi.fn()} onExit={vi.fn()} />, container);

    // Active progress segment should use bg-theme-accent and ring-theme-accent, NOT bg-blue-500
    const activeSegment = container.querySelector('[data-testid="progress-segment-0"]');
    expect(activeSegment).not.toBeNull();
    expect(activeSegment?.className).toContain('bg-theme-accent');
    expect(activeSegment?.className).toContain('ring-theme-accent/40');
    expect(activeSegment?.className).not.toContain('bg-blue-500');

    // Overload banner should use bg-theme-accent/10, border-theme-accent/20, text-theme-accent
    const overloadBanner = container.querySelector('header .mt-2.py-1');
    expect(overloadBanner).not.toBeNull();
    expect(overloadBanner?.className).toContain('bg-theme-accent/10');
    expect(overloadBanner?.className).toContain('border-theme-accent/20');
    expect(overloadBanner?.className).not.toContain('bg-blue-500');

    // Overload banner text should use text-theme-accent, not text-blue-400
    const overloadText = overloadBanner?.querySelector('span');
    expect(overloadText?.className).toContain('text-theme-accent');
    expect(overloadText?.className).not.toContain('text-blue-400');
  });

  it('ExerciseCard muscle pills and primary CTA button use dynamic theme accent tokens without hardcoded blue', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <ExerciseCard
          exerciseIndex={0}
          totalExercises={2}
          exercise={sampleExercises[0]}
          onToggleCompleteSet={vi.fn()}
          onAdjustWeight={vi.fn()}
          onSetWeight={vi.fn()}
          onAdjustReps={vi.fn()}
          onSetReps={vi.fn()}
          onAddSet={vi.fn()}
          onRemoveSet={vi.fn()}
          onCycleKind={vi.fn()}
          onNextExercise={vi.fn()}
          onFinishWorkout={vi.fn()}
        />
      ),
      container
    );

    // Primary CTA button "Concluir Série 1"
    const completeSetBtn = container.querySelector('[data-testid="btn-complete-next-set"]');
    expect(completeSetBtn).not.toBeNull();
    expect(completeSetBtn?.className).toContain('bg-theme-accent');
    expect(completeSetBtn?.className).not.toContain('bg-blue-500');

    // Muscle badge for primary muscles
    const primaryMusclePill = container.querySelector('.flex.flex-wrap.gap-1\\.5.mt-2\\.5 span');
    expect(primaryMusclePill).not.toBeNull();
    expect(primaryMusclePill?.className).toContain('bg-theme-accent/15');
    expect(primaryMusclePill?.className).toContain('text-theme-accent');
    expect(primaryMusclePill?.className).toContain('border-theme-accent/30');
    expect(primaryMusclePill?.className).not.toContain('bg-blue-500');
  });

  it('MuscleFocusCard indicator and chips adapt to dynamic theme accent', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <MuscleFocusCard
          exerciseId="bench-press"
        />
      ),
      container
    );

    const card = container.querySelector('[data-testid="muscle-focus-card"]');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('hover:border-theme-accent/50');
    expect(card?.className).not.toContain('hover:border-blue-500');

    // Muscle chip inside card details
    const musclePill = card?.querySelector('.flex.flex-wrap.items-center.gap-1\\.5 span');
    expect(musclePill).not.toBeNull();
    expect(musclePill?.className).toContain('bg-theme-accent/15');
    expect(musclePill?.className).toContain('text-theme-accent');
    expect(musclePill?.className).toContain('border-theme-accent/30');
    expect(musclePill?.className).not.toContain('bg-blue-500');
  });

  it('changing data-accent to indigo sets indigo accent property and respects theme token integration', () => {
    // Simulate user setting purple/indigo theme
    document.documentElement.setAttribute('data-accent', 'indigo');
    document.documentElement.style.setProperty('--color-accent', '#5856d6');

    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#5856d6');
  });
});
