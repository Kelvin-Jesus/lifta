import { createSignal, onMount, For, type Component } from 'solid-js';
import { Effect } from 'effect';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import type { WorkoutSession } from '../../domain/session';

export const HistoryView: Component = () => {
  const [sessions, setSessions] = createSignal<WorkoutSession[]>([]);

  onMount(async () => {
    const list = await Effect.runPromise(WorkoutSessionRepository.listAll());
    // Sort descending by startedAt
    setSessions([...list].sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  });

  const totalCalories = () => sessions().reduce((acc, s) => acc + (s.estimatedCalories || 0), 0);
  const totalMinutes = () => sessions().reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const formatDatePT = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      class="w-full min-h-[100dvh] bg-theme-bg text-theme-primary pb-24 p-4 flex flex-col gap-4 select-none theme-transition"
      data-testid="history-view"
    >
      {/* Header */}
      <header class="pt-2 pb-1 border-b border-theme-subtle">
        <h1 class="text-xl font-bold tracking-tight text-theme-primary">Histórico</h1>
        <span class="text-xs text-theme-secondary font-mono">Linha do tempo de sessões concluídas</span>
      </header>

      {/* Summary KPI Cards */}
      <div class="grid grid-cols-3 gap-2.5">
        <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center justify-center">
          <span class="text-base font-bold font-mono text-theme-primary">{sessions().length}</span>
          <span class="text-[10px] uppercase font-mono text-theme-secondary">Treinos</span>
        </div>
        <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center justify-center">
          <span class="text-base font-bold font-mono text-emerald-500">{totalCalories()}</span>
          <span class="text-[10px] uppercase font-mono text-theme-secondary">kcal</span>
        </div>
        <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center justify-center">
          <span class="text-base font-bold font-mono text-theme-accent">{Math.round(totalMinutes() / 60)}h</span>
          <span class="text-[10px] uppercase font-mono text-theme-secondary">Tempo</span>
        </div>
      </div>

      {/* Sessions List */}
      <div class="flex flex-col gap-2.5">
        <For
          each={sessions()}
          fallback={
            <div class="py-16 text-center text-theme-tertiary font-mono text-xs flex flex-col items-center gap-2">
              <svg class="w-8 h-8 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke-width="1.5" />
                <polyline points="12 7 12 12 15 14" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Nenhum treino concluído ainda.
              <span class="text-[11px] text-theme-secondary">
                Seus treinos finalizados aparecerão aqui automaticamente.
              </span>
            </div>
          }
        >
          {(s) => (
            <div
              class="p-4 rounded-2xl bg-theme-surface border border-theme-separator flex items-center justify-between transition-all"
              data-testid={`history-session-${s.id}`}
            >
              <div>
                <h3 class="text-sm font-bold text-theme-primary mb-1">
                  {s.routineName ?? 'Treino Livre'}
                </h3>
                <div class="flex items-center gap-2 text-xs text-theme-secondary font-mono">
                  <span>{formatDatePT(s.startedAt)}</span>
                  <span>•</span>
                  <span>{s.durationMinutes} min</span>
                  <span>•</span>
                  <span>{s.exercises.length} exercícios</span>
                </div>
              </div>

              <div class="text-right">
                <span class="text-emerald-500 font-mono font-bold text-sm block">
                  {s.estimatedCalories} kcal
                </span>
                <span class="text-[9px] uppercase font-mono text-theme-tertiary block">estimadas</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
