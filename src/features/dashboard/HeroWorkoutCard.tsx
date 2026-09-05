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
    if (!r) return 45;
    const totalSets = r.exercises.reduce((acc, e) => acc + e.targetSets, 0);
    // ~2.5 mins per set (execution + rest)
    return Math.max(25, Math.round(totalSets * 2.5));
  };

  return (
    <div
      class="w-full bg-theme-surface border border-theme-separator rounded-3xl p-5 shadow-2xl theme-transition select-none"
      data-testid="hero-workout-card"
    >
      <Show
        when={currentRoutine()}
        fallback={
          <div class="py-12 text-center text-theme-secondary font-mono text-xs">
            Nenhuma rotina cadastrada. Crie uma rotina para começar.
          </div>
        }
      >
        {(routine) => (
          <>
            {/* Top Tag & Routine Selector Chips */}
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Treino Sugerido
              </span>

              {/* Routine switcher chips */}
              <div class="flex items-center gap-1 overflow-x-auto max-w-[180px] pb-0.5">
                <For each={props.routines}>
                  {(r) => (
                    <button
                      type="button"
                      onClick={() => props.onSelectRoutine(r)}
                      class={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all ${
                        routine().id === r.id
                          ? 'bg-theme-accent text-white shadow-sm'
                          : 'bg-theme-elevated text-theme-secondary hover:text-theme-primary'
                      }`}
                      data-testid={`routine-chip-${r.id}`}
                    >
                      {r.name.slice(0, 8)}
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Title & Metadata */}
            <h2
              class="text-xl font-black text-theme-primary tracking-tight mb-1"
              data-testid="hero-routine-name"
            >
              {routine().name}
            </h2>

            <div class="flex items-center gap-3 text-xs text-theme-secondary font-mono mb-4">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {routine().exercises.length} exercícios
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{estimatedDuration()} min
              </span>
            </div>

            {/* Anatomical Routine Coverage Preview */}
            <div class="w-full bg-theme-elevated border border-theme-subtle rounded-2xl p-3 flex items-center justify-between gap-4 mb-5">
              <div class="flex-1">
                <span class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary font-bold block mb-1">
                  Grupos Musculares Ativados
                </span>
                <div class="flex flex-wrap gap-1 mb-2">
                  <For each={muscles().primary}>
                    {(m) => (
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 font-medium">
                        {formatMuscleName(m)}
                      </span>
                    )}
                  </For>
                  <For each={muscles().secondary}>
                    {(m) => (
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-theme-surface text-theme-secondary border border-theme-subtle">
                        {formatMuscleName(m)}
                      </span>
                    )}
                  </For>
                </div>
              </div>

              <div class="w-20 h-24 flex items-center justify-center p-1 bg-theme-surface rounded-xl border border-theme-subtle flex-shrink-0">
                <BodyHighlighter
                  primaryMuscles={muscles().primary}
                  secondaryMuscles={muscles().secondary}
                  view="both"
                  class="h-full w-auto"
                />
              </div>
            </div>

            {/* Primary Giant 1-Tap Action Button */}
            <button
              type="button"
              onClick={() => props.onStartWorkout(routine())}
              class="w-full h-13 rounded-2xl bg-theme-accent hover:opacity-90 active:scale-[0.98] text-white font-bold text-base tracking-wide shadow-xl shadow-blue-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              data-testid="btn-start-hero-workout"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Iniciar Treino de Hoje
            </button>
          </>
        )}
      </Show>
    </div>
  );
};
