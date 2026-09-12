# Exercise catalog

The catalog shipped to the app is the concatenation of two lists, exported as
`EXERCISE_CATALOG` from `src/catalog/exercises.ts`:

| List | File | Size | Purpose |
| --- | --- | --- | --- |
| `CORE_EXERCISE_CATALOG` | `src/catalog/exercises.ts` | 51 | hand-written movements; the default routines reference these ids and they must stay stable |
| `EXTENDED_EXERCISE_CATALOG` | `src/catalog/exercisesExtended.ts` | 190 | derived from an open dataset, adapted to pt-BR |

## Where the extended list comes from

Source: [`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset)
(`data/exercises.json`, 1324 movements with target muscle, secondary muscles,
equipment and animation).

Selection and adaptation rules applied when it was generated:

- Only equipment the app models (`barbell`, `dumbbell`, `cable`, `machine`,
  `bodyweight`, `cardio`). Bands, bosu, medicine balls and similar are skipped.
- Dataset `target`/`secondary_muscles` mapped onto `MuscleGroup`; squat-family
  movements the dataset labels `glutes` are re-targeted to `quadriceps` with
  glutes as a synergist.
- Names and instructions rewritten in Brazilian gym terminology
  ("cable pushdown" → "Tríceps Pulley"), Title Case with lowercase
  prepositions, instructions capped around 190 characters.
- Ids are slugs of the original English name, so they stay stable across
  regenerations; entries whose name collides with a core exercise are dropped.

`src/catalog/__tests__/catalogIntegrity.test.ts` enforces the invariants:
unique ids and names, valid taxonomy, instructions present, `https` gif URLs,
minimum variety per muscle group, and that every default routine resolves.

## Media licensing — attribution is mandatory

The animations belong to **Gym visual** and are redistributed by the dataset
only with visible attribution. `EXERCISE_MEDIA_ATTRIBUTION`
(`© Gym visual — gymvisual.com`) must be rendered next to any exercise gif.
It is currently shown in the catalog accordion and in the expanded gif
lightbox. Removing it breaks the license.

## Adding exercises by hand

Add them to `CORE_EXERCISE_CATALOG` with a descriptive, stable id. Keep
`secondaryMuscles` free of the primary muscle and keep gifs at the dataset's
180×180 media, or omit `gifUrl` entirely — the UI renders fine without it.
