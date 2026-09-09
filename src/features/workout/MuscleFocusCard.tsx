import { For, Show, createSignal, type Component } from 'solid-js';
import type { MuscleGroup } from '../../domain/types';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import { BottomSheet } from '../../components/BottomSheet';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';
import { formatMuscleName, formatEquipmentName } from '../../catalog/muscles';

export interface MuscleFocusCardProps {
  exerciseId: string;
  onOpenSubstitute?: () => void;
}

export const MuscleFocusCard: Component<MuscleFocusCardProps> = (props) => {
  const [isDetailOpen, setIsDetailOpen] = createSignal(false);
  const [mediaView, setMediaView] = createSignal<'execution' | 'muscles'>('execution');

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
        class="w-full max-w-md mx-auto mb-3 bg-theme-surface border border-theme-separator rounded-2xl p-3 flex flex-col gap-2.5 cursor-pointer hover:border-blue-500/50 active:bg-theme-elevated transition-all select-none theme-transition"
        onClick={() => setIsDetailOpen(true)}
        data-testid="muscle-focus-card"
        title="Toque para ver detalhes da técnica e anatomia"
      >
        {/* Top Header Bar inside Card: Mode Indicator & Toggle Pill */}
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-1.5 min-w-0">
            <Show
              when={mediaView() === 'execution'}
              fallback={
                <>
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  <span class="text-[10px] uppercase font-mono tracking-wider text-blue-500 font-bold truncate">
                    Foco Muscular
                  </span>
                </>
              }
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span class="text-[10px] uppercase font-mono tracking-wider text-emerald-500 font-bold truncate">
                Demonstração do Movimento
              </span>
            </Show>
          </div>

          {/* 1-Tap Toggle Pill: Execução / Músculos */}
          <div
            class="flex items-center p-0.5 rounded-lg bg-theme-elevated border border-theme-subtle flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMediaView('execution')}
              class={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                mediaView() === 'execution'
                  ? 'bg-theme-surface text-theme-primary shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
              data-testid="btn-media-toggle-execution"
            >
              Execução
            </button>
            <button
              type="button"
              onClick={() => setMediaView('muscles')}
              class={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                mediaView() === 'muscles'
                  ? 'bg-theme-surface text-theme-primary shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
              data-testid="btn-media-toggle-muscles"
            >
              Músculos
            </button>
          </div>
        </div>

        {/* Card Main Content */}
        <div class="flex items-center justify-between gap-3 w-full">
          {/* Left Media Display */}
          <Show
            when={mediaView() === 'execution'}
            fallback={
              /* Muscles Anatomy Thumbnail */
              <div
                class="relative w-20 h-28 bg-theme-elevated border border-theme-subtle rounded-xl flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0"
                data-testid="exercise-anatomy-thumbnail"
              >
                <BodyHighlighter
                  primaryMuscles={primaryMuscles()}
                  secondaryMuscles={secondaryMuscles()}
                  view={preferredView()}
                  showLabels={false}
                  class="h-full w-auto"
                />
                <div class="absolute bottom-1 right-1.5 px-1 py-0.2 rounded bg-theme-surface text-[8px] font-mono uppercase text-theme-tertiary border border-theme-subtle">
                  {preferredView() === 'posterior' ? 'Costas' : 'Frente'}
                </div>
              </div>
            }
          >
            {/* Execution GIF Thumbnail */}
            <div
              class="relative w-28 h-24 sm:w-32 bg-black/5 dark:bg-black/30 border border-theme-subtle rounded-xl flex items-center justify-center p-1 overflow-hidden flex-shrink-0"
              data-testid="exercise-gif-thumbnail"
            >
              <Show
                when={exercise()?.gifUrl}
                fallback={
                  <div class="flex flex-col items-center justify-center text-center p-1">
                    <BodyHighlighter
                      primaryMuscles={primaryMuscles()}
                      view={preferredView()}
                      showLabels={false}
                      class="h-16 w-auto opacity-70"
                    />
                    <span class="text-[8px] font-mono text-theme-tertiary mt-0.5">Sem GIF</span>
                  </div>
                }
              >
                <img
                  src={exercise()!.gifUrl}
                  alt={`Execução de ${exercise()?.name ?? 'exercício'}`}
                  class="h-full w-full object-contain rounded-lg"
                  loading="lazy"
                />
              </Show>
            </div>
          </Show>

          {/* Center Details */}
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-theme-primary truncate mb-1">
              {exercise()?.name ?? formatMuscleName(mainMuscle())}
            </h3>

            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/30">
                {formatMuscleName(mainMuscle())}
              </span>
              <Show when={exercise()?.equipment}>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-theme-elevated text-theme-secondary border border-theme-subtle">
                  {formatEquipmentName(exercise()?.equipment)}
                </span>
              </Show>
            </div>

            <Show when={mediaView() === 'muscles' && secondaryMuscles().length > 0}>
              <div class="flex flex-wrap gap-1">
                <span class="text-[9px] uppercase font-mono text-theme-secondary">
                  Sinergistas:
                </span>
                <For each={secondaryMuscles().slice(0, 2)}>
                  {(m) => (
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-theme-elevated text-theme-secondary">
                      {formatMuscleName(m)}
                    </span>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Right Actions: Substitute & Expand Details */}
          <div
            class="flex flex-col items-end justify-between self-stretch gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Show when={props.onOpenSubstitute}>
              <button
                type="button"
                onClick={props.onOpenSubstitute}
                class="h-8 px-2.5 rounded-lg bg-theme-elevated hover:opacity-90 active:scale-95 text-[11px] font-semibold text-theme-primary border border-theme-subtle flex items-center gap-1 transition-all cursor-pointer"
                title="Substituir aparelho ocupado por movimento equivalente"
                data-testid="btn-substitute-trigger"
              >
                <svg class="w-3.5 h-3.5 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Trocar
              </button>
            </Show>

            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              class="text-[10px] text-theme-tertiary hover:text-theme-primary flex items-center gap-0.5 transition-colors cursor-pointer"
              data-testid="btn-open-exercise-details"
            >
              Detalhes
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Full Exercise Details & Anatomy Bottom Sheet */}
      <BottomSheet
        isOpen={isDetailOpen()}
        onClose={() => setIsDetailOpen(false)}
        title={exercise()?.name ?? 'Detalhes do Exercício'}
      >
        <div class="flex flex-col gap-4 py-2" data-testid="anatomy-sheet-content">
          {/* Looping Full-Fidelity Execution GIF */}
          <Show when={exercise()?.gifUrl}>
            <div class="w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-theme-subtle flex flex-col items-center justify-center p-3">
              <img
                src={exercise()!.gifUrl}
                alt={`Execução técnica completa: ${exercise()?.name}`}
                class="max-h-64 w-auto object-contain rounded-xl"
                loading="lazy"
                data-testid="sheet-execution-gif"
              />
              <div class="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-theme-secondary">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Demonstração de Execução em Loop</span>
              </div>
            </div>
          </Show>

          {/* Technical Posture & Movement Instructions */}
          <Show when={exercise()?.instructions}>
            <div class="p-3.5 rounded-xl bg-theme-elevated/50 border border-theme-subtle">
              <span class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary font-bold block mb-1">
                Instruções de Postura e Execução
              </span>
              <p class="text-xs text-theme-primary leading-relaxed">
                {exercise()?.instructions}
              </p>
            </div>
          </Show>

          {/* Full Anatomical Muscle Activation Map */}
          <div class="w-full bg-theme-elevated rounded-2xl p-4 border border-theme-subtle flex justify-center">
            <BodyHighlighter
              primaryMuscles={primaryMuscles()}
              secondaryMuscles={secondaryMuscles()}
              view="both"
              class="h-64"
            />
          </div>

          <div class="w-full space-y-3">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-blue-500 font-bold block mb-1.5">
                Músculos Primários (100% ativação)
              </span>
              <div class="flex flex-wrap gap-1.5">
                <For each={primaryMuscles()}>
                  {(m) => (
                    <span class="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/30 text-xs font-semibold">
                      {formatMuscleName(m)}
                    </span>
                  )}
                </For>
              </div>
            </div>

            <Show when={secondaryMuscles().length > 0}>
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-bold block mb-1.5">
                  Músculos Sinergistas (42% ativação)
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={secondaryMuscles()}>
                    {(m) => (
                      <span class="px-2.5 py-1 rounded-md bg-theme-surface text-theme-secondary border border-theme-subtle text-xs">
                        {formatMuscleName(m)}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
