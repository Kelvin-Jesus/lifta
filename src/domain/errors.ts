import { Data } from 'effect';

export class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  readonly entity: string;
  readonly id: string;
  readonly message: string;
}> {}

export class ActiveSessionConflictError extends Data.TaggedError('ActiveSessionConflictError')<{
  readonly activeSessionId: string;
  readonly message: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly field?: string;
  readonly message: string;
}> {}

export class StorageError extends Data.TaggedError('StorageError')<{
  readonly operation: string;
  readonly cause: unknown;
  readonly message: string;
}> {}

export class SchemaMigrationError extends Data.TaggedError('SchemaMigrationError')<{
  readonly currentVersion: number;
  readonly targetVersion: number;
  readonly message: string;
}> {}
