# 07 - WebMCP Design and Security

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

Como definir o catálogo formal de ferramentas WebMCP (seguindo a especificação W3C 2026 com `document.modelContext`), os schemas tipados de entrada e saída estruturada, a separação clara entre leitura e mutação, confirmações humanas para operações destrutivas, e o polyfill/fallback para browsers sem suporte nativo?

## Answer

Decisões consolidadas na Rodada 5 de grilling com o usuário:

1. **Catálogo de Ferramentas WebMCP (Arquitetura Híbrida - Opção 3)**:
   - Uma base de ferramentas de domínio canônicas e ortogonais, somada a helpers de alto nível para tarefas comuns:

| Tool | Purpose | Input Schema | Output Schema | Mutates | Human Confirmation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `search_exercises` | Busca no catálogo por músculo, equipamento ou texto | `{ query?: string, muscleGroup?: string, equipment?: string }` | `{ exercises: ExerciseSummary[] }` | Não | Nenhuma |
| `get_exercise_details` | Retorna metadados completos de um exercício (músculos, instruções, GIF) | `{ exerciseId: string }` | `ExerciseDetail` | Não | Nenhuma |
| `create_routine` | Cria uma nova rotina/ficha com lista de exercícios e séries | `{ name: string, description?: string, exercises: RoutineExerciseInput[] }` | `{ routineId: string, routine: Routine }` | Sim | Toast informativo |
| `get_routine` | Busca detalhes de uma rotina existente | `{ routineId: string }` | `Routine` | Não | Nenhuma |
| `list_routines` | Lista todas as rotinas cadastradas no banco local | `{}` | `{ routines: RoutineSummary[] }` | Não | Nenhuma |
| `update_routine` | Atualiza nome ou exercícios de uma rotina | `{ routineId: string, patch: RoutinePatch }` | `{ routine: Routine }` | Sim | **Exige Confirmação** |
| `delete_routine` | Remove permanentemente uma rotina | `{ routineId: string }` | `{ success: boolean }` | Sim | **Exige Confirmação** |
| `replace_exercise_in_routine` | Helper de alto nível: substitui um exercício por outro em uma ficha | `{ routineId: string, oldExerciseId: string, newExerciseId: string }` | `{ routine: Routine }` | Sim | **Exige Confirmação** |
| `get_workout_history` | Consulta sessões passadas com filtros de data e paginação | `{ limit?: number, fromDate?: string, toDate?: string }` | `{ sessions: WorkoutSessionSummary[] }` | Não | Nenhuma |
| `get_exercise_progress` | Helper de alto nível: histórico de cargas e volume de um exercício | `{ exerciseId: string, periodDays?: number }` | `{ exerciseId: string, history: ProgressPoint[], estimated1RM: number }` | Não | Nenhuma |
| `log_workout_session` | Salva uma sessão de treino completa | `WorkoutSessionInput` | `{ sessionId: string, summary: SessionSummary }` | Sim | Toast informativo |
| `delete_workout_session` | Remove um treino do histórico | `{ sessionId: string }` | `{ success: boolean }` | Sim | **Exige Confirmação** |

2. **Estratégia de Fallback e Testabilidade (Dual Interface - Opção 2)**:
   - **Polyfill Canônico W3C**: Inicializado em `document.modelContext` se o navegador não tiver suporte nativo ativo, aderindo rigorosamente à API de 2026 (`registerTool`, `AbortSignal`).
   - **Canal de Automação e Testes (`postMessage` + CustomEvent)**:
     - Dispara `CustomEvent('webmcp:ready')` ao concluir o registro.
     - Aceita mensagens via `window.postMessage` para permitir que suites de testes automatizados (Playwright, Puppeteer ou subagentes de eval em linguagem natural) descubram e invoquem ferramentas isoladamente sem quebrar o sandbox.

3. **Governança e Confirmação Humana (Opção 3)**:
   - Se a operação destrutiva (`delete_routine`, `update_routine`, `delete_workout_session`) for solicitada via assistente/chat interno, exibe um **Action Proposal Card** direto na conversa com diff do que será alterado.
   - Se for invocada por um agente externo sem o chat aberto, o app exibe um **System Approval Dialog** nativo no rodapé com os parâmetros e botões claros `Aprovar` e `Recusar`.
