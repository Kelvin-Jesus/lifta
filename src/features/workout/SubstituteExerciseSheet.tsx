import { For, Show, createSignal, type Component } from 'solid-js';
import { BottomSheet } from '../../components/BottomSheet';
import { EXERCISE_CATALOG, filterExercisesByMuscle, getExerciseById } from '../../catalog/exercises';
import { formatMuscleName } from '../../catalog/muscles';
import type { Exercise } from '../../domain/exercise';

export interface SubstituteExerciseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseId: string;
  onSelectSubstitute: (newExerciseId: string) => void;
}

export const SubstituteExerciseSheet: Component<SubstituteExerciseSheetProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');

  const currentExercise = () => getExerciseById(EXERCISE_CATALOG, props.currentExerciseId);
  const primaryMuscle = () => currentExercise()?.primaryMuscles[0];

  const candidateExercises = (): Exercise[] => {
    const muscle = primaryMuscle();
    if (!muscle) return [];

    let list = filterExercisesByMuscle(EXERCISE_CATALOG, muscle).filter(
      (ex) => ex.id !== props.currentExerciseId
    );

    const q = searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter((ex) => ex.name.toLowerCase().includes(q));
    }

    return list;
  };

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Substituir Aparelho Ocupado"
    >
      <div class="flex flex-col gap-3 py-1" data-testid="substitute-exercise-sheet">
        <p class="text-xs text-theme-secondary">
          Aparelho ou banco ocupado? Selecione um exercício equivalente para o mesmo grupo muscular:{' '}
          <span class="text-blue-500 font-semibold">{formatMuscleName(primaryMuscle())}</span>.
        </p>

        {/* Search filter input */}
        <div class="relative">
          <input
            type="text"
            placeholder="Filtrar por nome do exercício..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full h-10 px-3 pl-9 rounded-xl bg-theme-elevated border border-theme-subtle text-xs text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-blue-500"
            data-testid="input-substitute-search"
          />
          <svg
            class="w-4 h-4 absolute left-3 top-3 text-theme-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Exercise candidates list */}
        <div class="divide-y divide-theme-subtle max-h-80 overflow-y-auto">
          <For
            each={candidateExercises()}
            fallback={
              <div class="py-6 text-center text-xs text-theme-tertiary font-mono">
                Nenhum exercício substituto encontrado.
              </div>
            }
          >
            {(ex) => (
              <button
                type="button"
                onClick={() => {
                  props.onSelectSubstitute(ex.id);
                  props.onClose();
                }}
                class="w-full py-3 px-2 flex items-center justify-between hover:bg-theme-surface active:bg-theme-elevated rounded-lg text-left transition-colors"
                data-testid={`substitute-item-${ex.id}`}
              >
                <div>
                  <h4 class="text-xs font-bold text-theme-primary">{ex.name}</h4>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-theme-surface text-theme-secondary border border-theme-subtle">
                      {ex.equipment}
                    </span>
                    <Show when={ex.instructions}>
                      <span class="text-[10px] text-theme-secondary truncate max-w-[200px]">
                        {ex.instructions}
                      </span>
                    </Show>
                  </div>
                </div>

                <span class="text-xs font-bold text-blue-500 flex items-center gap-1">
                  Selecionar
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
    </BottomSheet>
  );
};
