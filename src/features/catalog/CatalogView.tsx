import { createSignal, For, Show, type Component } from 'solid-js';
import { EXERCISE_CATALOG } from '../../catalog/exercises';
import { formatMuscleName, formatEquipmentName, MUSCLE_NAME_PT } from '../../catalog/muscles';
import { BodyHighlighter } from '../../components/BodyHighlighter';
import type { MuscleGroup } from '../../domain/types';

export const CatalogView: Component = () => {
  const [search, setSearch] = createSignal('');
  const [selectedMuscle, setSelectedMuscle] = createSignal<string | null>(null);
  const [expandedId, setExpandedId] = createSignal<string | null>(null);

  const muscleFilterList = Object.keys(MUSCLE_NAME_PT) as MuscleGroup[];

  const filteredExercises = () => {
    const q = search().trim().toLowerCase();
    const mFilter = selectedMuscle();

    return EXERCISE_CATALOG.filter((ex) => {
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscles.some((m) => formatMuscleName(m).toLowerCase().includes(q));

      const matchesMuscle = !mFilter || ex.primaryMuscles.includes(mFilter as MuscleGroup);

      return matchesSearch && matchesMuscle;
    });
  };

  return (
    <div
      class="w-full min-h-[100dvh] bg-theme-bg text-theme-primary pb-24 p-4 flex flex-col gap-4 select-none theme-transition"
      data-testid="catalog-view"
    >
      {/* Header */}
      <header class="pt-2 pb-1 border-b border-theme-subtle">
        <h1 class="text-xl font-bold tracking-tight text-theme-primary">Catálogo de Exercícios</h1>
        <span class="text-xs text-theme-secondary font-mono">+1.300 movimentos catalogados</span>
      </header>

      {/* Search Input */}
      <div class="relative">
        <input
          type="text"
          placeholder="Buscar por nome ou músculo..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="w-full h-11 px-4 pl-10 rounded-2xl bg-theme-surface border border-theme-separator text-xs text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-all"
          data-testid="input-catalog-search"
        />
        <svg
          class="w-4 h-4 absolute left-3.5 top-3.5 text-theme-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Muscle Filter Scrollable Chips */}
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedMuscle(null)}
          class={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedMuscle() === null
              ? 'bg-theme-accent text-white shadow-sm'
              : 'bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Todos
        </button>
        <For each={muscleFilterList}>
          {(m) => (
            <button
              type="button"
              onClick={() => setSelectedMuscle(selectedMuscle() === m ? null : m)}
              class={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMuscle() === m
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {formatMuscleName(m)}
            </button>
          )}
        </For>
      </div>

      {/* Exercise Cards */}
      <div class="flex flex-col gap-2">
        <For
          each={filteredExercises()}
          fallback={
            <div class="py-12 text-center text-xs text-theme-tertiary font-mono">
              Nenhum exercício encontrado.
            </div>
          }
        >
          {(ex) => {
            const isExpanded = () => expandedId() === ex.id;
            return (
              <div
                class="rounded-2xl bg-theme-surface border border-theme-separator p-3.5 transition-all cursor-pointer hover:border-theme-accent/40"
                onClick={() => setExpandedId(isExpanded() ? null : ex.id)}
                data-testid={`catalog-card-${ex.id}`}
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-bold text-theme-primary">{ex.name}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-theme-elevated text-theme-secondary">
                        {formatEquipmentName(ex.equipment)}
                      </span>
                      <For each={ex.primaryMuscles}>
                        {(m) => (
                          <span class="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">
                            {formatMuscleName(m)}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>

                  <span class="text-theme-tertiary text-sm font-mono">
                    {isExpanded() ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded Details */}
                <Show when={isExpanded()}>
                  <div class="mt-3 pt-3 border-t border-theme-subtle flex flex-col gap-3 animate-in fade-in duration-150">
                    <Show when={ex.instructions}>
                      <p class="text-xs text-theme-secondary leading-relaxed">
                        {ex.instructions}
                      </p>
                    </Show>

                    <div class="flex justify-center p-2 rounded-xl bg-theme-elevated/40 border border-theme-subtle">
                      <BodyHighlighter
                        primaryMuscles={ex.primaryMuscles}
                        secondaryMuscles={ex.secondaryMuscles}
                        view="both"
                        class="h-40"
                      />
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
