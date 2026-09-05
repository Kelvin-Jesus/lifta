import { Effect, Schema } from 'effect';
import { StorageError } from '../../domain/errors';
import { STORES, withTransaction } from '../indexeddb';

export const SettingsSchema = Schema.Struct({
  key: Schema.Literal('app_settings'),
  theme: Schema.Literal('dark', 'light'),
  accentColor: Schema.Literal('blue', 'indigo'),
  bodyWeightKg: Schema.Number.pipe(Schema.greaterThan(0)),
  soundEnabled: Schema.Boolean,
  vibrationEnabled: Schema.Boolean,
  llmProvider: Schema.optional(Schema.Literal('ollama', 'openai', 'gemini', 'anthropic', 'openrouter')),
  llmApiKey: Schema.optional(Schema.String),
  llmModel: Schema.optional(Schema.String),
  ollamaEndpoint: Schema.optional(Schema.String),
});
export type Settings = typeof SettingsSchema.Type;

export const DEFAULT_SETTINGS: Settings = {
  key: 'app_settings',
  theme: 'dark',
  accentColor: 'blue',
  bodyWeightKg: 75.0,
  soundEnabled: true,
  vibrationEnabled: true,
  ollamaEndpoint: 'http://localhost:11434',
};

export const SettingsRepository = {
  getSettings(): Effect.Effect<Settings, StorageError> {
    return Effect.gen(function* () {
      const raw = yield* withTransaction<Settings | undefined>(
        STORES.SETTINGS,
        'readonly',
        (store) => store.get(DEFAULT_SETTINGS.key)
      );

      if (!raw) return DEFAULT_SETTINGS;
      return Schema.decodeUnknownSync(SettingsSchema)({ ...DEFAULT_SETTINGS, ...raw });
    });
  },

  updateSettings(partial: Partial<Omit<Settings, 'key'>>): Effect.Effect<Settings, StorageError> {
    return Effect.gen(function* () {
      const current = yield* SettingsRepository.getSettings();
      const updated = { ...current, ...partial, key: DEFAULT_SETTINGS.key };
      const validated = Schema.decodeUnknownSync(SettingsSchema)(updated);

      yield* withTransaction(STORES.SETTINGS, 'readwrite', (store) => store.put(validated));
      return validated;
    });
  },
};
