import { Effect, Schema } from 'effect';
import { Routine } from '../../domain/routine';
import { StorageError, ValidationError } from '../../domain/errors';
import { STORES, withTransaction } from '../indexeddb';

export const RoutineRepository = {
  save(routine: Routine): Effect.Effect<Routine, StorageError | ValidationError> {
    return Effect.gen(function* () {
      const validated = yield* Effect.try({
        try: () => Schema.decodeUnknownSync(Routine)(routine),
        catch: (err) =>
          new ValidationError({
            field: 'routine',
            message: `Rotina inválida: ${String(err)}`,
          }),
      });

      yield* withTransaction(STORES.ROUTINES, 'readwrite', (store) => store.put(validated));
      return validated;
    });
  },

  getById(id: string): Effect.Effect<Routine | null, StorageError> {
    return Effect.gen(function* () {
      const raw = yield* withTransaction<Routine | undefined>(STORES.ROUTINES, 'readonly', (store) =>
        store.get(id)
      );

      if (!raw) return null;
      return Schema.decodeUnknownSync(Routine)(raw);
    });
  },

  listAll(): Effect.Effect<Routine[], StorageError> {
    return Effect.gen(function* () {
      const rawList = yield* withTransaction<Routine[]>(STORES.ROUTINES, 'readonly', (store) =>
        store.getAll()
      );

      return rawList.map((r) => Schema.decodeUnknownSync(Routine)(r));
    });
  },

  delete(id: string): Effect.Effect<boolean, StorageError> {
    return Effect.gen(function* () {
      yield* withTransaction(STORES.ROUTINES, 'readwrite', (store) => store.delete(id));
      return true;
    });
  },
};
