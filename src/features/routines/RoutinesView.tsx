import { createSignal, onMount, For, type Component } from 'solid-js';
import { Effect } from 'effect';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { RoutineManagerSheet } from '../dashboard/RoutineManagerSheet';
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
    if (!days || days.length === 0) return 'Dias livres';
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

  return (
    <div
      class="w-full min-h-[100dvh] bg-theme-bg text-theme-primary pb-24 p-4 flex flex-col gap-4 select-none theme-transition"
      data-testid="routines-view"
    >
      {/* Header */}
      <header class="pt-2 pb-1 border-b border-theme-subtle flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-theme-primary">Minhas Fichas</h1>
          <span class="text-xs text-theme-secondary font-mono">Rotinas de treino estruturadas</span>
        </div>

        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          class="h-9 px-3.5 rounded-xl bg-theme-accent text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
          data-testid="btn-add-routine-view"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nova Ficha
        </button>
      </header>

      {/* Routines List */}
      <div class="flex flex-col gap-3">
        <For
          each={routines()}
          fallback={
            <div class="py-16 text-center text-theme-tertiary font-mono text-xs flex flex-col items-center gap-3">
              <svg class="w-10 h-10 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Nenhuma ficha criada ainda.
              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                class="px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
              >
                + Criar Primeira Ficha
              </button>
            </div>
          }
        >
          {(routine) => (
            <div
              class="p-4 rounded-2xl bg-theme-surface border border-theme-separator flex flex-col gap-3 transition-all"
              data-testid={`routine-card-${routine.id}`}
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-base font-bold text-theme-primary">{routine.name}</h3>
                  <div class="flex items-center gap-2 mt-1 text-xs text-theme-secondary font-mono">
                    <span class="text-blue-500 font-semibold">{formatDays(routine.scheduledDays)}</span>
                    <span>•</span>
                    <span>{routine.exercises.length} exercícios</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(routine.id)}
                  class="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-500/10 active:scale-95 flex items-center justify-center transition-all"
                  title="Excluir ficha"
                  aria-label="Excluir ficha"
                  data-testid={`btn-delete-card-${routine.id}`}
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Start Workout Button */}
              <button
                type="button"
                onClick={() => props.onStartWorkout(routine)}
                class="w-full h-11 rounded-xl bg-theme-elevated hover:opacity-90 active:scale-[0.98] border border-theme-subtle text-xs font-bold text-theme-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
                data-testid={`btn-start-routine-${routine.id}`}
              >
                <svg class="w-4 h-4 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar Este Treino
              </button>
            </div>
          )}
        </For>
      </div>

      {/* Routine Manager Sheet for creating/editing */}
      <RoutineManagerSheet
        isOpen={isSheetOpen()}
        onClose={() => setIsSheetOpen(false)}
        routines={routines()}
        onRoutinesUpdated={loadRoutines}
      />
    </div>
  );
};
