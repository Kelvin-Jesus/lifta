# 02 - Domain Model and Entities

Type: grilling
Status: resolved
Blocked by: 01

## Question

Quais são as entidades e conceitos de domínio centrais do Lifta (Rotina/Ficha, Sessão de Treino, Exercício, Série/Set, Tipos de Série, Carga, Repetições, RPE/RIR, Descanso, Notas), quais são suas invariantes e o glossário canônico para o CONTEXT.md?

## Answer

Decisões de domínio consolidadas na Rodada 2 de grilling com o usuário:

1. **Separação estrita entre Routine e WorkoutSession**:
   - `Routine`: Template/modelo reutilizável contendo a lista ordenada de exercícios e metas de séries. Pode ser criada manualmente pelo usuário ou gerada via agente WebMCP após entrevista.
   - `WorkoutSession`: Registro concreto e histórico de um treino executado em uma data/hora específica, imutável após finalização para garantir integridade do histórico.
   - Um treino pode iniciar a partir de uma `Routine` ou como uma sessão avulsa (*quick workout*).

2. **Tipagem forte discriminada de Séries (Set Polymorphism)**:
   - `ResistanceSet`: Musculação e pesos livres. Contém `weightKg: number`, `reps: number`, e opcionalmente `durationSeconds?: number` (tempo de execução da série/tempo sob tensão), `restSeconds?: number`, `rpe?: number` e `kind: 'normal' | 'warmup' | 'dropset' | 'failure'`.
   - `CardioSet`: Exercícios aeróbicos (esteira, bicicleta). Contém `durationMinutes: number`, e opcionalmente `distanceKm?: number`, `speedKmh?: number`, `resistanceLevel?: number`, `incline?: number`, `calories?: number`.

3. **Catálogo de Exercícios Rico & Híbrido**:
   - Base open source integrada (+1.300 exercícios com grupos musculares, equipamentos e GIFs animados de demonstração via `hasaneyldrm/exercises-dataset` / `free-exercise-db`).
   - Suporte nativo à criação de exercícios customizados e anotações pessoais por exercício (ex: regulagem de banco/máquina).
   - Estratégia de cache offline progressivo para mídias/GIFs no PWA.

4. **Invariante de Sessão Ativa (`ActiveSession`) & Resiliência Instantânea**:
   - Regra de negócio: no máximo **uma** `ActiveSession` em andamento simultaneamente.
   - Auto-save reativo a cada alteração/série no armazenamento local (IndexedDB). Em caso de fechamento do navegador, recarga acidental ou falta de bateria, o treino é retomado exatamente de onde parou.

5. **Glossário Canônico**:
   - Termos registrados no arquivo de raiz [CONTEXT.md](../../CONTEXT.md).
