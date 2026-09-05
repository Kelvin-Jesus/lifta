import { For, Show, createSignal, type Component } from 'solid-js';
import type { WorkoutSession } from '../../domain/session';

export interface WorkoutHeatmapProps {
  sessions: readonly WorkoutSession[];
  onSelectDate?: (dateStr: string, daySessions: WorkoutSession[]) => void;
}

export interface DayCell {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Mon, 6 = Sun
  calories: number;
  sessions: WorkoutSession[];
  level: 0 | 1 | 2 | 3 | 4;
}

export function generate12WeeksGrid(sessions: readonly WorkoutSession[]): DayCell[][] {
  const sessionsByDate = new Map<string, WorkoutSession[]>();
  for (const s of sessions) {
    const d = s.startedAt.slice(0, 10);
    const list = sessionsByDate.get(d) ?? [];
    list.push(s);
    sessionsByDate.set(d, list);
  }

  // End on current date, aligned to end of week (Sunday)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - dayOfWeek));

  const totalDays = 12 * 7; // 84 days
  const startDate = new Date(endOfWeek);
  startDate.setDate(endOfWeek.getDate() - totalDays + 1);

  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const dateStr = d.toISOString().slice(0, 10);
    const daySessions = sessionsByDate.get(dateStr) ?? [];
    const calories = daySessions.reduce((acc, s) => acc + s.estimatedCalories, 0);

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (calories > 0) {
      if (calories < 200) level = 1;
      else if (calories < 400) level = 2;
      else if (calories < 600) level = 3;
      else level = 4;
    }

    currentWeek.push({
      dateStr,
      dayOfWeek: (d.getDay() + 6) % 7,
      calories,
      sessions: daySessions,
      level,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}

export const WorkoutHeatmap: Component<WorkoutHeatmapProps> = (props) => {
  const [selectedCell, setSelectedCell] = createSignal<DayCell | null>(null);

  const weeks = () => generate12WeeksGrid(props.sessions);

  const getCellColorClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950/80 border-emerald-800/50';
      case 2:
        return 'bg-emerald-700/80 border-emerald-600/60';
      case 3:
        return 'bg-emerald-500 border-emerald-400/70';
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/30';
      default:
        return 'bg-theme-elevated/80 border-theme-subtle hover:border-theme-separator';
    }
  };

  const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  return (
    <div
      class="w-full bg-theme-surface border border-theme-separator rounded-2xl p-4 select-none theme-transition"
      data-testid="workout-heatmap"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Consistência & Queima (12 Semanas)
        </h3>

        {/* Legend */}
        <div class="flex items-center gap-1 text-[10px] text-theme-tertiary font-mono">
          <span>Menos</span>
          <div class="w-2.5 h-2.5 rounded-xs bg-theme-elevated border border-theme-subtle" />
          <div class="w-2.5 h-2.5 rounded-xs bg-emerald-950/80 border border-emerald-800" />
          <div class="w-2.5 h-2.5 rounded-xs bg-emerald-700 border border-emerald-600" />
          <div class="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-400" />
          <div class="w-2.5 h-2.5 rounded-xs bg-emerald-400 border border-emerald-300" />
          <span>Mais</span>
        </div>
      </div>

      {/* Grid: 7 rows x 12 columns */}
      <div class="overflow-x-auto pb-1">
        <div class="inline-flex items-center gap-1.5">
          {/* Day of week labels */}
          <div class="flex flex-col gap-1 text-[9px] font-mono text-theme-tertiary pr-1 select-none">
            <For each={dayLabels}>
              {(label) => <span class="w-3 h-3 flex items-center justify-center leading-none">{label}</span>}
            </For>
          </div>

          {/* 12 Columns */}
          <div class="flex gap-1">
            <For each={weeks()}>
              {(week, wIdx) => (
                <div class="flex flex-col gap-1" data-testid={`heatmap-week-${wIdx()}`}>
                  <For each={week}>
                    {(cell) => (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCell(cell);
                          if (props.onSelectDate) {
                            props.onSelectDate(cell.dateStr, cell.sessions);
                          }
                        }}
                        class={`w-3 h-3 rounded-[2px] border transition-all cursor-pointer ${getCellColorClass(
                          cell.level
                        )} ${
                          selectedCell()?.dateStr === cell.dateStr
                            ? 'ring-2 ring-theme-primary scale-125 z-10'
                            : ''
                        }`}
                        title={`${cell.dateStr}: ${cell.calories} kcal (${cell.sessions.length} treino)`}
                        data-testid={`cell-${cell.dateStr}`}
                        data-calories={cell.calories}
                        data-level={cell.level}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Selected Date Details Pill */}
      <Show when={selectedCell()}>
        <div
          class="mt-3 p-2.5 rounded-xl bg-theme-elevated border border-theme-subtle text-xs flex items-center justify-between animate-in fade-in duration-150"
          data-testid="heatmap-detail-card"
        >
          <div>
            <span class="font-mono text-theme-secondary text-[10px] block">
              {selectedCell()?.dateStr}
            </span>
            <Show
              when={selectedCell()!.sessions.length > 0}
              fallback={<span class="text-theme-tertiary font-mono">Descanso / Sem treino registrado</span>}
            >
              <span class="font-bold text-theme-primary">
                {selectedCell()!.sessions[0].routineName ?? 'Treino Realizado'}
              </span>
              <span class="text-theme-secondary text-[11px] ml-2">
                • {selectedCell()!.sessions[0].durationMinutes} min
              </span>
            </Show>
          </div>

          <div class="text-right">
            <span class="text-emerald-400 font-mono font-bold text-sm">
              {selectedCell()?.calories} kcal
            </span>
            <span class="text-[9px] uppercase font-mono text-theme-tertiary block">estimadas</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
