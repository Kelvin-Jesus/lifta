import { Schema } from 'effect';
import { SetKind } from './types';

export const ResistanceSet = Schema.Struct({
  type: Schema.Literal('resistance'),
  kind: SetKind,
  weightKg: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0, { message: () => 'A carga não pode ser negativa' })
  ),
  reps: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThanOrEqualTo(0, { message: () => 'Repetições devem ser maiores ou iguais a zero' })
  ),
  completed: Schema.Boolean,
  restSeconds: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0))),
  rpe: Schema.optional(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(1),
      Schema.lessThanOrEqualTo(10)
    )
  ),
});
export type ResistanceSet = typeof ResistanceSet.Type;

export const CardioSet = Schema.Struct({
  type: Schema.Literal('cardio'),
  durationMinutes: Schema.Number.pipe(
    Schema.greaterThan(0, { message: () => 'A duração deve ser maior que zero' })
  ),
  distanceKm: Schema.optional(Schema.Number.pipe(Schema.greaterThanOrEqualTo(0))),
  speedKmh: Schema.optional(Schema.Number.pipe(Schema.greaterThanOrEqualTo(0))),
  incline: Schema.optional(Schema.Number),
  completed: Schema.Boolean,
});
export type CardioSet = typeof CardioSet.Type;

export const WorkoutSet = Schema.Union(ResistanceSet, CardioSet);
export type WorkoutSet = typeof WorkoutSet.Type;
