import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import {
  exportLiftaJson,
  exportSessionsCsv,
  importLiftaJson,
} from '../export-import';
import { RoutineRepository } from '../repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { Routine } from '../../domain/routine';
import { WorkoutSession } from '../../domain/session';

describe('Exportação e Importação Soberana (JSON & CSV)', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it('deve exportar todo o estado para .lifta.json e restaurar integralmente', async () => {
    // 1. Inserir dados de teste
    const routine: Routine = {
      id: 'routine-export-1',
      name: 'Treino A • Peito',
      scheduledDays: ['monday'],
      exercises: [{ exerciseId: 'bench-press', targetSets: 3, suggestedRestSeconds: 90 }],
      createdAt: '2026-09-04T00:00:00.000Z',
      updatedAt: '2026-09-04T00:00:00.000Z',
    };

    const session: WorkoutSession = {
      id: 'session-export-1',
      routineId: 'routine-export-1',
      startedAt: '2026-09-04T10:00:00.000Z',
      endedAt: '2026-09-04T10:50:00.000Z',
      durationMinutes: 50,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Supino Reto',
          sets: [{ type: 'resistance', kind: 'normal', weightKg: 80, reps: 10, completed: true }],
        },
      ],
      estimatedCalories: 350,
      totalVolumeKg: 800,
    };

    await Effect.runPromise(RoutineRepository.save(routine));
    await Effect.runPromise(WorkoutSessionRepository.save(session));
    await Effect.runPromise(SettingsRepository.updateSettings({ accentColor: 'indigo' }));

    // 2. Exportar JSON
    const jsonString = await Effect.runPromise(exportLiftaJson());
    expect(jsonString).toContain('"schemaVersion": 1');
    expect(jsonString).toContain('Treino A • Peito');
    expect(jsonString).toContain('indigo');

    // 3. Limpar banco para simular outro dispositivo
    indexedDB = new IDBFactory();

    // 4. Testar dry-run
    const dryRunResult = await Effect.runPromise(importLiftaJson(jsonString, { dryRun: true }));
    expect(dryRunResult.dryRun).toBe(true);
    expect(dryRunResult.routinesImported).toBe(1);
    expect(dryRunResult.sessionsImported).toBe(1);

    // Banco continua vazio pós dry-run
    const routinesAfterDry = await Effect.runPromise(RoutineRepository.listAll());
    expect(routinesAfterDry).toHaveLength(0);

    // 5. Importar de verdade
    const realResult = await Effect.runPromise(importLiftaJson(jsonString, { dryRun: false }));
    expect(realResult.dryRun).toBe(false);

    // 6. Validar restauração
    const restoredRoutines = await Effect.runPromise(RoutineRepository.listAll());
    expect(restoredRoutines).toHaveLength(1);
    expect(restoredRoutines[0].name).toBe('Treino A • Peito');

    const restoredSessions = await Effect.runPromise(WorkoutSessionRepository.listAll());
    expect(restoredSessions).toHaveLength(1);
    expect(restoredSessions[0].id).toBe('session-export-1');

    const restoredSettings = await Effect.runPromise(SettingsRepository.getSettings());
    expect(restoredSettings.accentColor).toBe('indigo');
  });

  it('deve exportar histórico para formato CSV tabular válido', async () => {
    const session: WorkoutSession = {
      id: 'session-csv-1',
      routineName: 'Treino A',
      startedAt: '2026-09-04T10:00:00.000Z',
      endedAt: '2026-09-04T10:45:00.000Z',
      durationMinutes: 45,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Supino Reto',
          sets: [
            { type: 'resistance', kind: 'normal', weightKg: 80, reps: 10, completed: true, rpe: 8 },
            { type: 'resistance', kind: 'normal', weightKg: 85, reps: 8, completed: true },
          ],
        },
      ],
      estimatedCalories: 320,
      totalVolumeKg: 1480,
    };

    await Effect.runPromise(WorkoutSessionRepository.save(session));

    const csv = await Effect.runPromise(exportSessionsCsv());
    expect(csv).toContain('SessionId,StartedAt,EndedAt,RoutineName,ExerciseName');
    expect(csv).toContain('"session-csv-1"');
    expect(csv).toContain('"Supino Reto"');
    expect(csv).toContain('80,10,true,8');
  });

  it('deve rejeitar JSON inválido com ValidationError tipado', async () => {
    const corruptedJson = '{"schemaVersion": 1, "routines": "invalido"}';

    await expect(Effect.runPromise(importLiftaJson(corruptedJson))).rejects.toThrow();
  });
});
