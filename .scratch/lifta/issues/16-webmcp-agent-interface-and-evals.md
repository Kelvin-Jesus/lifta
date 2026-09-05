# 16 - WebMCP Agent Interface and Evals

Type: task
Status: resolved
Blocked by: 11, 15

## Goal

Expor a interface de agente WebMCP padronizada pelo W3C 2026 (`document.modelContext`) com as 12 ferramentas tipadas sobre o banco local, implementar o canal de automação `postMessage`, a proteção com aprovação humana obrigatória para operações destrutivas, o assistente de IA opcional com Vercel AI SDK e a suite automatizada de evals rodando contra Ollama local.

## Deliverables

1. **Registro das 12 Ferramentas WebMCP**:
   - `search_exercises`, `get_exercise_details`, `list_routines`, `get_routine`, `create_routine`, `update_routine`, `delete_routine`, `replace_exercise_in_routine`, `get_workout_history`, `get_exercise_progress`, `log_workout_session`, `delete_workout_session`.
   - Polyfill robusto garantindo disponibilidade em qualquer navegador.
   - Handlers das ferramentas delegando diretamente para a camada de serviços Effect do IndexedDB.
2. **Governança & Human-in-the-Loop**:
   - Diálogo nativo ou Proposal Card exigindo confirmação explícita do usuário antes de executar mutações destrutivas (`update_routine`, `delete_routine`, `delete_workout_session`).
3. **Assistente de IA Opcional**:
   - Drawer de chat acessível no header.
   - Integração com Vercel AI SDK (`ai`) permitindo conexão com endpoint local do Ollama (`http://localhost:11434`) ou chaves de API remotas (OpenAI, Gemini, Anthropic).
   - Suporte ao fluxo de entrevista guiada para criação automática de fichas de treino.
4. **Testes de Contrato & Evals com Ollama Local**:
   - Testes unitários de contrato validando input schemas e output schemas de todas as 12 ferramentas.
   - Runner de evals executando testes automatizados contra modelo local do Ollama (zero custo de API) para verificar se o modelo descobre as ferramentas e gera rotinas válidas a partir de prompts em linguagem natural.
