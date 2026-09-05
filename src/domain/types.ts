import { Schema } from 'effect';

export const Weekday = Schema.Literal(
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);
export type Weekday = typeof Weekday.Type;

export const MuscleGroup = Schema.Literal(
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves'
);
export type MuscleGroup = typeof MuscleGroup.Type;

export const Equipment = Schema.Literal(
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'cardio'
);
export type Equipment = typeof Equipment.Type;

export const SetKind = Schema.Literal(
  'normal',
  'warmup',
  'dropset',
  'failure'
);
export type SetKind = typeof SetKind.Type;
