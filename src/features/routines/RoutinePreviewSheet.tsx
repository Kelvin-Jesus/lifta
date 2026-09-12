import { For, Show, type Component } from 'solid-js';
import { BottomSheet } from '../../components/BottomSheet';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';
import { formatMuscleName, formatEquipmentName } from '../../catalog/muscles';
import type { Routine } from '../../domain/routine';

export interface RoutinePreviewSheetProps {
  routine: Routine | null;
  onClose: () => void;
  onStart: (routine: Routine) => void;
}

const WEEKDAY_SHORT: Record<string, string> = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
};

/**
 * Read-only look at a routine before committing to it. Tapping a routine
 * anywhere in the app opens this; starting a workout is always an explicit
 * second action.
 */
export const RoutinePreviewSheet: Component<RoutinePreviewSheetProps> = (props) => {
  const totalSets = () =>
    (props.routine?.exercises ?? []).reduce((sum, ex) => sum + ex.targetSets, 0);

  const estimatedMinutes = () => {
    const exercises = props.routine?.exercises ?? [];
    const seconds = exercises.reduce(
      (sum, ex) => sum + ex.targetSets * (40 + (ex.suggestedRestSeconds ?? 90)),
      0
    );
    return Math.max(1, Math.round(seconds / 60));
  };

  const days = () =>
    (props.routine?.scheduledDays ?? []).map((d) => WEEKDAY_SHORT[d] ?? d).join(', ');

  return (
    <BottomSheet
      isOpen={props.routine !== null}
      onClose={props.onClose}
      title={props.routine?.name ?? 'Rotina'}
    >
      <Show when={props.routine}>
        {(routine) => (
          <div class="space-y-4" data-testid="routine-preview-sheet">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-theme-secondary font-mono">
              <span>{routine().exercises.length} exercícios</span>
              <span>•</span>
              <span>{totalSets()} séries</span>
              <span>•</span>
              <span>~{estimatedMinutes()} min</span>
              <Show when={days()}>
                <span>•</span>
                <span class="text-theme-accent font-medium">{days()}</span>
              </Show>
            </div>

            <div class="inset-list" data-testid="routine-preview-exercises">
              <For
                each={routine().exercises}
                fallback={
                  <div class="py-8 text-center text-xs text-theme-tertiary">
                    Esta rotina ainda não tem exercícios.
                  </div>
                }
              >
                {(routineExercise, index) => {
                  const details = () =>
                    getExerciseById(EXERCISE_CATALOG, routineExercise.exerciseId);
                  return (
                    <div
                      class="list-row"
                      data-testid={`preview-exercise-${routineExercise.exerciseId}`}
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="w-6 h-6 shrink-0 rounded-lg bg-theme-elevated text-[11px] font-mono font-bold text-theme-secondary flex items-center justify-center">
                          {index() + 1}
                        </span>
                        <div class="min-w-0">
                          <div class="row-title truncate">
                            {details()?.name ?? routineExercise.exerciseId}
                          </div>
                          <div class="row-desc">
                            {routineExercise.targetSets} séries
                            <Show when={routineExercise.suggestedRestSeconds}>
                              <span> • {routineExercise.suggestedRestSeconds}s descanso</span>
                            </Show>
                            <Show when={details()}>
                              <span>
                                {' '}
                                • {formatMuscleName(details()!.primaryMuscles[0])} •{' '}
                                {formatEquipmentName(details()!.equipment)}
                              </span>
                            </Show>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            <div class="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => props.onStart(routine())}
                class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
                data-testid="btn-preview-start-workout"
              >
                <span>Iniciar Treino</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={props.onClose}
                class="w-full h-11 rounded-xl bg-theme-elevated border border-theme-subtle text-theme-secondary hover:text-theme-primary font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
                data-testid="btn-preview-close"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Show>
    </BottomSheet>
  );
};
