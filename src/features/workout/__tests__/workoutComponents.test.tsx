import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { SetRow } from '../SetRow';
import { FloatingRestBar } from '../FloatingRestBar';
import { ExerciseCard } from '../ExerciseCard';
import type { ResistanceSet } from '../../../domain/set';
import type { LoggedExercise } from '../../../domain/session';

describe('Workout Components', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const sampleSet: ResistanceSet = {
    type: 'resistance',
    kind: 'normal',
    weightKg: 50,
    reps: 10,
    completed: false,
    restSeconds: 90,
  };

  const sampleExercise: LoggedExercise = {
    exerciseId: 'bench-press',
    exerciseName: 'Supino Reto com Barra',
    sets: [
      { ...sampleSet, completed: false },
      { ...sampleSet, completed: false },
    ],
  };

  it('renders SetRow with steppers and toggles completion', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onToggle = vi.fn();
    const onAdjustWeight = vi.fn();
    const onAdjustReps = vi.fn();

    render(
      () => (
        <SetRow
          setIndex={0}
          set={sampleSet}
          onToggleComplete={onToggle}
          onAdjustWeight={onAdjustWeight}
          onSetWeight={vi.fn()}
          onAdjustReps={onAdjustReps}
          onSetReps={vi.fn()}
          onCycleKind={vi.fn()}
        />
      ),
      container
    );

    expect(container.textContent).toContain('50');
    expect(container.textContent).toContain('10');

    // Click weight plus
    const plusWeightBtn = container.querySelector('[data-testid="btn-weight-plus-0"]') as HTMLButtonElement;
    plusWeightBtn.click();
    expect(onAdjustWeight).toHaveBeenCalledWith(2.5);

    // Click reps minus
    const minusRepsBtn = container.querySelector('[data-testid="btn-reps-minus-0"]') as HTMLButtonElement;
    minusRepsBtn.click();
    expect(onAdjustReps).toHaveBeenCalledWith(-1);

    // Click complete
    const completeBtn = container.querySelector('[data-testid="btn-complete-set-0"]') as HTMLButtonElement;
    completeBtn.click();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders FloatingRestBar when active and handles +30s and Skip', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onAdd = vi.fn();
    const onSkip = vi.fn();

    render(
      () => (
        <FloatingRestBar
          timer={{ active: true, remainingSeconds: 75, durationSeconds: 90 }}
          onAddSeconds={onAdd}
          onSkip={onSkip}
        />
      ),
      container
    );

    const countdown = container.querySelector('[data-testid="rest-timer-countdown"]');
    expect(countdown?.textContent).toBe('01:15');

    const addBtn = container.querySelector('[data-testid="btn-add-rest-30s"]') as HTMLButtonElement;
    addBtn.click();
    expect(onAdd).toHaveBeenCalledWith(30);

    const skipBtn = container.querySelector('[data-testid="btn-skip-rest"]') as HTMLButtonElement;
    skipBtn.click();
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('renders ExerciseCard with 1-tap thumb button to complete next set', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onToggle = vi.fn();

    render(
      () => (
        <ExerciseCard
          exerciseIndex={0}
          exercise={sampleExercise}
          totalExercises={2}
          onToggleCompleteSet={onToggle}
          onAdjustWeight={vi.fn()}
          onSetWeight={vi.fn()}
          onAdjustReps={vi.fn()}
          onSetReps={vi.fn()}
          onCycleKind={vi.fn()}
          onAddSet={vi.fn()}
          onRemoveSet={vi.fn()}
        />
      ),
      container
    );

    expect(container.textContent).toContain('Supino Reto com Barra');

    // 1-tap action should say "Concluir Série 1"
    const nextSetBtn = container.querySelector('[data-testid="btn-complete-next-set"]') as HTMLButtonElement;
    expect(nextSetBtn).not.toBeNull();
    expect(nextSetBtn.textContent).toContain('Concluir Série 1');

    nextSetBtn.click();
    expect(onToggle).toHaveBeenCalledWith(0);
  });
});
