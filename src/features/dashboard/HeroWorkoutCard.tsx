import { For, Show, type Component } from 'solid-js';
import type { Routine } from '../../domain/routine';
import type { MuscleGroup, Weekday } from '../../domain/types';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';
import { formatMuscleName } from '../../catalog/muscles';

export interface HeroWorkoutCardProps {
  routines: readonly Routine[];
  selectedRoutine: Routine | null;
  onSelectRoutine: (routine: Routine) => void;
  onStartWorkout: (routine: Routine) => void;
}

const WEEKDAY_KEYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function determineSuggestedRoutine(routines: readonly Routine[]): Routine | null {
  if (routines.length === 0) return null;

  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
  const todayKey = WEEKDAY_KEYS[dayIndex];

  // Try finding routine scheduled for today
  const scheduled = routines.find((r) => r.scheduledDays?.includes(todayKey));
  if (scheduled) return scheduled;

  // Otherwise return first routine
  return routines[0];
}

export function aggregateRoutineMuscles(routine: Routine): {
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
} {
  const primarySet = new Set<MuscleGroup>();
  const secondarySet = new Set<MuscleGroup>();

  for (const re of routine.exercises) {
    const ex = getExerciseById(EXERCISE_CATALOG, re.exerciseId);
    if (ex) {
      ex.primaryMuscles.forEach((m) => primarySet.add(m));
      ex.secondaryMuscles.forEach((m) => secondarySet.add(m));
    }
  }

  // Remove primary from secondary to prevent overlap
  primarySet.forEach((m) => secondarySet.delete(m));

  return {
    primary: Array.from(primarySet),
    secondary: Array.from(secondarySet),
  };
}

export const HeroWorkoutCard: Component<HeroWorkoutCardProps> = (props) => {
  const currentRoutine = () => props.selectedRoutine ?? determineSuggestedRoutine(props.routines);

  const muscles = () => {
    const r = currentRoutine();
    if (!r) return { primary: [], secondary: [] };
    return aggregateRoutineMuscles(r);
  };

  const estimatedDuration = () => {
    const r = currentRoutine();
    if (!r) return 55;
    const totalSets = r.exercises.reduce((acc, e) => acc + e.targetSets, 0);
    return Math.max(35, Math.round(totalSets * 2.6));
  };

  const estimatedCalories = () => {
    const r = currentRoutine();
    if (!r) return 480;
    const totalSets = r.exercises.reduce((acc, e) => acc + e.targetSets, 0);
    return Math.round(totalSets * 32);
  };

  const mostTrainedMuscle = () => {
    const p = muscles().primary;
    if (p.length > 0) return formatMuscleName(p[0]);
    const s = muscles().secondary;
    if (s.length > 0) return formatMuscleName(s[0]);
    return 'Corpo Inteiro';
  };

  const isPosteriorFocus = () => {
    const p = muscles().primary;
    const posteriorMuscles: MuscleGroup[] = ['back', 'glutes', 'hamstrings', 'calves'];
    return p.some((m) => posteriorMuscles.includes(m));
  };

  return (
    <div class="hero-routine-card" data-testid="hero-workout-card">
      <Show
        when={currentRoutine()}
        fallback={
          <div class="py-10 text-center text-theme-secondary text-sm">
            Nenhuma rotina cadastrada. Crie uma rotina para começar.
          </div>
        }
      >
        {(routine) => (
          <>
            <div class="hero-routine-header">
              <div>
                <h2 class="routine-name" data-testid="hero-routine-name">
                  {routine().name}
                </h2>
                <p class="routine-sub">
                  {routine().exercises.length} exercícios • Cerca de {estimatedDuration()} min • ~{estimatedCalories()} kcal
                </p>
              </div>
            </div>

            {/* Anatomical Muscle Map Preview */}
            <div class="muscle-preview-box">
              <div class="muscle-svg-wrapper">
                <BodyHighlighter
                  primaryMuscles={muscles().primary}
                  secondaryMuscles={muscles().secondary}
                  view={isPosteriorFocus() ? 'posterior' : 'anterior'}
                  showLabels={false}
                  class="h-full w-auto"
                />
              </div>

              <div class="muscle-target-tags">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 6px; height: 6px; border-radius: 3px; background: var(--accent);"></span>
                  <span class="target-title" style="color: var(--accent);">Músculo Mais Treinado</span>
                </div>
                <span style="font-size: 1.05rem; font-weight: 700; letter-spacing: -0.015em; color: var(--text-primary);">
                  {mostTrainedMuscle()}
                </span>
                <div class="target-pills-row" style="margin-top: 3px;">
                  <span class="muscle-badge">Foco Primário</span>
                  <For each={muscles().secondary.slice(0, 2)}>
                    {(m) => (
                      <span class="muscle-badge-secondary">
                        {formatMuscleName(m)}
                      </span>
                    )}
                  </For>
                  <Show when={muscles().secondary.length === 0 && muscles().primary.length > 1}>
                    <For each={muscles().primary.slice(1, 3)}>
                      {(m) => (
                        <span class="muscle-badge-secondary">
                          {formatMuscleName(m)}
                        </span>
                      )}
                    </For>
                  </Show>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => props.onStartWorkout(routine())}
              class="btn-start-hero"
              data-testid="btn-start-hero-workout"
            >
              <span>Iniciar Treino de Hoje</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </>
        )}
      </Show>
    </div>
  );
};

