import { LoggedExercise } from './session';

export interface CalorieCalculationInput {
  bodyWeightKg?: number;
  durationMinutes: number;
  isVigorous?: boolean;
  hasCardio?: boolean;
}

export const MET_VALUES = {
  RESISTANCE_MODERATE: 3.8,
  RESISTANCE_VIGOROUS: 6.0,
  CARDIO_MODERATE: 7.5,
  DEFAULT_BODY_WEIGHT_KG: 75.0,
} as const;

/**
 * Calcula o gasto calórico estimado de forma 100% determinística e offline
 * baseando-se no Compêndio de Atividades Físicas (Ainsworth et al. - Equações de MET).
 *
 * Fórmula: Calorias = (MET * 3.5 * pesoKg / 200) * duracaoMinutos
 */
export function calculateEstimatedCalories(input: CalorieCalculationInput): number {
  const weight = input.bodyWeightKg && input.bodyWeightKg > 0
    ? input.bodyWeightKg
    : MET_VALUES.DEFAULT_BODY_WEIGHT_KG;

  const duration = Math.max(0, input.durationMinutes);
  if (duration === 0) return 0;

  let met: number = MET_VALUES.RESISTANCE_MODERATE;
  if (input.hasCardio) {
    met = MET_VALUES.CARDIO_MODERATE;
  } else if (input.isVigorous) {
    met = MET_VALUES.RESISTANCE_VIGOROUS;
  }

  const kcal = ((met * 3.5 * weight) / 200) * duration;
  return Math.round(kcal);
}

/**
 * Calcula o volume total levantado em kg (somatório de pesoKg * reps de séries concluídas).
 */
export function calculateTotalVolumeKg(exercises: readonly LoggedExercise[]): number {
  let totalVolume = 0;

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.completed && set.type === 'resistance') {
        totalVolume += set.weightKg * set.reps;
      }
    }
  }

  return Math.round(totalVolume * 10) / 10;
}
