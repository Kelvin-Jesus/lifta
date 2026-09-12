import { For, Show, createSignal, type Component } from 'solid-js';
import { Effect } from 'effect';
import { BottomSheet } from '../../components/BottomSheet';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { EXERCISE_CATALOG, getExerciseById } from '../../catalog/exercises';
import type { Routine, RoutineExercise } from '../../domain/routine';
import type { Weekday } from '../../domain/types';

export interface RoutineManagerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routines: readonly Routine[];
  onRoutinesUpdated: () => void;
}

const WEEKDAY_ITEMS: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Seg' },
  { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
];

export const RoutineManagerSheet: Component<RoutineManagerSheetProps> = (props) => {
  const [isCreating, setIsCreating] = createSignal(false);
  const [name, setName] = createSignal('');
  const [selectedDays, setSelectedDays] = createSignal<Weekday[]>([]);
  const [selectedExercises, setSelectedExercises] = createSignal<RoutineExercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = createSignal('');
  const [expandedRoutineId, setExpandedRoutineId] = createSignal<string | null>(null);

  const resetForm = () => {
    setName('');
    setSelectedDays([]);
    setSelectedExercises([]);
    setIsCreating(false);
  };

  const toggleDay = (day: Weekday) => {
    if (selectedDays().includes(day)) {
      setSelectedDays(selectedDays().filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays(), day]);
    }
  };

  const addExercise = (exerciseId: string) => {
    setSelectedExercises([
      ...selectedExercises(),
      {
        exerciseId,
        targetSets: 3,
        suggestedRestSeconds: 90,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises().filter((_, i) => i !== index));
  };

  const handleSaveRoutine = async () => {
    if (!name().trim() || selectedExercises().length === 0) return;

    const newRoutine: Routine = {
      id: `routine-${Date.now()}`,
      name: name().trim(),
      scheduledDays: selectedDays(),
      exercises: selectedExercises(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await Effect.runPromise(RoutineRepository.save(newRoutine));
    props.onRoutinesUpdated();
    resetForm();
  };

  const handleDeleteRoutine = async (id: string) => {
    await Effect.runPromise(RoutineRepository.delete(id));
    props.onRoutinesUpdated();
  };

  const filteredCatalog = () => {
    const q = exerciseSearch().trim().toLowerCase();
    if (!q) return EXERCISE_CATALOG.slice(0, 15);
    return EXERCISE_CATALOG.filter((ex) => ex.name.toLowerCase().includes(q)).slice(0, 15);
  };

  return (
    <BottomSheet
      isOpen={props.isOpen}
      onClose={() => {
        resetForm();
        props.onClose();
      }}
      title={isCreating() ? 'Nova Rotina de Treino' : 'Gerenciar Rotinas'}
    >
      <div class="space-y-4 py-1" data-testid="routine-manager-sheet">
        <Show
          when={isCreating()}
          fallback={
            <>
              {/* Routines List */}
              <div class="space-y-2.5 max-h-96 overflow-y-auto">
                <For
                  each={props.routines}
                  fallback={
                    <div class="py-8 text-center text-xs text-theme-tertiary font-mono">
                      Nenhuma rotina criada ainda.
                    </div>
                  }
                >
                  {(routine) => {
                    const isExpanded = () => expandedRoutineId() === routine.id;
                    return (
                      <div
                        class="rounded-2xl bg-theme-elevated border border-theme-subtle overflow-hidden"
                        data-testid={`routine-item-${routine.id}`}
                      >
                        <div class="p-3.5 flex items-center justify-between">
                          <div
                            class="flex-1 pr-2 cursor-pointer"
                            onClick={() =>
                              setExpandedRoutineId(isExpanded() ? null : routine.id)
                            }
                            aria-expanded={isExpanded()}
                            data-testid={`btn-preview-routine-${routine.id}`}
                          >
                            <h4 class="text-sm font-bold text-theme-primary">{routine.name}</h4>
                            <div class="flex items-center gap-2 mt-1 text-xs text-theme-secondary font-mono">
                              <span>{routine.exercises.length} exercícios</span>
                              <Show when={routine.scheduledDays && routine.scheduledDays.length > 0}>
                                <span>•</span>
                                <span class="text-blue-500 font-medium">
                                  {routine.scheduledDays!.map((d) => d.slice(0, 3)).join(', ')}
                                </span>
                              </Show>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoutine(routine.id);
                            }}
                            class="w-9 h-9 rounded-lg text-rose-500 hover:bg-rose-500/10 active:scale-95 flex items-center justify-center transition-all shrink-0"
                            title="Excluir rotina"
                            aria-label={`Excluir rotina ${routine.name}`}
                            data-testid={`btn-delete-routine-${routine.id}`}
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <Show when={isExpanded()}>
                          <ul
                            class="px-3.5 pb-3.5 space-y-1.5 border-t border-theme-subtle pt-2.5"
                            data-testid={`routine-preview-${routine.id}`}
                          >
                            <For each={routine.exercises}>
                              {(re, i) => (
                                <li class="flex items-center gap-2 text-xs text-theme-secondary">
                                  <span class="w-5 h-5 shrink-0 rounded-md bg-theme-surface text-[10px] font-mono font-bold flex items-center justify-center">
                                    {i() + 1}
                                  </span>
                                  <span class="text-theme-primary truncate">
                                    {getExerciseById(EXERCISE_CATALOG, re.exerciseId)?.name ??
                                      re.exerciseId}
                                  </span>
                                  <span class="font-mono shrink-0">{re.targetSets}x</span>
                                </li>
                              )}
                            </For>
                          </ul>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
                data-testid="btn-open-create-routine"
              >
                + Criar Nova Rotina
              </button>
            </>
          }
        >
          {/* Create Routine Form */}
          <div class="space-y-3">
            <div>
              <label class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary block mb-1">
                Nome da Rotina
              </label>
              <input
                type="text"
                placeholder="Ex: Treino A - Peito e Tríceps"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="w-full h-11 px-3 rounded-xl bg-theme-elevated border border-theme-subtle text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-blue-500"
                data-testid="input-routine-name"
              />
            </div>

            {/* Scheduled Days Selector */}
            <div>
              <label class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary block mb-1">
                Dias Programados na Semana
              </label>
              <div class="grid grid-cols-7 gap-1">
                <For each={WEEKDAY_ITEMS}>
                  {(item) => (
                    <button
                      type="button"
                      onClick={() => toggleDay(item.key)}
                      class={`h-9 rounded-lg text-xs font-mono font-bold transition-all ${
                        selectedDays().includes(item.key)
                          ? 'bg-blue-500 text-white'
                          : 'bg-theme-elevated border border-theme-subtle text-theme-secondary'
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Selected Exercises in Routine */}
            <div>
              <label class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary block mb-1">
                Exercícios Selecionados ({selectedExercises().length})
              </label>
              <div class="space-y-1.5 max-h-40 overflow-y-auto mb-2">
                <For
                  each={selectedExercises()}
                  fallback={
                    <div class="p-3 rounded-lg bg-theme-elevated text-theme-tertiary text-xs font-mono text-center">
                      Nenhum exercício adicionado ainda.
                    </div>
                  }
                >
                  {(re, idx) => {
                    const ex = EXERCISE_CATALOG.find((e) => e.id === re.exerciseId);
                    return (
                      <div class="p-2 rounded-lg bg-theme-elevated border border-theme-subtle flex items-center justify-between text-xs">
                        <span class="text-theme-primary font-medium">
                          {ex?.name ?? re.exerciseId}
                        </span>
                        <div class="flex items-center gap-2">
                          <span class="text-theme-secondary font-mono">
                            {re.targetSets} séries
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExercise(idx())}
                            class="text-rose-500 hover:opacity-80 active:scale-95 p-1"
                            aria-label="Remover exercício"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>

            {/* Catalog Picker */}
            <div>
              <label class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary block mb-1">
                Adicionar Exercício do Catálogo
              </label>
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={exerciseSearch()}
                onInput={(e) => setExerciseSearch(e.currentTarget.value)}
                class="w-full h-9 px-3 rounded-lg bg-theme-elevated border border-theme-subtle text-xs text-theme-primary placeholder-theme-tertiary mb-2 focus:outline-none"
              />
              <div class="max-h-36 overflow-y-auto divide-y divide-theme-subtle bg-theme-elevated rounded-xl border border-theme-subtle">
                <For each={filteredCatalog()}>
                  {(ex) => (
                    <button
                      type="button"
                      onClick={() => addExercise(ex.id)}
                      class="w-full p-2 text-left hover:bg-theme-surface text-xs flex items-center justify-between"
                      data-testid={`catalog-item-${ex.id}`}
                    >
                      <span class="text-theme-primary font-medium">{ex.name}</span>
                      <span class="text-[10px] font-mono text-blue-500 font-semibold">+ Adicionar</span>
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Save & Cancel Actions */}
            <div class="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                class="flex-1 h-11 rounded-xl bg-theme-elevated text-theme-secondary hover:text-theme-primary text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRoutine}
                disabled={!name().trim() || selectedExercises().length === 0}
                class="flex-1 h-11 rounded-xl bg-emerald-500 disabled:opacity-40 text-neutral-950 text-xs font-bold shadow-md shadow-emerald-950/40"
                data-testid="btn-save-routine"
              >
                Salvar Rotina
              </button>
            </div>
          </div>
        </Show>
      </div>
    </BottomSheet>
  );
};
