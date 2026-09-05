# 10 - Project Scaffold and Domain Core

Type: task
Status: resolved
Blocked by: 

## Goal

Inicializar a base de código do projeto Lifta (Solid-js + Vite + TypeScript + Tailwind CSS v4 + Vitest) e implementar o núcleo de domínio funcional com Effect-TS (`effect`, `@effect/schema`), modelando todas as entidades canônicas, invariantes de validação e equações determinísticas de cálculo calórico MET.

## Deliverables

1. **Scaffold do Projeto**:
   - `package.json` configurado com scripts `dev`, `build`, `test` (Vitest), `typecheck` e gerenciado com `pnpm`.
   - Setup do Solid-js com TypeScript (`tsconfig.json` estrito).
   - Setup do Tailwind CSS v4 com design tokens do iOS (`src/index.css`: Dark OLED `#000000`, Light `#f2f2f7`, Azul `#007aff` e Roxo Índigo `#5856d6`).
2. **Modelos de Domínio com Effect Schema**:
   - `Routine`: id, name, description, scheduledDays (`Weekday[]`), exercises, createdAt, updatedAt (`src/domain/routine.ts`).
   - `WorkoutSession` e `ActiveSession` singleton (`src/domain/session.ts`).
   - `ResistanceSet` e `CardioSet` em união discriminada (`src/domain/set.ts`).
   - `Exercise`: id, name, primaryMuscles, secondaryMuscles, equipment, instructions (`src/domain/exercise.ts`).
3. **Cálculo Determinístico de Calorias (MET) & Volume**:
   - Funções puras `calculateEstimatedCalories` e `calculateTotalVolumeKg` (`src/domain/calories.ts`).
4. **Testes Unitários (Vitest)**:
   - 19 testes unitários passando em `src/domain/__tests__/domain.test.ts` e `src/domain/__tests__/calories.test.ts`.
   - Typecheck estrito (`tsc --noEmit`) e build de produção Vite (`pnpm build`) passando com bundle de 6.87 kB.

## Answer

Ticket 10 concluído com sucesso. O projeto está scaffolded com Solid-js + Vite + TypeScript + Tailwind v4 + Effect-TS usando `pnpm`, e o núcleo de domínio com 19 testes automatizados está 100% verde.
