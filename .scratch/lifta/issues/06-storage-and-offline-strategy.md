# 06 - Storage and Offline Strategy

Type: grilling
Status: resolved
Blocked by: 02

## Question

Qual mecanismo de persistência local adotaremos (ex: IndexedDB com Dexie/idb vs SQLite WASM/PGlite), qual a política de versionamento e migrações locais de schema, e como funcionará o fluxo de backup/exportação/importação (JSON/CSV) e recuperação à prova de falhas?

## Answer

Decisões consolidadas com o usuário:

1. **Persistência Local: IndexedDB Nativo Envelopado com Effect**:
   - Camada de repositórios orientada a serviços Effect (`DatabaseService`, `RoutinesRepository`, `WorkoutSessionsRepository`, `ExercisesRepository`).
   - Validação e tipagem de ponta a ponta com Effect Schema para garantir integridade estrutural e decodificação segura de dados persistidos.
   - Zero dependência pesada de banco externo (mantém o bundle PWA extremamente leve e veloz para primeiro carregamento).
   - Erros tipados explícitos via Effect (`StorageError`, `EntityNotFoundError`, `SchemaCorruptedError`).

2. **Migrações de Schema Locais**:
   - Versionamento nativo do IndexedDB (`db.version`) orquestrado por um módulo de migração declarativo em Effect.
   - Cada migração é uma função pura e transacional que atualiza object stores e índices sem risco de perda de dados.

3. **Backup, Exportação e Importação Soberana (Local-First)**:
   - Exportação completa em **JSON** contendo todas as rotinas, histórico de treinos e exercícios customizados, com assinatura de versão de schema para restauração à prova de erros.
   - Exportação adicional em **CSV** para planilhas (data, exercício, série, carga, reps, duração).
   - Importação atômica com validação prévia de integridade via Effect Schema antes de sobrescrever ou mesclar registros locais.
