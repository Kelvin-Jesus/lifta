import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import { ResistanceSet, CardioSet, WorkoutSet } from '../set';
import { Exercise } from '../exercise';
import { Routine } from '../routine';
import { WorkoutSession, ActiveSession } from '../session';

describe('Domain Schemas & Invariants', () => {
  describe('ResistanceSet', () => {
    it('deve validar com sucesso uma série de musculação válida', () => {
      const validSet = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 80,
        reps: 10,
        completed: true,
        rpe: 8,
        restSeconds: 90,
      };

      const result = Schema.decodeUnknownSync(ResistanceSet)(validSet);
      expect(result.weightKg).toBe(80);
      expect(result.reps).toBe(10);
      expect(result.completed).toBe(true);
      expect(result.rpe).toBe(8);
    });

    it('deve rejeitar carga negativa', () => {
      const invalidSet = {
        type: 'resistance',
        kind: 'normal',
        weightKg: -5,
        reps: 10,
        completed: false,
      };

      expect(() => Schema.decodeUnknownSync(ResistanceSet)(invalidSet)).toThrow();
    });

    it('deve rejeitar repetições negativas ou fracionadas', () => {
      const negativeReps = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 50,
        reps: -1,
        completed: false,
      };
      expect(() => Schema.decodeUnknownSync(ResistanceSet)(negativeReps)).toThrow();

      const floatReps = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 50,
        reps: 8.5,
        completed: false,
      };
      expect(() => Schema.decodeUnknownSync(ResistanceSet)(floatReps)).toThrow();
    });

    it('deve rejeitar RPE fora do intervalo [1, 10]', () => {
      const lowRpe = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 50,
        reps: 10,
        completed: true,
        rpe: 0,
      };
      expect(() => Schema.decodeUnknownSync(ResistanceSet)(lowRpe)).toThrow();

      const highRpe = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 50,
        reps: 10,
        completed: true,
        rpe: 11,
      };
      expect(() => Schema.decodeUnknownSync(ResistanceSet)(highRpe)).toThrow();
    });
  });

  describe('CardioSet', () => {
    it('deve validar série de cardio com duração positiva', () => {
      const validCardio = {
        type: 'cardio',
        durationMinutes: 20,
        distanceKm: 3.5,
        speedKmh: 10.5,
        completed: true,
      };

      const result = Schema.decodeUnknownSync(CardioSet)(validCardio);
      expect(result.durationMinutes).toBe(20);
      expect(result.distanceKm).toBe(3.5);
    });

    it('deve rejeitar duração de cardio menor ou igual a zero', () => {
      const zeroDuration = {
        type: 'cardio',
        durationMinutes: 0,
        completed: false,
      };
      expect(() => Schema.decodeUnknownSync(CardioSet)(zeroDuration)).toThrow();
    });
  });

  describe('WorkoutSet Union', () => {
    it('deve discriminar corretamente entre resistance e cardio', () => {
      const set1 = Schema.decodeUnknownSync(WorkoutSet)({
        type: 'resistance',
        kind: 'normal',
        weightKg: 100,
        reps: 5,
        completed: true,
      });
      expect(set1.type).toBe('resistance');

      const set2 = Schema.decodeUnknownSync(WorkoutSet)({
        type: 'cardio',
        durationMinutes: 15,
        completed: true,
      });
      expect(set2.type).toBe('cardio');
    });
  });

  describe('Exercise & Routine', () => {
    it('deve validar um exercício com músculos primários e secundários', () => {
      const ex = Schema.decodeUnknownSync(Exercise)({
        id: 'bench-press',
        name: 'Supino Reto com Barra',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        equipment: 'barbell',
      });
      expect(ex.primaryMuscles).toEqual(['chest']);
      expect(ex.secondaryMuscles).toContain('triceps');
    });

    it('deve rejeitar exercício sem músculos primários', () => {
      expect(() =>
        Schema.decodeUnknownSync(Exercise)({
          id: 'bench-press',
          name: 'Supino Reto',
          primaryMuscles: [],
          secondaryMuscles: [],
          equipment: 'barbell',
        })
      ).toThrow();
    });

    it('deve rejeitar rotina sem exercícios', () => {
      expect(() =>
        Schema.decodeUnknownSync(Routine)({
          id: 'routine-1',
          name: 'Treino A',
          exercises: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      ).toThrow();
    });
  });

  describe('ActiveSession & WorkoutSession', () => {
    it('deve validar ActiveSession com múltiplos exercícios e séries', () => {
      const active = Schema.decodeUnknownSync(ActiveSession)({
        id: 'session-active-1',
        routineName: 'Treino A • Peito',
        startedAt: new Date().toISOString(),
        activeExerciseIndex: 0,
        exercises: [
          {
            exerciseId: 'bench-press',
            exerciseName: 'Supino Reto',
            sets: [
              {
                type: 'resistance',
                kind: 'normal',
                weightKg: 80,
                reps: 10,
                completed: true,
              },
            ],
          },
        ],
        restTimerEndTimestamp: Date.now() + 90000,
      });

      expect(active.exercises).toHaveLength(1);
      expect(active.exercises[0].sets[0].completed).toBe(true);
    });

    it('deve validar WorkoutSession com métricas consolidadas', () => {
      const session = Schema.decodeUnknownSync(WorkoutSession)({
        id: 'session-completed-1',
        routineName: 'Treino A',
        startedAt: '2026-09-04T10:00:00.000Z',
        endedAt: '2026-09-04T10:55:00.000Z',
        durationMinutes: 55,
        exercises: [],
        estimatedCalories: 450,
        totalVolumeKg: 4200,
      });

      expect(session.durationMinutes).toBe(55);
      expect(session.estimatedCalories).toBe(450);
      expect(session.totalVolumeKg).toBe(4200);
    });
  });
});
