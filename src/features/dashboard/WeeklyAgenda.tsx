import { For, type Component } from 'solid-js';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession } from '../../domain/session';
import type { Weekday } from '../../domain/types';

export interface WeeklyAgendaProps {
  routines: readonly Routine[];
  sessions: readonly WorkoutSession[];
  /** Opens the routine preview; starting a workout stays an explicit action. */
  onSelectRoutine?: (routine: Routine) => void;
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

const WEEKDAY_SHORT: Record<Weekday, string> = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
};

const WEEKDAY_FULL: Record<Weekday, string> = {
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
        shortName: WEEKDAY_SHORT[key],
        fullName: WEEKDAY_FULL[key],
        dayNumber: dayDate.getDate(),
        dateStr,
        isToday,
        completedSession,
        scheduledRoutine,
      };
    });
  };

  return (
    <div class="weekly-agenda" data-testid="weekly-agenda">
      <For each={daysInfo()}>
        {(item) => {
          const routineName = () => {
            if (item.completedSession) {
              return item.completedSession.routineName ?? 'Treino Concluído';
            }
            if (item.scheduledRoutine) {
              return item.scheduledRoutine.name;
            }
            return 'Descanso';
          };

          const statusText = () => {
            if (item.completedSession) return '✓ Concluído';
            if (item.isToday) return 'Pendente';
            if (item.scheduledRoutine) return 'Programado';
            return 'Livre';
          };

          return (
            <div
              class={`agenda-day-row ${item.isToday ? 'today' : ''} ${item.scheduledRoutine && !item.completedSession ? 'cursor-pointer active:opacity-75 transition-opacity' : ''}`}
              data-testid={`agenda-day-${item.key}`}
              onClick={() => {
                if (!item.completedSession && item.scheduledRoutine && props.onSelectRoutine) {
                  props.onSelectRoutine(item.scheduledRoutine);
                }
              }}
            >
              <span class="agenda-day-name">
                {item.isToday ? 'Hoje' : item.shortName}
                <span class="sr-only"> ({item.fullName})</span>
              </span>

              <span class="agenda-routine-tag">
                {routineName()}
              </span>

              <span
                class={`agenda-status ${item.completedSession ? 'done' : ''}`}
                style={item.isToday && !item.completedSession ? { color: 'var(--accent)' } : undefined}
                data-testid={`btn-start-scheduled-${item.key}`}
              >
                {statusText()}
              </span>
            </div>
          );
        }}
      </For>
    </div>
  );
};

