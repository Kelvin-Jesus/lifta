import { For, Show, createSignal, type Component } from 'solid-js';
import type { LoggedExercise } from '../../domain/session';
import { SetRow } from './SetRow';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import { ExerciseGifModal } from './ExerciseGifModal';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';
import { formatMuscleName, formatEquipmentName } from '../../catalog/muscles';

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
  const [isGifModalOpen, setIsGifModalOpen] = createSignal(false);

  const catalogDetails = () => getExerciseById(EXERCISE_CATALOG, props.exercise.exerciseId);

  const firstIncompleteIndex = () =>
    props.exercise.sets.findIndex((s) => !s.completed);

  const allSetsCompleted = () =>
    props.exercise.sets.length > 0 && firstIncompleteIndex() === -1;

  const isLastExercise = () =>
    props.exerciseIndex === props.totalExercises - 1;

  return (
    <div
      class="flex flex-col w-full max-w-md mx-auto bg-theme-surface border border-theme-separator rounded-2xl overflow-hidden shadow-lg select-none theme-transition mb-4"
      data-testid={`exercise-card-${props.exerciseIndex}`}
    >
      {/* Exercise Header */}
      <div class="p-4 border-b border-theme-subtle">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono font-bold text-theme-secondary">
                {props.exerciseIndex + 1} de {props.totalExercises}
              </span>
              <Show when={catalogDetails()?.equipment}>
                <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-theme-elevated text-theme-secondary">
                  {formatEquipmentName(catalogDetails()?.equipment)}
                </span>
              </Show>
            </div>
            <h2
              class="text-lg font-bold text-theme-primary tracking-tight"
              data-testid="exercise-title"
            >
              {props.exercise.exerciseName ?? props.exercise.exerciseId}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAnatomy(!showAnatomy())}
            class="h-9 px-2.5 rounded-lg bg-theme-elevated text-theme-secondary hover:text-theme-primary active:scale-95 text-xs font-medium flex items-center gap-1.5 transition-all"
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
              <span class="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                {formatMuscleName(muscle)}
              </span>
            )}
          </For>
          <For each={catalogDetails()?.secondaryMuscles ?? []}>
            {(muscle) => (
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle">
                {formatMuscleName(muscle)}
              </span>
            )}
          </For>
        </div>

        {/* Collapsible Exercise Motion & Anatomy View */}
        <Show when={showAnatomy()}>
          <div class="mt-3 p-3 rounded-xl bg-theme-bg border border-theme-subtle flex flex-col items-center gap-3 animate-in fade-in duration-200">
            <Show when={catalogDetails()?.gifUrl}>
              <div
                class="relative w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-theme-subtle flex flex-col items-center justify-center p-2.5 cursor-pointer group hover:border-blue-500/50 transition-all"
                onClick={() => setIsGifModalOpen(true)}
                title="Toque para ampliar demonstração da execução"
                data-testid="exercise-card-gif-preview"
              >
                <img
                  src={catalogDetails()?.gifUrl}
                  alt={`Demonstração de ${props.exercise.exerciseName}`}
                  class="max-h-48 w-auto object-contain rounded-xl"
                  loading="lazy"
                />
                <div class="mt-1.5 flex items-center gap-1.5 text-[10px] text-theme-secondary font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Demonstração do Movimento</span>
                  <span class="text-blue-500 font-bold ml-1 flex items-center gap-0.5 group-hover:underline">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Ampliar
                  </span>
                </div>
              </div>
            </Show>

            <Show when={catalogDetails()?.instructions}>
              <p class="text-xs text-theme-secondary leading-relaxed self-start">
                {catalogDetails()?.instructions}
              </p>
            </Show>

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
      <div class="grid grid-cols-4 px-3 py-2 bg-theme-elevated/40 text-[10px] font-mono uppercase tracking-wider text-theme-secondary border-b border-theme-subtle text-center">
        <span class="text-left pl-2">Série</span>
        <span>Carga (kg)</span>
        <span>Reps</span>
        <span class="text-right pr-2">Status</span>
      </div>

      {/* Sets List */}
      <div class="divide-y divide-theme-subtle">
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
      <div class="p-3 border-t border-theme-subtle bg-theme-elevated/20 flex justify-center">
        <button
          type="button"
          onClick={props.onAddSet}
          class="w-full py-2.5 rounded-xl border border-dashed border-theme-separator hover:border-theme-primary active:bg-theme-elevated text-xs font-semibold text-theme-secondary hover:text-theme-primary flex items-center justify-center gap-1.5 transition-all"
          data-testid="btn-add-set"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Série
        </button>
      </div>

      {/* Primary Giant Thumb-Friendly Action Button */}
      <div class="p-3.5 bg-theme-surface border-t border-theme-subtle">
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

      {/* Expanded GIF Lightbox Modal */}
      <ExerciseGifModal
        isOpen={isGifModalOpen()}
        onClose={() => setIsGifModalOpen(false)}
        gifUrl={catalogDetails()?.gifUrl}
        exerciseName={props.exercise.exerciseName}
        primaryMuscles={catalogDetails()?.primaryMuscles}
        equipment={catalogDetails()?.equipment}
        instructions={catalogDetails()?.instructions}
      />
    </div>
  );
};
