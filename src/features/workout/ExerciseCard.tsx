import { For, Show, createSignal, type Component } from 'solid-js';
import type { LoggedExercise } from '../../domain/session';
import { SetRow } from './SetRow';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';

export interface ExerciseCardProps {
  exerciseIndex: number;
  exercise: LoggedExercise;
  totalExercises: number;
  onToggleCompleteSet: (setIndex: number) => void;
  onAdjustWeight: (setIndex: number, delta: number) => void;
  onSetWeight: (setIndex: number, val: number) => void;
  onAdjustReps: (setIndex: number, delta: number) => void;
  onSetReps: (setIndex: number, val: number) => void;
  onCycleKind: (setIndex: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onNextExercise?: () => void;
  onFinishWorkout?: () => void;
}

export const ExerciseCard: Component<ExerciseCardProps> = (props) => {
  const [showAnatomy, setShowAnatomy] = createSignal(false);

  const catalogDetails = () => getExerciseById(EXERCISE_CATALOG, props.exercise.exerciseId);

  const firstIncompleteIndex = () =>
    props.exercise.sets.findIndex((s) => !s.completed);

  const allSetsCompleted = () =>
    props.exercise.sets.length > 0 && firstIncompleteIndex() === -1;

  const isLastExercise = () =>
    props.exerciseIndex === props.totalExercises - 1;

  return (
    <div
      class="flex flex-col w-full max-w-md mx-auto bg-neutral-900/70 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg select-none"
      data-testid={`exercise-card-${props.exerciseIndex}`}
    >
      {/* Exercise Header */}
      <div class="p-4 border-b border-neutral-800/70">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono font-bold text-neutral-400">
                {props.exerciseIndex + 1} de {props.totalExercises}
              </span>
              <Show when={catalogDetails()?.equipment}>
                <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  {catalogDetails()?.equipment}
                </span>
              </Show>
            </div>
            <h2
              class="text-lg font-bold text-neutral-100 tracking-tight"
              data-testid="exercise-title"
            >
              {props.exercise.exerciseName ?? props.exercise.exerciseId}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAnatomy(!showAnatomy())}
            class="h-9 px-2.5 rounded-lg bg-neutral-800/80 text-neutral-300 hover:text-white active:bg-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Exibir mapa anatômico dos músculos ativados"
            data-testid="btn-toggle-anatomy"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{showAnatomy() ? 'Ocultar' : 'Músculos'}</span>
          </button>
        </div>

        {/* Muscle Pills */}
        <div class="flex flex-wrap gap-1.5 mt-2.5">
          <For each={catalogDetails()?.primaryMuscles ?? []}>
            {(muscle) => (
              <span class="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {muscle}
              </span>
            )}
          </For>
          <For each={catalogDetails()?.secondaryMuscles ?? []}>
            {(muscle) => (
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-750">
                {muscle}
              </span>
            )}
          </For>
        </div>

        {/* Collapsible Anatomy Vector View */}
        <Show when={showAnatomy()}>
          <div class="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-center animate-in fade-in duration-200">
            <BodyHighlighter
              primaryMuscles={catalogDetails()?.primaryMuscles}
              secondaryMuscles={catalogDetails()?.secondaryMuscles}
              view="both"
              class="h-36"
            />
          </div>
        </Show>
      </div>

      {/* Sets Table Header */}
      <div class="grid grid-cols-4 px-3 py-2 bg-neutral-950/40 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-neutral-800/60 text-center">
        <span class="text-left pl-2">Série</span>
        <span>Carga (kg)</span>
        <span>Reps</span>
        <span class="text-right pr-2">Status</span>
      </div>

      {/* Sets List */}
      <div class="divide-y divide-neutral-800/40">
        <For each={props.exercise.sets}>
          {(set, idx) => (
            <SetRow
              setIndex={idx()}
              set={set}
              onToggleComplete={() => props.onToggleCompleteSet(idx())}
              onAdjustWeight={(delta) => props.onAdjustWeight(idx(), delta)}
              onSetWeight={(val) => props.onSetWeight(idx(), val)}
              onAdjustReps={(delta) => props.onAdjustReps(idx(), delta)}
              onSetReps={(val) => props.onSetReps(idx(), val)}
              onCycleKind={() => props.onCycleKind(idx())}
              onRemoveSet={() => props.onRemoveSet(idx())}
            />
          )}
        </For>
      </div>

      {/* Add Set Button */}
      <div class="p-3 border-t border-neutral-850 bg-neutral-950/30 flex justify-center">
        <button
          type="button"
          onClick={props.onAddSet}
          class="w-full py-2.5 rounded-xl border border-dashed border-neutral-700/80 hover:border-neutral-500 active:bg-neutral-800/40 text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
          data-testid="btn-add-set"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Série
        </button>
      </div>

      {/* Primary Giant Thumb-Friendly Action Button */}
      <div class="p-3.5 bg-neutral-950 border-t border-neutral-800/80">
        <Show
          when={!allSetsCompleted()}
          fallback={
            <Show
              when={!isLastExercise()}
              fallback={
                <button
                  type="button"
                  onClick={props.onFinishWorkout}
                  class="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
                  data-testid="btn-finish-workout-primary"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Finalizar Treino
                </button>
              }
            >
              <button
                type="button"
                onClick={props.onNextExercise}
                class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-950/50 transition-all flex items-center justify-center gap-2"
                data-testid="btn-next-exercise-primary"
              >
                Próximo Exercício
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Show>
          }
        >
          <button
            type="button"
            onClick={() => {
              const targetIdx = firstIncompleteIndex();
              if (targetIdx !== -1) {
                props.onToggleCompleteSet(targetIdx);
              }
            }}
            class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-950/50 transition-all flex items-center justify-center gap-2"
            data-testid="btn-complete-next-set"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Concluir Série {firstIncompleteIndex() + 1}
          </button>
        </Show>
      </div>
    </div>
  );
};
