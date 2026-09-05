# Lifta Domain Context

Lifta is a local-first, offline-first workout tracking system and agent-ready PWA for gym training, progressive overload, and automated workout generation.

## Language

**Routine**:
A reusable workout template containing an ordered sequence of planned exercises and target sets.
_Avoid_: Workout plan, ficha, preset, program.

**WorkoutSession**:
A concrete execution of a workout on a specific date and time, capturing actual completed sets and notes.
_Avoid_: Workout log, treino realizado, history item.

**ActiveSession**:
The single in-progress WorkoutSession currently being executed and saved in real time.
_Avoid_: Current workout, sessão aberta, draft workout.

**Exercise**:
A cataloged physical movement with identified target muscle groups, required equipment, and optional demonstration media.
_Avoid_: Activity, drill, movimento.

**ResistanceSet**:
A completed or planned set of a weight-bearing exercise defined by load (weight) and repetitions, with optional execution duration.
_Avoid_: Weight set, rep block, série de peso.

**CardioSet**:
A completed or planned interval of cardiovascular training defined by duration and distance or speed/resistance.
_Avoid_: Aeróbico, esteira block, cardio lap.

**SetKind**:
The designated intent or intensity tier of a resistance set, categorized as normal, warmup, dropset, or failure.
_Avoid_: Set type, tag de série, estilo de série.

**RestTimer**:
A countdown timer tracking the interval elapsed between completed sets.
_Avoid_: Pause, cronômetro de descanso, interval clock.

**MuscleMap**:
A stylized vector anatomical silhouette highlighting primary and secondary target muscle groups in the user's selected accent color.
_Avoid_: Mapa de corpo, boneco de músculos, anatomia 3D.

**Schedule**:
The assigned calendar days of the week designated for executing a specific Routine.
_Avoid_: Agenda de treino, calendário semanal, dias fixos.
