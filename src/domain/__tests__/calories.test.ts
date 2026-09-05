import { describe, it, expect } from 'vitest';
import { calculateEstimatedCalories, calculateTotalVolumeKg } from '../calories';
import { LoggedExercise } from '../session';

describe('Cálculos Determinísticos de Fisiologia & Volume (Offline MET)', () => {
  describe('calculateEstimatedCalories', () => {
    it('deve calcular calorias para 60 min de musculação moderada com peso padrão (75kg)', () => {
      // MET 3.8 * 3.5 * 75 / 200 * 60 = 299.25 kcal -> 299 kcal
      const kcal = calculateEstimatedCalories({ durationMinutes: 60 });
      expect(kcal).toBe(299);
    });

    it('deve calcular calorias com peso corporal customizado (80kg)', () => {
      // MET 3.8 * 3.5 * 80 / 200 * 60 = 319.2 kcal -> 319 kcal
      const kcal = calculateEstimatedCalories({ durationMinutes: 60, bodyWeightKg: 80 });
      expect(kcal).toBe(319);
    });

    it('deve calcular calorias para treino vigoroso/pesado', () => {
      // MET 6.0 * 3.5 * 80 / 200 * 45 = 378 kcal
      const kcal = calculateEstimatedCalories({
        durationMinutes: 45,
        bodyWeightKg: 80,
        isVigorous: true,
      });
      expect(kcal).toBe(378);
    });

    it('deve calcular calorias para cardio moderado', () => {
      // MET 7.5 * 3.5 * 70 / 200 * 30 = 275.625 kcal -> 276 kcal
      const kcal = calculateEstimatedCalories({
        durationMinutes: 30,
        bodyWeightKg: 70,
        hasCardio: true,
      });
      expect(kcal).toBe(276);
    });

    it('deve retornar 0 kcal se a duração for zero ou negativa', () => {
      expect(calculateEstimatedCalories({ durationMinutes: 0 })).toBe(0);
      expect(calculateEstimatedCalories({ durationMinutes: -10 })).toBe(0);
    });
  });

  describe('calculateTotalVolumeKg', () => {
    it('deve somar o volume de todas as séries de musculação concluídas', () => {
      const exercises: LoggedExercise[] = [
        {
          exerciseId: 'bench-press',
          sets: [
            { type: 'resistance', kind: 'normal', weightKg: 80, reps: 10, completed: true }, // 800 kg
            { type: 'resistance', kind: 'normal', weightKg: 85, reps: 8, completed: true },  // 680 kg
            { type: 'resistance', kind: 'normal', weightKg: 90, reps: 6, completed: false }, // não conta
          ],
        },
        {
          exerciseId: 'incline-db',
          sets: [
            { type: 'resistance', kind: 'normal', weightKg: 24, reps: 12, completed: true }, // 288 kg
            { type: 'cardio', durationMinutes: 10, completed: true },                        // cardio não tem volume em kg
          ],
        },
      ];

      // Total: 800 + 680 + 288 = 1768 kg
      const totalVolume = calculateTotalVolumeKg(exercises);
      expect(totalVolume).toBe(1768);
    });

    it('deve retornar 0 para lista de exercícios vazia', () => {
      expect(calculateTotalVolumeKg([])).toBe(0);
    });
  });
});
