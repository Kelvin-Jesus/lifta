import { createSignal, onMount, For, type Component } from 'solid-js';
import { Effect } from 'effect';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import type { WorkoutSession } from '../../domain/session';
import type { Routine } from '../../domain/routine';

export interface HistoryViewProps {
  onStartWorkout?: (routine: Routine) => void;
}

export const HistoryView: Component<HistoryViewProps> = (_props) => {
  const [sessions, setSessions] = createSignal<WorkoutSession[]>([]);

  onMount(async () => {
    const list = await Effect.runPromise(WorkoutSessionRepository.listAll());
    // Sort descending by startedAt
    setSessions([...list].sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  });

  const formatDatePT = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Hoje às ${timeStr}`;
      if (isYesterday) return `Ontem às ${timeStr}`;

      const day = d.getDate();
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const month = monthNames[d.getMonth()];
      return `${day} de ${month}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      class="tab-content"
      data-testid="history-view"
    >
      {/* Header */}
      <div>
        <h2 class="text-xl font-bold tracking-tight text-theme-primary">Histórico</h2>
      </div>

      {/* Grouped Inset List matching prototype */}
      <div class="inset-list">
        <For
          each={sessions()}
          fallback={
            <div class="py-12 text-center text-theme-secondary text-xs flex flex-col items-center gap-2">
              <svg class="w-8 h-8 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <polyline points="12 6 12 12 16 14" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <span>Nenhum treino concluído ainda.</span>
            </div>
          }
        >
          {(s) => (
            <div
              class="list-row"
              data-testid={`history-session-${s.id}`}
            >
              <div>
                <div class="row-title">
                  {s.routineName ?? 'Treino Livre'}
                </div>
                <div class="row-desc">
                  {formatDatePT(s.startedAt)} • {s.durationMinutes} min • ~{s.estimatedCalories} kcal est.
                </div>
              </div>

              <span class="row-arrow">›</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
