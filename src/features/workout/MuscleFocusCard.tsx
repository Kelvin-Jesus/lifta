import { For, Show, createSignal, type Component } from 'solid-js';
import type { MuscleGroup } from '../../domain/types';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import { BottomSheet } from '../../components/BottomSheet';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';

export interface MuscleFocusCardProps {
  exerciseId: string;
  onOpenSubstitute?: () => void;
}

export const MuscleFocusCard: Component<MuscleFocusCardProps> = (props) => {
  const [isDetailOpen, setIsDetailOpen] = createSignal(false);

  const exercise = () => getExerciseById(EXERCISE_CATALOG, props.exerciseId);
  const primaryMuscles = () => exercise()?.primaryMuscles ?? [];
  const secondaryMuscles = () => exercise()?.secondaryMuscles ?? [];

  const mainMuscle = () => primaryMuscles()[0] ?? 'chest';

  // Determine preferred view: if posterior muscles (back, glutes, hamstrings), show posterior, else anterior
  const preferredView = (): 'anterior' | 'posterior' => {
    const posteriorFocused: MuscleGroup[] = ['back', 'hamstrings', 'glutes'];
    return posteriorFocused.includes(mainMuscle()) ? 'posterior' : 'anterior';
  };

  return (
    <>
      <div
        class="w-full max-w-md mx-auto mb-3 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-3 flex items-center justify-between gap-4 cursor-pointer hover:border-neutral-700 active:bg-neutral-800/40 transition-all select-none"
        onClick={() => setIsDetailOpen(true)}
        data-testid="muscle-focus-card"
        title="Toque para ver detalhes anatômicos completos"
      >
        {/* Left: Mini Anatomy Thumbnail */}
        <div class="relative w-20 h-28 bg-neutral-950/80 border border-neutral-800 rounded-xl flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
          <BodyHighlighter
            primaryMuscles={primaryMuscles()}
            secondaryMuscles={secondaryMuscles()}
            view={preferredView()}
            class="h-full w-auto"
          />
          <div class="absolute bottom-1 right-1.5 px-1 py-0.2 rounded bg-neutral-900/90 text-[8px] font-mono uppercase text-neutral-400 border border-neutral-800">
            {preferredView() === 'posterior' ? 'Costas' : 'Frente'}
          </div>
        </div>

        {/* Middle: Muscle Activation Details */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span class="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">
              Foco Principal
            </span>
          </div>

          <h3 class="text-sm font-bold text-neutral-100 capitalize truncate mb-1">
            {mainMuscle()}
          </h3>

          <div class="flex flex-wrap gap-1">
            <Show when={secondaryMuscles().length > 0}>
              <span class="text-[9px] uppercase font-mono text-neutral-400">
                Sinergistas:
              </span>
              <For each={secondaryMuscles().slice(0, 2)}>
                {(m) => (
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                    {m}
                  </span>
                )}
              </For>
            </Show>
          </div>
        </div>

        {/* Right: Substitute Button */}
        <div class="flex flex-col items-end gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Show when={props.onOpenSubstitute}>
            <button
              type="button"
              onClick={props.onOpenSubstitute}
              class="h-8 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 active:scale-95 text-[11px] font-semibold text-neutral-200 border border-neutral-700/60 flex items-center gap-1 transition-all"
              title="Substituir aparelho ocupado por movimento equivalente"
              data-testid="btn-substitute-trigger"
            >
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Trocar
            </button>
          </Show>

          <span class="text-[9px] text-neutral-400 flex items-center gap-0.5">
            Anatomia
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Full Anatomy Bottom Sheet */}
      <BottomSheet
        isOpen={isDetailOpen()}
        onClose={() => setIsDetailOpen(false)}
        title="Ativação Muscular do Exercício"
      >
        <div class="flex flex-col items-center gap-4 py-2" data-testid="anatomy-sheet-content">
          <div class="w-full bg-neutral-950 rounded-2xl p-4 border border-neutral-800 flex justify-center">
            <BodyHighlighter
              primaryMuscles={primaryMuscles()}
              secondaryMuscles={secondaryMuscles()}
              view="both"
              class="h-64"
            />
          </div>

          <div class="w-full space-y-3">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1.5">
                Músculos Primários (100% ativação)
              </span>
              <div class="flex flex-wrap gap-1.5">
                <For each={primaryMuscles()}>
                  {(m) => (
                    <span class="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold capitalize">
                      {m}
                    </span>
                  )}
                </For>
              </div>
            </div>

            <Show when={secondaryMuscles().length > 0}>
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                  Músculos Sinergistas (42% ativação)
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={secondaryMuscles()}>
                    {(m) => (
                      <span class="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs capitalize">
                        {m}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={exercise()?.instructions}>
              <div class="mt-3 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <span class="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
                  Instruções Técnicas
                </span>
                <p class="text-xs text-neutral-300 leading-relaxed">
                  {exercise()?.instructions}
                </p>
              </div>
            </Show>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
