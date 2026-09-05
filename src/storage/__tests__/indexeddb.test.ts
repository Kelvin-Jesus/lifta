import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';
import { ActiveSessionRepository } from '../repositories/ActiveSessionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { Routine } from '../../domain/routine';
import { WorkoutSession, ActiveSession } from '../../domain/session';

describe('IndexedDB Repositories (In-Memory with fake-indexeddb)', () => {
  beforeEach(async () => {
    // Reset or clean IndexedDB between test suites
    indexedDB = new IDBFactory();
  });

  describe('RoutineRepository', () => {
    it('deve salvar e recuperar uma rotina pelo ID', async () => {
      const routine: Routine = {
        id: 'routine-a',
        name: 'Treino A • Peito e Tríceps',
        description: 'Foco em hipertrofia',
        scheduledDays: ['monday', 'thursday'],
        exercises: [
          {
            exerciseId: 'bench-press',
            targetSets: 3,
            suggestedRestSeconds: 90,
          },
        ],
        createdAt: '2026-09-04T10:00:00.000Z',
        updatedAt: '2026-09-04T10:00:00.000Z',
      };

      await Effect.runPromise(RoutineRepository.save(routine));
      const loaded = await Effect.runPromise(RoutineRepository.getById('routine-a'));

      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Treino A • Peito e Tríceps');
      expect(loaded?.scheduledDays).toContain('monday');
    });

    it('deve listar todas as rotinas salvas', async () => {
      const r1: Routine = {
        id: 'r1',
        name: 'Treino A',
        exercises: [{ exerciseId: 'e1', targetSets: 3, suggestedRestSeconds: 60 }],
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };
      const r2: Routine = {
        id: 'r2',
        name: 'Treino B',
        exercises: [{ exerciseId: 'e2', targetSets: 4, suggestedRestSeconds: 90 }],
        createdAt: '2026-09-02T00:00:00.000Z',
        updatedAt: '2026-09-02T00:00:00.000Z',
      };

      await Effect.runPromise(RoutineRepository.save(r1));
      await Effect.runPromise(RoutineRepository.save(r2));

      const list = await Effect.runPromise(RoutineRepository.listAll());
      expect(list).toHaveLength(2);
    });

    it('deve deletar uma rotina existente', async () => {
      const routine: Routine = {
        id: 'to-delete',
        name: 'Treino X',
        exercises: [{ exerciseId: 'e1', targetSets: 3, suggestedRestSeconds: 60 }],
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };

      await Effect.runPromise(RoutineRepository.save(routine));
      await Effect.runPromise(RoutineRepository.delete('to-delete'));
      const after = await Effect.runPromise(RoutineRepository.getById('to-delete'));

      expect(after).toBeNull();
    });
  });

  describe('ActiveSessionRepository (Singleton & Crash Recovery)', () => {
    it('deve salvar e recuperar a sessão ativa atômica', async () => {
      const active: ActiveSession = {
        id: 'current',
        routineName: 'Treino A',
        startedAt: new Date().toISOString(),
        activeExerciseIndex: 1,
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [
              { type: 'resistance', kind: 'normal', weightKg: 80, reps: 10, completed: true },
            ],
          },
        ],
        restTimerEndTimestamp: Date.now() + 60000,
      };

      await Effect.runPromise(ActiveSessionRepository.saveActive(active));
      const recovered = await Effect.runPromise(ActiveSessionRepository.getActive());

      expect(recovered).not.toBeNull();
      expect(recovered?.activeExerciseIndex).toBe(1);
      expect(recovered?.exercises[0].sets[0].completed).toBe(true);
    });

    it('deve limpar a sessão ativa ao concluir ou descartar o treino', async () => {
      const active: ActiveSession = {
        id: 'current',
        startedAt: new Date().toISOString(),
        activeExerciseIndex: 0,
        exercises: [],
      };

      await Effect.runPromise(ActiveSessionRepository.saveActive(active));
      await Effect.runPromise(ActiveSessionRepository.clearActive());
      const after = await Effect.runPromise(ActiveSessionRepository.getActive());

      expect(after).toBeNull();
    });
  });

  describe('WorkoutSessionRepository (Histórico)', () => {
    it('deve salvar uma sessão finalizada e listar ordenado por data decrescente', async () => {
      const s1: WorkoutSession = {
        id: 'session-old',
        startedAt: '2026-09-01T10:00:00.000Z',
        endedAt: '2026-09-01T10:50:00.000Z',
        durationMinutes: 50,
        exercises: [],
        estimatedCalories: 350,
        totalVolumeKg: 3000,
      };

      const s2: WorkoutSession = {
        id: 'session-new',
        startedAt: '2026-09-03T10:00:00.000Z',
        endedAt: '2026-09-03T11:00:00.000Z',
        durationMinutes: 60,
        exercises: [],
        estimatedCalories: 450,
        totalVolumeKg: 4200,
      };

      await Effect.runPromise(WorkoutSessionRepository.save(s1));
      await Effect.runPromise(WorkoutSessionRepository.save(s2));

      const list = await Effect.runPromise(WorkoutSessionRepository.listAll());
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe('session-new'); // Mais recente primeiro
    });
  });

  describe('SettingsRepository', () => {
    it('deve retornar configurações padrão e permitir atualizações parciais', async () => {
      const initial = await Effect.runPromise(SettingsRepository.getSettings());
      expect(initial.theme).toBe('dark');
      expect(initial.accentColor).toBe('blue');

      const updated = await Effect.runPromise(
        SettingsRepository.updateSettings({ accentColor: 'indigo', bodyWeightKg: 82.5 })
      );

      expect(updated.accentColor).toBe('indigo');
      expect(updated.bodyWeightKg).toBe(82.5);
      expect(updated.theme).toBe('dark'); // Preserva os demais campos
    });
  });
});
