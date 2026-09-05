# 11 - Offline Storage and Repositories

Type: task
Status: open
Blocked by: 10

## Goal

Construir a camada de persistência offline local-first baseada em IndexedDB nativo envelopado em serviços Effect (`Context.Tag` e `Layer`), garantindo integridade de dados, auto-save atômico para o treino ativo, histórico imutável e backup/exportação de dados soberana (JSON e CSV).

## Deliverables

1. **Storage Service & Migrations**:
   - `StorageService` em Effect gerenciando `IDBDatabase` com migrações declarativas versionadas (`db.version = 1`).
   - Object Stores: `routines`, `workout_sessions`, `active_session`, `custom_exercises`, `settings`.
2. **Repositórios de Domínio**:
   - `RoutineRepository`: CRUD de rotinas com ordenação e busca por dias agendados.
   - `WorkoutSessionRepository`: append-only de sessões finalizadas com índices por data e rotina.
   - `ActiveSessionRepository`: store singleton com auto-save imediato a cada série e recuperação ultra-rápida pós-crash (<80ms).
   - `SettingsRepository`: persistência de preferências de tema, cor de destaque e peso corporal.
3. **Mecanismo de Exportação & Importação Soberana**:
   - Exportação completa em formato `.lifta.json` com schema versioning.
   - Exportação tabular de séries em formato `.csv` para análise em planilhas.
   - Importação segura com dry-run e validação completa de schema via Effect antes da gravação.
4. **Testes Automatizados (Vitest)**:
   - Testes de CRUD em ambiente in-memory (usando `fake-indexeddb`).
   - Testes de resiliência e recuperação de sessão após interrupção abrupta.
   - Testes de ida e volta (round-trip) de exportação e importação.
