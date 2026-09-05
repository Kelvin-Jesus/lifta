import { For, Show, createSignal, type Component } from 'solid-js';
import { Effect } from 'effect';
import { BottomSheet } from '../../components/BottomSheet';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { EXERCISE_CATALOG } from '../../catalog/exercises';
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
                    <div class="py-8 text-center text-xs text-neutral-500 font-mono">
                      Nenhuma rotina criada ainda.
                    </div>
                  }
                >
                  {(routine) => (
                    <div
                      class="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                      data-testid={`routine-item-${routine.id}`}
                    >
                      <div>
                        <h4 class="text-sm font-bold text-neutral-100">{routine.name}</h4>
                        <div class="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-mono">
                          <span>{routine.exercises.length} exercícios</span>
                          <Show when={routine.scheduledDays && routine.scheduledDays.length > 0}>
                            <span>•</span>
                            <span class="text-blue-400">
                              {routine.scheduledDays!.map((d) => d.slice(0, 3)).join(', ')}
                            </span>
                          </Show>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        class="w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-950/40 flex items-center justify-center text-xs transition-colors"
                        title="Excluir rotina"
                        data-testid={`btn-delete-routine-${routine.id}`}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </For>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                class="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all"
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
              <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
                Nome da Rotina
              </label>
              <input
                type="text"
                placeholder="Ex: Treino A - Peito e Tríceps"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="w-full h-11 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                data-testid="input-routine-name"
              />
            </div>

            {/* Scheduled Days Selector */}
            <div>
              <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
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
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
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
              <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
                Exercícios Selecionados ({selectedExercises().length})
              </label>
              <div class="space-y-1.5 max-h-40 overflow-y-auto mb-2">
                <For
                  each={selectedExercises()}
                  fallback={
                    <div class="p-3 rounded-lg bg-neutral-950 text-neutral-500 text-xs font-mono text-center">
                      Nenhum exercício adicionado ainda.
                    </div>
                  }
                >
                  {(re, idx) => {
                    const ex = EXERCISE_CATALOG.find((e) => e.id === re.exerciseId);
                    return (
                      <div class="p-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                        <span class="text-neutral-200 font-medium">
                          {ex?.name ?? re.exerciseId}
                        </span>
                        <div class="flex items-center gap-2">
                          <span class="text-neutral-500 font-mono">
                            {re.targetSets} séries
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExercise(idx())}
                            class="text-rose-400 hover:text-rose-300 px-1"
                          >
                            ✕
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
              <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
                Adicionar Exercício do Catálogo
              </label>
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={exerciseSearch()}
                onInput={(e) => setExerciseSearch(e.currentTarget.value)}
                class="w-full h-9 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 mb-2 focus:outline-none"
              />
              <div class="max-h-36 overflow-y-auto divide-y divide-neutral-850 bg-neutral-950 rounded-xl border border-neutral-800">
                <For each={filteredCatalog()}>
                  {(ex) => (
                    <button
                      type="button"
                      onClick={() => addExercise(ex.id)}
                      class="w-full p-2 text-left hover:bg-neutral-800/40 text-xs flex items-center justify-between"
                      data-testid={`catalog-item-${ex.id}`}
                    >
                      <span class="text-neutral-200 font-medium">{ex.name}</span>
                      <span class="text-[10px] font-mono text-blue-400">+ Adicionar</span>
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
                class="flex-1 h-11 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
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
