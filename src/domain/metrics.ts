import type { WorkoutSession } from './session';

export type StatsMetric = 'calories' | 'tonnage';

/**
 * Formata calorias estimadas para exibição amigável em português (ex: "~1.820 kcal" ou "0 kcal").
 */
export function formatCalories(kcal: number): string {
  const value = Math.max(0, Math.round(kcal));
  if (value === 0) return '0 kcal';
  return `~${value.toLocaleString('pt-BR')} kcal`;
}

/**
 * Formata volume total levantado / tonelagem em kg para exibição amigável em português (ex: "16.400 kg" ou "0 kg").
 */
export function formatTonnage(volumeKg: number): string {
  const value = Math.max(0, Math.round(volumeKg));
  if (value === 0) return '0 kg';
  return `${value.toLocaleString('pt-BR')} kg`;
}

export interface CurrentWeekStats {
  workoutCount: number;
  totalCalories: number;
  totalVolumeKg: number;
}

/**
 * Calcula os totais de treinos, calorias e tonelagem para a semana atual (de Segunda a Domingo),
 * perfeitamente alinhado com a visualização do Heatmap e da Agenda Semanal.
 */
export function calculateCurrentWeekStats(
  sessions: readonly WorkoutSession[],
  referenceDate: Date = new Date()
): CurrentWeekStats {
  // 0 = Monday, 6 = Sunday in ISO week
  const currentDayOfWeek = (referenceDate.getDay() + 6) % 7;

  const monday = new Date(referenceDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(referenceDate.getDate() - currentDayOfWeek);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const mondayStr = monday.toISOString().slice(0, 10);
  const sundayStr = sunday.toISOString().slice(0, 10);

  let workoutCount = 0;
  let totalCalories = 0;
  let totalVolumeKg = 0;

  for (const session of sessions) {
    const sessionDateStr = session.startedAt.slice(0, 10);
    if (sessionDateStr >= mondayStr && sessionDateStr <= sundayStr) {
      workoutCount++;
      totalCalories += session.estimatedCalories ?? 0;
      totalVolumeKg += session.totalVolumeKg ?? 0;
    }
  }

  return {
    workoutCount,
    totalCalories: Math.round(totalCalories),
    totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
  };
}
