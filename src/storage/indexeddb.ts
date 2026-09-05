import { Effect } from 'effect';
import { StorageError } from '../domain/errors';

export const DB_NAME = 'lifta_db';
export const DB_VERSION = 1;

export const STORES = {
  ROUTINES: 'routines',
  WORKOUT_SESSIONS: 'workout_sessions',
  ACTIVE_SESSION: 'active_session',
  CUSTOM_EXERCISES: 'custom_exercises',
  SETTINGS: 'settings',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

/**
 * Abre o banco IndexedDB garantindo a criação declarativa de todas as object stores e índices.
 */
export function openDatabase(): Effect.Effect<IDBDatabase, StorageError> {
  return Effect.async<IDBDatabase, StorageError>((resume) => {
    if (typeof indexedDB === 'undefined') {
      resume(
        Effect.fail(
          new StorageError({
            operation: 'openDatabase',
            cause: null,
            message: 'IndexedDB não está disponível neste ambiente.',
          })
        )
      );
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        // Routines store
        if (!db.objectStoreNames.contains(STORES.ROUTINES)) {
          const routineStore = db.createObjectStore(STORES.ROUTINES, { keyPath: 'id' });
          routineStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Completed sessions store
        if (!db.objectStoreNames.contains(STORES.WORKOUT_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.WORKOUT_SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
          sessionStore.createIndex('routineId', 'routineId', { unique: false });
        }

        // Active session store (singleton)
        if (!db.objectStoreNames.contains(STORES.ACTIVE_SESSION)) {
          db.createObjectStore(STORES.ACTIVE_SESSION, { keyPath: 'id' });
        }

        // Custom exercises
        if (!db.objectStoreNames.contains(STORES.CUSTOM_EXERCISES)) {
          db.createObjectStore(STORES.CUSTOM_EXERCISES, { keyPath: 'id' });
        }

        // App settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      }
    };

    request.onsuccess = () => {
      resume(Effect.succeed(request.result));
    };

    request.onerror = () => {
      resume(
        Effect.fail(
          new StorageError({
            operation: 'openDatabase',
            cause: request.error,
            message: `Falha ao abrir o banco IndexedDB: ${request.error?.message ?? 'Erro desconhecido'}`,
          })
        )
      );
    };
  });
}

/**
 * Executa uma transação genérica no IndexedDB com tratamento tipado de erros do Effect.
 */
export function withTransaction<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Effect.Effect<T, StorageError> {
  return Effect.gen(function* () {
    const db = yield* openDatabase();

    return yield* Effect.async<T, StorageError>((resume) => {
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);

        request.onsuccess = () => {
          resume(Effect.succeed(request.result));
        };

        request.onerror = () => {
          resume(
            Effect.fail(
              new StorageError({
                operation: `transaction:${storeName}:${mode}`,
                cause: request.error,
                message: `Erro na operação IndexedDB: ${request.error?.message ?? 'Erro desconhecido'}`,
              })
            )
          );
        };

        tx.onerror = () => {
          resume(
            Effect.fail(
              new StorageError({
                operation: `transaction:${storeName}:${mode}`,
                cause: tx.error,
                message: `Erro na transação IndexedDB: ${tx.error?.message ?? 'Erro desconhecido'}`,
              })
            )
          );
        };
      } catch (err) {
        resume(
          Effect.fail(
            new StorageError({
              operation: `transaction:${storeName}:${mode}`,
              cause: err,
              message: `Exceção durante abertura de transação: ${String(err)}`,
            })
          )
        );
      }
    });
  });
}
