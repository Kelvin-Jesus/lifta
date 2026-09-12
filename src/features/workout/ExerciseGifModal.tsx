import { onMount, onCleanup, Show, For, type Component } from 'solid-js';
import { triggerHaptic } from '../../utils/haptics';
import { formatMuscleName } from '../../catalog/muscles';
import { EXERCISE_MEDIA_ATTRIBUTION } from '../../catalog/exercisesExtended';
import type { MuscleGroup } from '../../domain/types';

export interface ExerciseGifModalProps {
  isOpen: boolean;
  onClose: () => void;
  gifUrl?: string;
  exerciseName?: string;
  primaryMuscles?: readonly (MuscleGroup | string)[];
  equipment?: string;
  instructions?: string;
}

export const ExerciseGifModal: Component<ExerciseGifModalProps> = (props) => {
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      triggerHaptic('light');
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen && props.gifUrl}>
      <div
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        data-testid="exercise-gif-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Demonstração de execução: ${props.exerciseName ?? 'Exercício'}`}
      >
        <div
          class="w-full max-w-lg rounded-3xl bg-theme-surface border border-theme-separator p-4 sm:p-5 flex flex-col items-center shadow-2xl relative overflow-hidden select-none theme-transition animate-in zoom-in-95 duration-200 max-h-[90vh]"
          data-testid="gif-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between w-full mb-2">
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="text-base font-bold text-theme-primary truncate">
                {props.exerciseName ?? 'Demonstração do Exercício'}
              </h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span class="text-[11px] font-medium text-emerald-500 font-mono">
                  Execução Técnica em Alta Resolução
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                props.onClose();
              }}
              class="w-8 h-8 rounded-full bg-theme-elevated hover:opacity-80 active:scale-95 flex items-center justify-center text-theme-secondary hover:text-theme-primary transition-all cursor-pointer flex-shrink-0 border border-theme-subtle"
              aria-label="Fechar"
              data-testid="btn-close-gif-modal"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Large Expanded GIF Container with Perfect 2xl Rounded Corners */}
          <div
            class="w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 border border-theme-subtle flex flex-col items-center justify-center p-2 relative my-2"
            data-testid="expanded-gif-container"
          >
            <img
              src={props.gifUrl}
              alt={`Demonstração completa de ${props.exerciseName ?? 'exercício'}`}
              class="max-h-[50vh] sm:max-h-[55vh] w-full object-contain rounded-xl"
              loading="eager"
              data-testid="expanded-exercise-gif"
            />
            <span class="mt-1 text-[9px] text-theme-tertiary">{EXERCISE_MEDIA_ATTRIBUTION}</span>
          </div>

          {/* Target Muscles Badges */}
          <Show when={props.primaryMuscles && props.primaryMuscles.length > 0}>
            <div class="flex flex-wrap gap-1.5 w-full mt-1 mb-2">
              <For each={props.primaryMuscles}>
                {(m) => (
                  <span class="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/30 text-[10px] font-semibold font-mono uppercase">
                    {formatMuscleName(m)}
                  </span>
                )}
              </For>
            </div>
          </Show>

          {/* Instructions if available */}
          <Show when={props.instructions}>
            <div class="w-full p-2.5 rounded-xl bg-theme-elevated/50 border border-theme-subtle text-xs text-theme-secondary leading-relaxed max-h-24 overflow-y-auto mb-2">
              <span class="text-[9px] uppercase font-mono tracking-wider text-theme-tertiary font-bold block mb-0.5">
                Instruções de Postura
              </span>
              <p class="text-[11px] text-theme-primary">{props.instructions}</p>
            </div>
          </Show>

          {/* Bottom Dismiss Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              props.onClose();
            }}
            class="w-full mt-1 py-2 rounded-xl bg-theme-elevated hover:opacity-90 active:scale-[0.99] text-xs font-semibold text-theme-primary border border-theme-subtle transition-all cursor-pointer"
            data-testid="btn-dismiss-gif-modal"
          >
            Fechar
          </button>
        </div>
      </div>
    </Show>
  );
};
