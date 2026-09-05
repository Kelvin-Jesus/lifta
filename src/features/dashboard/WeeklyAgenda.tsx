import { For, Show, type Component } from 'solid-js';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession } from '../../domain/session';
import type { Weekday } from '../../domain/types';

export interface WeeklyAgendaProps {
  routines: readonly Routine[];
  sessions: readonly WorkoutSession[];
  onStartRoutine?: (routine: Routine) => void;
}

const WEEKDAY_KEYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const WEEKDAY_NAMES: Record<Weekday, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const WeeklyAgenda: Component<WeeklyAgendaProps> = (props) => {
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  // Calculate Monday date of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);

  const daysInfo = () => {
    return WEEKDAY_KEYS.map((key, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dateStr = dayDate.toISOString().slice(0, 10);
      const isToday = index === currentDayOfWeek;

      // Find session completed on this day
      const completedSession = props.sessions.find(
        (s) => s.startedAt.slice(0, 10) === dateStr
      );

      // Find scheduled routine for this day of week
      const scheduledRoutine = props.routines.find((r) =>
        r.scheduledDays?.includes(key)
      );

      return {
        key,
        name: WEEKDAY_NAMES[key],
        dayNumber: dayDate.getDate(),
        dateStr,
        isToday,
        completedSession,
        scheduledRoutine,
      };
    });
  };

  return (
    <div
      class="w-full bg-theme-surface border border-theme-separator rounded-2xl p-4 select-none theme-transition"
      data-testid="weekly-agenda"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Agenda Semanal
        </h3>
        <span class="text-[10px] font-mono text-theme-tertiary">Semana Atual</span>
      </div>

      <div class="space-y-2">
        <For each={daysInfo()}>
          {(item) => (
            <div
              class={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                item.isToday
                  ? 'bg-theme-elevated border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-theme-surface border-theme-subtle hover:border-theme-separator'
              }`}
              data-testid={`agenda-day-${item.key}`}
            >
              {/* Day Header */}
              <div class="flex items-center gap-2.5">
                <div
                  class={`w-8 h-8 rounded-lg flex flex-col items-center justify-center font-mono ${
                    item.isToday
                      ? 'bg-blue-500 text-white font-bold shadow-sm'
                      : 'bg-theme-elevated text-theme-secondary'
                  }`}
                >
                  <span class="text-[9px] uppercase leading-none">{item.name.slice(0, 1)}</span>
                  <span class="text-xs font-bold leading-none">{item.dayNumber}</span>
                </div>

                <div>
                  <span class={`text-xs font-semibold block ${item.isToday ? 'text-theme-primary' : 'text-theme-secondary'}`}>
                    {item.name}
                  </span>
                  <Show
                    when={item.completedSession}
                    fallback={
                      <Show
                        when={item.scheduledRoutine}
                        fallback={
                          <span class="text-[11px] text-theme-tertiary font-mono">
                            Descanso planejado
                          </span>
                        }
                      >
                        <span class="text-[11px] text-blue-500 font-medium">
                          {item.scheduledRoutine!.name}
                        </span>
                      </Show>
                    }
                  >
                    <span class="text-[11px] text-emerald-500 font-medium">
                      {item.completedSession!.routineName ?? 'Treino Concluído'} •{' '}
                      {item.completedSession!.durationMinutes} min
                    </span>
                  </Show>
                </div>
              </div>

              {/* Status Badge or Action */}
              <div>
                <Show
                  when={item.completedSession}
                  fallback={
                    <Show when={item.scheduledRoutine && props.onStartRoutine}>
                      <button
                        type="button"
                        onClick={() => props.onStartRoutine!(item.scheduledRoutine!)}
                        class="h-7 px-2.5 rounded-lg bg-theme-elevated hover:opacity-90 active:scale-95 text-[11px] font-semibold text-blue-500 border border-theme-subtle transition-all"
                        data-testid={`btn-start-scheduled-${item.key}`}
                      >
                        Treinar
                      </button>
                    </Show>
                  }
                >
                  <div class="flex items-center gap-1 text-emerald-400 text-xs font-semibold font-mono">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item.completedSession!.estimatedCalories} kcal</span>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
