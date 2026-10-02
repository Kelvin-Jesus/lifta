import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Effect, Schema } from 'effect';
import { importLiftaJson, LiftaBackupSchema } from '../export-import';
import { EXERCISE_CATALOG, getExerciseById } from '../../catalog/exercises';

describe('Weekly workout routine import and catalog regression', () => {
  const jsonPath = path.resolve(__dirname, '../../../treino-semanal.lifta.json');
  const jsonString = readFileSync(jsonPath, 'utf-8');

  it('[REGRESSION] parses and validates treino-semanal.lifta.json schema without errors', async () => {
    const parsed = JSON.parse(jsonString);
    const validated = Schema.decodeUnknownSync(LiftaBackupSchema)(parsed);

    expect(validated.schemaVersion).toBe(1);
    expect(validated.routines.length).toBe(3);

    const routineA = validated.routines.find((r) => r.id === 'routine-treino-a');
    const routineB = validated.routines.find((r) => r.id === 'routine-treino-b');
    const routineC = validated.routines.find((r) => r.id === 'routine-treino-c');

    expect(routineA).toBeDefined();
    expect(routineB).toBeDefined();
    expect(routineC).toBeDefined();

    expect(routineA?.scheduledDays).toContain('monday');
    expect(routineB?.scheduledDays).toContain('wednesday');
    expect(routineC?.scheduledDays).toContain('friday');

    expect(routineA?.exercises.length).toBe(4);
    expect(routineB?.exercises.length).toBe(4);
    expect(routineC?.exercises.length).toBe(4);
  });

  it('[REGRESSION] successfully runs dry-run import through importLiftaJson', async () => {
    const result = await Effect.runPromise(importLiftaJson(jsonString, { dryRun: true }));

    expect(result.dryRun).toBe(true);
    expect(result.routinesImported).toBe(3);
    expect(result.settingsRestored).toBe(true);
  });

  it('[REGRESSION] every exercise in the weekly routine resolves to a valid catalog entry with GIF and muscle data', () => {
    const parsed = JSON.parse(jsonString);
    const validated = Schema.decodeUnknownSync(LiftaBackupSchema)(parsed);

    for (const routine of validated.routines) {
      for (const ex of routine.exercises) {
        const catalogEntry = getExerciseById(EXERCISE_CATALOG, ex.exerciseId);
        expect(
          catalogEntry,
          `Exercício ${ex.exerciseId} na rotina ${routine.name} não foi encontrado no catálogo`
        ).toBeDefined();

        expect(catalogEntry?.primaryMuscles.length).toBeGreaterThan(0);
        expect(catalogEntry?.equipment).toBeDefined();
        expect(catalogEntry?.instructions?.length).toBeGreaterThan(15);
        if (catalogEntry?.gifUrl) {
          expect(catalogEntry.gifUrl).toMatch(/^https:\/\/.+\.gif$/);
        }
      }
    }
  });

  it('[REGRESSION] specific new exercises exist in catalog with expected taxonomy', () => {
    const hackSquat = getExerciseById(EXERCISE_CATALOG, 'sled-hack-squat');
    expect(hackSquat).toBeDefined();
    expect(hackSquat?.equipment).toBe('machine');
    expect(hackSquat?.primaryMuscles).toContain('quadriceps');

    const leverHipThrust = getExerciseById(EXERCISE_CATALOG, 'lever-hip-thrust');
    expect(leverHipThrust).toBeDefined();
    expect(leverHipThrust?.equipment).toBe('machine');
    expect(leverHipThrust?.primaryMuscles).toContain('glutes');

    const ezFrench = getExerciseById(EXERCISE_CATALOG, 'ez-barbell-overhead-tricep-extension');
    expect(ezFrench).toBeDefined();
    expect(ezFrench?.equipment).toBe('barbell');
    expect(ezFrench?.primaryMuscles).toContain('triceps');
  });
});
