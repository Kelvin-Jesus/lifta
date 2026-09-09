import { Effect, Schema } from 'effect';
import { Routine } from '../domain/routine';
import { WorkoutSession } from '../domain/session';
import { SettingsSchema, SettingsRepository } from './repositories/SettingsRepository';
import { RoutineRepository } from './repositories/RoutineRepository';
import { WorkoutSessionRepository } from './repositories/WorkoutSessionRepository';
import { StorageError, ValidationError } from '../domain/errors';

export const LiftaBackupSchema = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  exportedAt: Schema.String,
  settings: Schema.optional(SettingsSchema),
  routines: Schema.Array(Routine),
  workoutSessions: Schema.optional(Schema.Array(WorkoutSession)),
});
export type LiftaBackup = typeof LiftaBackupSchema.Type;

export interface ImportResult {
  routinesImported: number;
  sessionsImported: number;
  settingsRestored: boolean;
  dryRun: boolean;
}

/**
 * Exporta todo o estado do usuário para um arquivo JSON soberano (.lifta.json).
 */
export function exportLiftaJson(): Effect.Effect<string, StorageError> {
  return Effect.gen(function* () {
    const settings = yield* SettingsRepository.getSettings();
    const routines = yield* RoutineRepository.listAll();
    const workoutSessions = yield* WorkoutSessionRepository.listAll();

    const backup: LiftaBackup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      settings,
      routines,
      workoutSessions,
    };

    return JSON.stringify(backup, null, 2);
  });
}

/**
 * Exporta todas as séries históricas para formato CSV tabular para análise em Excel / Google Sheets.
 */
export function exportSessionsCsv(): Effect.Effect<string, StorageError> {
  return Effect.gen(function* () {
    const sessions = yield* WorkoutSessionRepository.listAll();

    const headers = [
      'SessionId',
      'StartedAt',
      'EndedAt',
      'RoutineName',
      'ExerciseName',
      'SetNumber',
      'Type',
      'Kind',
      'WeightKg',
      'Reps',
      'Completed',
      'RPE',
      'DurationMin',
      'Calories',
    ];

    const rows: string[] = [headers.join(',')];

    for (const s of sessions) {
      for (const ex of s.exercises) {
        ex.sets.forEach((set, idx) => {
          const isResistance = set.type === 'resistance';
          const row = [
            `"${s.id}"`,
            `"${s.startedAt}"`,
            `"${s.endedAt}"`,
            `"${s.routineName ?? ''}"`,
            `"${ex.exerciseName ?? ex.exerciseId}"`,
            idx + 1,
            set.type,
            isResistance ? set.kind : '',
            isResistance ? set.weightKg : '',
            isResistance ? set.reps : '',
            set.completed ? 'true' : 'false',
            isResistance && set.rpe !== undefined ? set.rpe : '',
            !isResistance ? set.durationMinutes : '',
            s.estimatedCalories,
          ];
          rows.push(row.join(','));
        });
      }
    }

    return rows.join('\n');
  });
}

/**
 * Importa dados de um arquivo JSON validando o schema de ponta a ponta.
 * Se dryRun for true, apenas valida os dados sem tocar no banco.
 */
export function importLiftaJson(
  jsonString: string,
  options: { dryRun?: boolean } = {}
): Effect.Effect<ImportResult, ValidationError | StorageError> {
  return Effect.gen(function* () {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return yield* Effect.fail(
        new ValidationError({
          field: 'backup',
          message: `Arquivo JSON mal formatado: ${String(err)}`,
        })
      );
    }

    const validated = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(LiftaBackupSchema)(parsed),
      catch: (err) =>
        new ValidationError({
          field: 'backup',
          message: `Estrutura de backup incompatível: ${String(err)}`,
        }),
    });

    if (options.dryRun) {
      return {
        routinesImported: validated.routines.length,
        sessionsImported: (validated.workoutSessions ?? []).length,
        settingsRestored: !!validated.settings,
        dryRun: true,
      };
    }

    // Persistir no IndexedDB
    if (validated.settings) {
      yield* SettingsRepository.updateSettings(validated.settings);
    }

    for (const routine of validated.routines) {
      yield* RoutineRepository.save(routine);
    }

    for (const session of (validated.workoutSessions ?? [])) {
      yield* WorkoutSessionRepository.save(session);
    }

    return {
      routinesImported: validated.routines.length,
      sessionsImported: (validated.workoutSessions ?? []).length,
      settingsRestored: !!validated.settings,
      dryRun: false,
    };
  });
}
