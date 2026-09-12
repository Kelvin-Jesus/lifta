import { createEffect, createSignal, For, Show, type Component } from 'solid-js';
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
      class="tab-content"
      data-testid="catalog-view"
    >
      {/* Header */}
      <div class="shrink-0">
        <h2 class="text-xl font-bold tracking-tight text-theme-primary">Catálogo<span class="sr-only"> de Exercícios</span></h2>
      </div>

      {/* Search Input */}
      <div class="relative shrink-0">
        <input
          type="text"
          placeholder="Buscar exercício por nome ou músculo…"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="w-full h-[42px] px-4 pl-10 rounded-xl bg-theme-surface border border-theme-subtle text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-all"
          data-testid="input-catalog-search"
        />
        <svg
          class="w-4 h-4 absolute left-3.5 top-3 text-theme-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Muscle Filter Scrollable Chips - with shrink-0 and catalog-chip */}
      <div class="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setSelectedMuscle(null)}
          class={`catalog-chip ${selectedMuscle() === null ? 'active' : ''}`}
        >
          Todos
        </button>
        <For each={muscleFilterList}>
          {(m) => (
            <button
              type="button"
              onClick={() => setSelectedMuscle(selectedMuscle() === m ? null : m)}
              class={`catalog-chip ${selectedMuscle() === m ? 'active' : ''}`}
            >
              {formatMuscleName(m)}
            </button>
          )}
        </For>
      </div>

      {/* Grouped Inset List */}
      <div class="inset-list">
        <For
          each={filteredExercises()}
          fallback={
            <div class="py-12 text-center text-xs text-theme-secondary">
              Nenhum exercício encontrado.
            </div>
          }
        >
          {(ex) => {
            const isExpanded = () => expandedId() === ex.id;
            // Heavy accordion content (GIF + anatomy SVG) is mounted on first
            // expand and kept afterwards: mounting all of it up front costs a
            // ~230 ms main-thread task on a low-end phone, and the CSS grid
            // animation still runs because the mount happens in the same tick
            // as the class change.
            const [hasExpanded, setHasExpanded] = createSignal(false);
            createEffect(() => {
              if (isExpanded()) setHasExpanded(true);
            });
            return (
              <div
                class="list-row flex-col items-stretch !gap-3"
                onClick={() => setExpandedId(isExpanded() ? null : ex.id)}
                data-testid={`catalog-card-${ex.id}`}
              >
                <div class="flex items-center justify-between w-full cursor-pointer" aria-expanded={isExpanded()}>
                  <div>
                    <div class="row-title">{ex.name}</div>
                    <div class="row-desc">
                      {ex.primaryMuscles.map(m => formatMuscleName(m)).join(', ')} • {formatEquipmentName(ex.equipment)}
                    </div>
                  </div>

                  <svg
                    class={`w-4 h-4 text-theme-tertiary catalog-chevron flex-shrink-0 ${
                      isExpanded() ? 'expanded' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-testid={`catalog-chevron-${ex.id}`}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Expanded Details with Animated GIF & Anatomy (Smooth CSS Grid Accordion) */}
                <div
                  class={`catalog-accordion-grid w-full ${isExpanded() ? 'expanded' : ''}`}
                  data-testid={`catalog-accordion-${ex.id}`}
                  aria-hidden={!isExpanded()}
                >
                  <div class="catalog-accordion-inner w-full">
                    <Show when={hasExpanded()}>
                      <div
                        class="pt-3 border-t border-theme-subtle flex flex-col gap-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                      {/* Exercise Motion Demo GIF */}
                      <Show when={ex.gifUrl}>
                        <div class="relative w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-theme-subtle flex flex-col items-center justify-center p-3">
                          {/* Fixed media box: the remote gif arrives after the
                              accordion has opened, and without reserved space
                              its arrival reflows the whole list. */}
                          <div class="h-60 w-full flex items-center justify-center">
                            <img
                              src={ex.gifUrl}
                              alt={`Demonstração de execução: ${ex.name}`}
                              class="max-h-60 max-w-full w-auto object-contain rounded-xl shadow-xs"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-theme-secondary">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Demonstração do Movimento</span>
                          </div>
                        </div>
                      </Show>

                      {/* Step by step instructions */}
                      <Show when={ex.instructions}>
                        <div class="p-3 rounded-xl bg-theme-elevated/40 border border-theme-subtle">
                          <span class="text-[10px] uppercase font-bold tracking-wider text-theme-tertiary block mb-1">
                            Instruções de Execução
                          </span>
                          <p class="text-xs text-theme-primary leading-relaxed">
                            {ex.instructions}
                          </p>
                        </div>
                      </Show>

                      {/* Muscle Groups & Anatomy */}
                      <div class="p-3 rounded-xl bg-theme-elevated/40 border border-theme-subtle flex flex-col items-center gap-2">
                        <span class="text-[10px] uppercase font-bold tracking-wider text-theme-tertiary block self-start">
                          Músculos Alvo
                        </span>
                        <BodyHighlighter
                          primaryMuscles={ex.primaryMuscles}
                          secondaryMuscles={ex.secondaryMuscles}
                          view="both"
                          class="h-44"
                        />
                        <div class="flex flex-wrap gap-1.5 justify-center mt-1">
                          <For each={ex.primaryMuscles}>
                            {(m) => (
                              <span class="muscle-badge">
                                {formatMuscleName(m)} (Primário)
                              </span>
                            )}
                          </For>
                          <For each={ex.secondaryMuscles}>
                            {(m) => (
                              <span class="muscle-badge-secondary">
                                {formatMuscleName(m)}
                              </span>
                            )}
                          </For>
                          </div>
                        </div>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
