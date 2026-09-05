# 11 - Offline Storage and Repositories

Type: task
Status: resolved
Blocked by: 10

## Goal

Construir a camada de persistência offline local-first baseada em IndexedDB nativo envelopado em serviços Effect (`Context.Tag` e `Layer`), garantindo integridade de dados, auto-save atômico para o treino ativo, histórico imutável e backup/exportação de dados soberana (JSON e CSV).

## Deliverables

1. **Storage Service & Migrations**:
   - `openDatabase` e `withTransaction` em Effect gerenciando `IDBDatabase` com migrações declarativas (`src/storage/indexeddb.ts`).
   - Object Stores: `routines`, `workout_sessions`, `active_session`, `custom_exercises`, `settings`.
2. **Repositórios de Domínio**:
   - `RoutineRepository`: CRUD de rotinas (`src/storage/repositories/RoutineRepository.ts`).
   - `WorkoutSessionRepository`: append-only com filtros e ordenação decrescente (`src/storage/repositories/WorkoutSessionRepository.ts`).
   - `ActiveSessionRepository`: store singleton com persistência atômica da sessão ativa (`src/storage/repositories/ActiveSessionRepository.ts`).
   - `SettingsRepository`: preferências locais de tema, cor e cálculo calórico (`src/storage/repositories/SettingsRepository.ts`).
3. **Mecanismo de Exportação & Importação Soberana**:
   - `exportLiftaJson`: backup em `.lifta.json` com schema versioning (`src/storage/export-import.ts`).
   - `exportSessionsCsv`: exportação tabular de todas as séries para planilhas.
   - `importLiftaJson`: importação com suporte a dry-run e validação completa de schema.
4. **Testes Automatizados (Vitest)**:
   - 10 testes automatizados passando em `src/storage/__tests__/indexeddb.test.ts` e `src/storage/__tests__/export-import.test.ts`.

## Answer

Ticket 11 concluído com sucesso. A camada de persistência IndexedDB com Effect, repositórios tipados e sistema soberano de exportação/importação JSON e CSV está implementada e com 100% dos testes verdes.
