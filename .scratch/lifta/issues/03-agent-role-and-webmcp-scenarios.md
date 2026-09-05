# 03 - Agent Role and WebMCP Scenarios

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Quais são os casos de uso reais que você deseja delegar a um agente de IA no Lifta (ex: planejar periodização, sugerir progressão de carga, registrar treino via prompt/áudio, consultar histórico ou analisar platôs), e como essas intenções se mapeiam em operações de domínio?

## Answer

Decisões consolidadas na Rodada 3 de grilling com o usuário:

1. **Princípio Fundamental: Agente como Enhancement 100% Opcional**:
   - O Lifta é um aplicativo completo, ágil e autossuficiente **sem nenhuma necessidade de IA**. O usuário pode criar rotinas, registrar séries e acompanhar evolução puramente pela UI humana local-first e offline.
   - Caso o usuário decida configurar uma chave de API, a camada de agente é ativada como um assistente de altíssima fidelidade.

2. **Ciclo Completo de Casos de Uso do Agente**:
   - **Planejamento**: Entrevista estilo *grilling* para descoberta de objetivos, rotina e restrições, seguida de geração automática e persistência de rotinas no banco local.
   - **Análise & Evolução**: Consultas em linguagem natural sobre histórico ("qual foi meu volume de peito este mês?", "como está minha progressão no supino?").
   - **Manutenção Inteligente**: Substituição ou ajuste fino de exercícios em rotinas ("troque a puxada por remada curvada na ficha B").
   - **Registro Assistido**: Capacidade de registrar treinos ou séries avulsas via texto em linguagem natural.

3. **Arquitetura de Presença do Agente (Híbrida)**:
   - **No PWA**: Chat drawer embutido ("Assistente Lifta") que orquestra a entrevista e invoca diretamente as operações de domínio locais através da camada WebMCP.
   - **No Browser**: Registro simultâneo no padrão W3C WebMCP (`document.modelContext`). Extensões de navegador, agentes externos ou runners de teste automatizados podem interagir com o Lifta pelas mesmas ferramentas.

4. **Governança & Confirmação Humana (Human-in-the-Loop)**:
   - *Leitura* (`list_routines`, `get_routine`, `search_exercises`, `get_workout_history`): Autônoma e imediata.
   - *Criação* (`create_routine`, `log_workout_session`): Direta, com notificação visual (toast).
   - *Destrutivas / Alterações Críticas* (`delete_routine`, `update_routine`, `delete_workout_session`): Exigem aprovação humana explícita através de preview/modal na interface antes de efetivar no banco.

5. **Provedores de LLM & Privacidade**:
   - Suporte a múltiplos provedores (OpenAI, Anthropic, Google Gemini, OpenRouter, Groq e instâncias locais via Ollama/LM Studio).
   - API keys armazenadas estritamente no `localStorage` do dispositivo (sem tráfego para servidores intermediários proprietários).
