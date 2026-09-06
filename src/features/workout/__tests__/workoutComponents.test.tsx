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

  it('accelerates stepper increment on long press in SetRow', async () => {
    vi.useFakeTimers();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onAdjustWeight = vi.fn();

    render(
      () => (
        <SetRow
          setIndex={0}
          set={sampleSet}
          onToggleComplete={vi.fn()}
          onAdjustWeight={onAdjustWeight}
          onSetWeight={vi.fn()}
          onAdjustReps={vi.fn()}
          onSetReps={vi.fn()}
          onCycleKind={vi.fn()}
        />
      ),
      container
    );

    const plusBtn = container.querySelector('[data-testid="btn-weight-plus-0"]') as HTMLButtonElement;

    // Simulate pointer down (hold)
    plusBtn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
    expect(onAdjustWeight).toHaveBeenCalledTimes(1);

    // Fast-forward past hold threshold (350ms) + 3 ticks (300ms)
    vi.advanceTimersByTime(650);
    expect(onAdjustWeight).toHaveBeenCalledTimes(4);

    // Pointer up should cancel interval
    plusBtn.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    vi.advanceTimersByTime(500);
    expect(onAdjustWeight).toHaveBeenCalledTimes(4);

    vi.useRealTimers();
  });

  it('renders WorkoutVictoryModal with celebratory stats and handles confirm', async () => {
    const { WorkoutVictoryModal } = await import('../WorkoutVictoryModal');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onDismiss = vi.fn();

    const completedSession = {
      id: 'session-victory-1',
      routineId: 'routine-push',
      routineName: 'Treino A • Peitoral e Tríceps',
      startedAt: new Date(Date.now() - 52 * 60000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: 52,
      estimatedCalories: 480,
      totalVolumeKg: 4250,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Supino Reto com Barra',
          sets: [
            { type: 'resistance' as const, kind: 'normal' as const, reps: 10, weightKg: 80, completed: true, restSeconds: 90 },
            { type: 'resistance' as const, kind: 'normal' as const, reps: 8, weightKg: 85, completed: true, restSeconds: 90 },
          ],
        },
      ],
    };

    render(() => <WorkoutVictoryModal session={completedSession} onDismiss={onDismiss} />, container);

    expect(container.querySelector('[data-testid="workout-victory-modal"]')).not.toBeNull();
    expect(container.textContent).toContain('Treino Concluído!');
    expect(container.textContent).toContain('4.250 kg');
    expect(container.textContent).toContain('52 min');
    expect(container.textContent).toContain('2 / 2');
    expect(container.textContent).toContain('480 kcal');
    expect(container.textContent).toContain('Maior carga: 85 kg no Supino Reto com Barra');

    // Click confirm button
    const confirmBtn = container.querySelector('[data-testid="btn-victory-confirm"]') as HTMLButtonElement;
    expect(confirmBtn).not.toBeNull();
    confirmBtn.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
