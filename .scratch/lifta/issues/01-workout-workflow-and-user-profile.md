# 01 - Workout Workflow and User Profile

Type: grilling
Status: resolved
Blocked by: 

## Question

Qual é o problema real que o Lifta deve resolver para você, qual é o seu perfil de treino e rotina, e como funciona exatamente o seu workflow no dia a dia da academia (antes, durante a execução de cada série/exercício, e após o treino)?

## Answer

Decisões consolidadas a partir da Rodada 1 de grilling com o usuário:

1. **Dor real & Proposta de Valor**:
   - Baixa fricção no salão: registro ágil, sem popups invasivos, formulários lentos ou bloqueios por paywalls.
   - PWA local-first e offline: dados 100% no dispositivo do usuário, independente de conexão.
   - **Agente Integrado via WebMCP**: o usuário poderá opcionalmente inserir uma API key (e escolher o provedor de LLM desejado). Um agente embutido no PWA conduzirá uma entrevista interativa (estilo *grilling* do Matt Pocock) para entender o perfil/objetivos e gerará rotinas/fichas recomendadas, gravando-as diretamente no banco local através das ferramentas WebMCP (`document.modelContext`).

2. **Perfil e modalidades de treino**:
   - Treino em academia abrangendo:
     - **Máquinas** (peso/placas/pinos, repetições);
     - **Pesos livres** (halteres, barras, anilhas em kg + reps);
     - **Cardio** (esteira e bicicleta: tempo/duração, distância, velocidade/nível).
   - Suporte a biblioteca aberta de exercícios com demonstrações em GIF (ex: `hasaneyldrm/exercises-dataset` ou equivalente), com estratégia de cache offline/on-demand compatível com PWA.

3. **Workflow na academia (minuto a minuto)**:
   - Ficha do dia pré-carregada com os valores da sessão anterior (cargas e repetições sugeridas).
   - Confirmação rápida (1 toque) ou ajuste imediato de carga/reps.
   - Timer de descanso automático entre séries.
   - **Registro opcional de duração do set** (tempo sob tensão de execução da série) além do descanso entre séries.

4. **Conceito de Progresso Visível**:
   - Comparação imediata na tela de treino com a sessão anterior (estímulo direto à sobrecarga progressiva).
   - Histórico cronológico limpo, elegante e direto, sem poluição visual.
