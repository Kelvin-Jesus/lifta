import { createSignal, onMount, For, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { RoutineManagerSheet } from '../dashboard/RoutineManagerSheet';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';
import type { Routine } from '../../domain/routine';

export interface RoutinesViewProps {
  onStartWorkout: (routine: Routine) => void;
}

export const RoutinesView: Component<RoutinesViewProps> = (props) => {
  const [routines, setRoutines] = createSignal<Routine[]>([]);
  const [isSheetOpen, setIsSheetOpen] = createSignal(false);

  const loadRoutines = async () => {
    const list = await Effect.runPromise(RoutineRepository.listAll());
    setRoutines(list);
  };

  onMount(() => {
    loadRoutines();
  });

  const handleDelete = async (id: string) => {
    await Effect.runPromise(RoutineRepository.delete(id));
    loadRoutines();
  };

  const formatDays = (days?: readonly string[]) => {
    if (!days || days.length === 0) return '';
    const map: Record<string, string> = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom',
    };
    return days.map((d) => map[d] ?? d).join(', ');
  };

  const getExercisesSummary = (routine: Routine) => {
    const names = routine.exercises
      .map((re) => getExerciseById(EXERCISE_CATALOG, re.exerciseId)?.name ?? '')
      .filter(Boolean)
      .slice(0, 3);
    return names.length > 0 ? names.join(', ') + '...' : '';
  };

  return (
    <div
      class="tab-content"
      data-testid="routines-view"
    >
      {/* Header */}
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold tracking-tight text-theme-primary">Minhas Fichas</h2>
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          class="icon-btn"
          style={{ width: 'auto', padding: '0 14px', 'border-radius': '12px', 'font-size': '0.8rem', 'font-weight': '600' }}
          data-testid="btn-add-routine-view"
        >
          + Nova
        </button>
      </div>

      {/* Grouped Inset List matching prototype */}
      <div class="inset-list">
        <For
          each={routines()}
          fallback={
            <div class="py-12 text-center text-theme-secondary text-xs flex flex-col items-center gap-3">
              <span>Nenhuma ficha criada ainda.</span>
              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                class="px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs active:scale-95 transition-transform"
              >
                + Criar Primeira Ficha
              </button>
            </div>
          }
        >
          {(routine) => (
            <div
              class="list-row group"
              data-testid={`routine-card-${routine.id}`}
            >
              <div
                class="flex-1 pr-2 cursor-pointer"
                onClick={() => props.onStartWorkout(routine)}
              >
                <div class="row-title">{routine.name}</div>
                <div class="row-desc">
                  <span>{routine.exercises.length} exercícios</span>
                  <Show when={formatDays(routine.scheduledDays)}>
                    <span> • </span>
                    <span class="text-theme-accent font-medium">{formatDays(routine.scheduledDays)}</span>
                  </Show>
                  <Show when={getExercisesSummary(routine)}>
                    <span> • </span>
                    <span>{getExercisesSummary(routine)}</span>
                  </Show>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => props.onStartWorkout(routine)}
                  class="sr-only"
                  data-testid={`btn-start-routine-${routine.id}`}
                  aria-label={`Iniciar ${routine.name}`}
                >
                  Treinar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(routine.id);
                  }}
                  class="w-6 h-6 rounded-md text-theme-tertiary hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Excluir ficha"
                  aria-label="Excluir ficha"
                  data-testid={`btn-delete-card-${routine.id}`}
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span
                  class="row-arrow cursor-pointer"
                  onClick={() => props.onStartWorkout(routine)}
                >
                  ›
                </span>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Routine Manager Sheet */}
      <RoutineManagerSheet
        isOpen={isSheetOpen()}
        onClose={() => setIsSheetOpen(false)}
        routines={routines()}
        onRoutinesUpdated={loadRoutines}
      />
    </div>
  );
};
