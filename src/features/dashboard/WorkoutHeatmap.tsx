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

export function generateHeatmapGrid(sessions: readonly WorkoutSession[], numWeeks = 18): DayCell[][] {
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

  const totalDays = numWeeks * 7;
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
      if (calories < 250) level = 1;
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

export function generate12WeeksGrid(sessions: readonly WorkoutSession[]): DayCell[][] {
  return generateHeatmapGrid(sessions, 12);
}

export interface WorkoutHeatmapProps {
  sessions: readonly WorkoutSession[];
  numWeeks?: number;
  onSelectDate?: (dateStr: string, daySessions: WorkoutSession[]) => void;
}

export const WorkoutHeatmap: Component<WorkoutHeatmapProps> = (props) => {
  const [selectedCell, setSelectedCell] = createSignal<DayCell | null>(null);

  const numWeeks = () => props.numWeeks ?? 18;
  const weeks = () => generateHeatmapGrid(props.sessions, numWeeks());

  const getCellClass = (level: number) => {
    switch (level) {
      case 1: return 'l1';
      case 2: return 'l2';
      case 3: return 'l3';
      case 4: return 'l4';
      default: return '';
    }
  };

  return (
    <div id="heatmap-view-wrapper" data-testid="workout-heatmap">
      <div
        class="heatmap-grid"
        id="heatmap-grid"
        aria-label="Histórico de treinos e calorias"
        style={{
          "grid-template-columns": `repeat(${weeks().length}, minmax(0, 1fr))`,
        }}
      >
        <For each={weeks().flat()}>
          {(cell) => (
            <button
              type="button"
              onClick={() => {
                setSelectedCell(cell);
                if (props.onSelectDate) {
                  props.onSelectDate(cell.dateStr, cell.sessions);
                }
              }}
              class={`heat-cell ${getCellClass(cell.level)} ${
                selectedCell()?.dateStr === cell.dateStr
                  ? 'ring-2 ring-white/80 scale-125 z-10'
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

      <div class="heatmap-legend" style="margin-top: 10px;">
        <span>Menos</span>
        <div class="legend-box" title="Sem treino"></div>
        <div class="legend-box l1" title="~150-250 kcal"></div>
        <div class="legend-box l2" title="~250-400 kcal"></div>
        <div class="legend-box l3" title="~400-600 kcal"></div>
        <div class="legend-box l4" title=">600 kcal"></div>
        <span>Mais calorias</span>
      </div>

      {/* Selected Date Details Pill */}
      <Show when={selectedCell()}>
        <div
          class="mt-3 p-2.5 rounded-xl bg-theme-elevated border border-theme-subtle text-xs flex items-center justify-between"
          data-testid="heatmap-detail-card"
        >
          <div>
            <span class="text-theme-secondary text-[10px] block">
              {selectedCell()?.dateStr}
            </span>
            <Show
              when={selectedCell()!.sessions.length > 0}
              fallback={<span class="text-theme-tertiary">Descanso / Sem treino registrado</span>}
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
            <span class="text-emerald-400 font-bold text-sm">
              {selectedCell()?.calories} kcal
            </span>
            <span class="text-[9px] uppercase text-theme-tertiary block">estimadas</span>
          </div>
        </div>
      </Show>
    </div>
  );
};

