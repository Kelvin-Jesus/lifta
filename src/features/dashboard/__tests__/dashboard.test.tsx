import 'fake-indexeddb/auto';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { Effect } from 'effect';
import { WorkoutHeatmap, generate12WeeksGrid } from '../WorkoutHeatmap';
import { WeeklyAgenda } from '../WeeklyAgenda';
import { HeroWorkoutCard, determineSuggestedRoutine, aggregateRoutineMuscles } from '../HeroWorkoutCard';
import { ThemeSelector } from '../ThemeSelector';
import { HomeDashboard } from '../HomeDashboard';
import { RoutineRepository } from '../../../storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../../../storage/repositories/WorkoutSessionRepository';
import type { Routine } from '../../../domain/routine';
import type { WorkoutSession } from '../../../domain/session';

describe('Home Dashboard, Heatmap, and Agenda', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const sampleRoutineA: Routine = {
    id: 'routine-a',
    name: 'Treino A - Peito e Tríceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledDays: ['monday', 'thursday'],
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4, suggestedRestSeconds: 90 },
      { exerciseId: 'tricep-rope-pushdown', targetSets: 3, suggestedRestSeconds: 60 },
    ],
  };

  const sampleRoutineB: Routine = {
    id: 'routine-b',
    name: 'Treino B - Costas e Bíceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledDays: ['tuesday', 'friday'],
    exercises: [
      { exerciseId: 'deadlift', targetSets: 3, suggestedRestSeconds: 120 },
      { exerciseId: 'barbell-bicep-curl', targetSets: 3, suggestedRestSeconds: 60 },
    ],
  };

  const sampleSession: WorkoutSession = {
    id: 'session-1',
    routineId: 'routine-a',
    routineName: 'Treino A - Peito e Tríceps',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationMinutes: 48,
    exercises: [],
    estimatedCalories: 450,
    totalVolumeKg: 4200,
  };

  it('generates 84 cells (12 weeks x 7 days) and maps caloric intensity', () => {
    const weeks = generate12WeeksGrid([sampleSession]);
    expect(weeks.length).toBe(12);
    expect(weeks.every((w) => w.length === 7)).toBe(true);

    // One cell should have calories 450 and level 3 (400-600)
    const activeCell = weeks.flat().find((c) => c.calories === 450);
    expect(activeCell).toBeDefined();
    expect(activeCell?.level).toBe(3);
  });

  it('renders WorkoutHeatmap and displays detail card on cell click', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <WorkoutHeatmap sessions={[sampleSession]} />, container);

    expect(container.querySelector('[data-testid="workout-heatmap"]')).not.toBeNull();

    // Click active cell
    const todayStr = sampleSession.startedAt.slice(0, 10);
    const cell = container.querySelector(`[data-testid="cell-${todayStr}"]`) as HTMLButtonElement;
    expect(cell).not.toBeNull();

    cell.click();

    // Detail card should appear
    const detailCard = container.querySelector('[data-testid="heatmap-detail-card"]');
    expect(detailCard).not.toBeNull();
    expect(detailCard?.textContent).toContain('450 kcal');
  });

  it('renders WeeklyAgenda with scheduled routines and completion state', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <WeeklyAgenda
          routines={[sampleRoutineA, sampleRoutineB]}
          sessions={[sampleSession]}
        />
      ),
      container
    );

    expect(container.querySelector('[data-testid="weekly-agenda"]')).not.toBeNull();
    expect(container.textContent).toContain('Segunda');
    expect(container.textContent).toContain('Domingo');
  });

  it('determines suggested routine and aggregates muscle groups in HeroWorkoutCard', () => {
    const suggested = determineSuggestedRoutine([sampleRoutineA, sampleRoutineB]);
    expect(suggested).not.toBeNull();

    const muscles = aggregateRoutineMuscles(sampleRoutineA);
    expect(muscles.primary).toContain('chest');
    expect(muscles.primary).toContain('triceps');

    const container = document.createElement('div');
    document.body.appendChild(container);
    const onStart = vi.fn();

    render(
      () => (
        <HeroWorkoutCard
          routines={[sampleRoutineA, sampleRoutineB]}
          selectedRoutine={sampleRoutineA}
          onSelectRoutine={vi.fn()}
          onStartWorkout={onStart}
        />
      ),
      container
    );

    expect(container.querySelector('[data-testid="hero-workout-card"]')).not.toBeNull();
    expect(container.textContent).toContain('Treino A - Peito e Tríceps');

    const startBtn = container.querySelector('[data-testid="btn-start-hero-workout"]') as HTMLButtonElement;
    startBtn.click();
    expect(onStart).toHaveBeenCalledWith(sampleRoutineA);
  });

  it('switches themes and accents via ThemeSelector', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <ThemeSelector />, container);

    const lightBtn = container.querySelector('[data-testid="btn-theme-light"]') as HTMLButtonElement;
    lightBtn.click();

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const indigoBtn = container.querySelector('[data-testid="btn-accent-indigo"]') as HTMLButtonElement;
    indigoBtn.click();

    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#5856d6');
  });

  it('renders HomeDashboard and switches between Heatmap and Agenda views', async () => {
    await Effect.runPromise(RoutineRepository.save(sampleRoutineA));
    await Effect.runPromise(WorkoutSessionRepository.save(sampleSession));

    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <HomeDashboard onStartWorkout={vi.fn()} />, container);

    expect(container.querySelector('[data-testid="home-dashboard"]')).not.toBeNull();

    // Default view is heatmap
    expect(container.querySelector('[data-testid="workout-heatmap"]')).not.toBeNull();

    // Click agenda tab
    const agendaTab = container.querySelector('[data-testid="tab-agenda"]') as HTMLButtonElement;
    agendaTab.click();

    expect(container.querySelector('[data-testid="weekly-agenda"]')).not.toBeNull();
  });
});
