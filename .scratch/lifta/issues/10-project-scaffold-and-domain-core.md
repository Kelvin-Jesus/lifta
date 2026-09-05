# 10 - Project Scaffold and Domain Core

Type: task
Status: ready-for-agent
Blocked by: 

## Goal

Inicializar a base de código do projeto Lifta (Solid-js + Vite + TypeScript + Tailwind CSS v4 + Vitest) e implementar o núcleo de domínio funcional com Effect-TS (`effect`, `@effect/schema`), modelando todas as entidades canônicas, invariantes de validação e equações determinísticas de cálculo calórico MET.

## Deliverables

1. **Scaffold do Projeto**:
   - `package.json` configurado com scripts `dev`, `build`, `test` (Vitest), `typecheck`.
   - Setup do Solid-js com TypeScript (`tsconfig.json` estrito).
   - Setup do Tailwind CSS v4 com design tokens do iOS (paletas Dark OLED `#000000` e Light `#f2f2f7`, cores de destaque Azul `#007aff` e Roxo Índigo `#5856d6`).
2. **Modelos de Domínio com Effect Schema**:
   - `Routine`: id, name, description, scheduledDays (`Weekday[]`), exercises, createdAt, updatedAt.
   - `WorkoutSession`: id, routineId, startedAt, endedAt, sets, estimatedCaloriesBurned, notes.
   - `ActiveSession`: singleton com exercício atual, timestamp de início, séries concluídas e estado do timer.
   - `ResistanceSet` e `CardioSet` (polimorfismo discriminado).
   - `Exercise`: id, name, muscleGroup, secondaryMuscles, equipment, gifUrl, instructions.
3. **Cálculo Determinístico de Calorias (MET)**:
   - Função pura `calculateCaloriesBurned({ bodyWeightKg, durationMinutes, metValue, sets })`.
   - Tabelas de MET para musculação moderada/pesada e cardio (esteira/bicicleta).
4. **Testes Unitários (Vitest)**:
   - Validação de invariantes (`weightKg >= 0`, `reps >= 1`, data final posterior à inicial).
   - Testes de decodificação e serialização via `@effect/schema`.
   - Testes dos cálculos calóricos contra valores de referência clínicos.
