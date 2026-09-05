import { Effect, Schema } from 'effect';
import { WorkoutSession } from '../../domain/session';
import { StorageError, ValidationError } from '../../domain/errors';
import { STORES, withTransaction } from '../indexeddb';

export interface ListSessionsOptions {
  limit?: number;
  fromDate?: string;
  toDate?: string;
  routineId?: string;
}

export const WorkoutSessionRepository = {
  save(session: WorkoutSession): Effect.Effect<WorkoutSession, StorageError | ValidationError> {
    return Effect.gen(function* () {
      const validated = yield* Effect.try({
        try: () => Schema.decodeUnknownSync(WorkoutSession)(session),
        catch: (err) =>
          new ValidationError({
            field: 'session',
            message: `Sessão de treino inválida: ${String(err)}`,
          }),
      });

      yield* withTransaction(STORES.WORKOUT_SESSIONS, 'readwrite', (store) => store.put(validated));
      return validated;
    });
  },

  getById(id: string): Effect.Effect<WorkoutSession | null, StorageError> {
    return Effect.gen(function* () {
      const raw = yield* withTransaction<WorkoutSession | undefined>(
        STORES.WORKOUT_SESSIONS,
        'readonly',
        (store) => store.get(id)
      );

      if (!raw) return null;
      return Schema.decodeUnknownSync(WorkoutSession)(raw);
    });
  },

  listAll(options?: ListSessionsOptions): Effect.Effect<WorkoutSession[], StorageError> {
    return Effect.gen(function* () {
      const rawList = yield* withTransaction<WorkoutSession[]>(
        STORES.WORKOUT_SESSIONS,
        'readonly',
        (store) => store.getAll()
      );

      let filtered = rawList.map((s) => Schema.decodeUnknownSync(WorkoutSession)(s));

      if (options?.routineId) {
        filtered = filtered.filter((s) => s.routineId === options.routineId);
      }
      if (options?.fromDate) {
        filtered = filtered.filter((s) => s.startedAt >= options.fromDate!);
      }
      if (options?.toDate) {
        filtered = filtered.filter((s) => s.startedAt <= options.toDate!);
      }

      // Ordenar por data decrescente (mais recente primeiro)
      filtered.sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1));

      if (options?.limit && options.limit > 0) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    });
  },

  delete(id: string): Effect.Effect<boolean, StorageError> {
    return Effect.gen(function* () {
      yield* withTransaction(STORES.WORKOUT_SESSIONS, 'readwrite', (store) => store.delete(id));
      return true;
    });
  },
};
