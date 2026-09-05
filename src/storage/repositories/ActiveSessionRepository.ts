import { Effect, Schema } from 'effect';
import { ActiveSession } from '../../domain/session';
import { StorageError, ValidationError } from '../../domain/errors';
import { STORES, withTransaction } from '../indexeddb';

const ACTIVE_SESSION_SINGLETON_ID = 'current';

export const ActiveSessionRepository = {
  saveActive(session: ActiveSession): Effect.Effect<ActiveSession, StorageError | ValidationError> {
    return Effect.gen(function* () {
      const record = { ...session, id: ACTIVE_SESSION_SINGLETON_ID };
      const validated = yield* Effect.try({
        try: () => Schema.decodeUnknownSync(ActiveSession)(record),
        catch: (err) =>
          new ValidationError({
            field: 'activeSession',
            message: `Sessão ativa inválida: ${String(err)}`,
          }),
      });

      yield* withTransaction(STORES.ACTIVE_SESSION, 'readwrite', (store) => store.put(validated));
      return validated;
    });
  },

  getActive(): Effect.Effect<ActiveSession | null, StorageError> {
    return Effect.gen(function* () {
      const raw = yield* withTransaction<ActiveSession | undefined>(
        STORES.ACTIVE_SESSION,
        'readonly',
        (store) => store.get(ACTIVE_SESSION_SINGLETON_ID)
      );

      if (!raw) return null;
      return Schema.decodeUnknownSync(ActiveSession)(raw);
    });
  },

  clearActive(): Effect.Effect<void, StorageError> {
    return Effect.gen(function* () {
      yield* withTransaction(STORES.ACTIVE_SESSION, 'readwrite', (store) =>
        store.delete(ACTIVE_SESSION_SINGLETON_ID)
      );
    });
  },
};
