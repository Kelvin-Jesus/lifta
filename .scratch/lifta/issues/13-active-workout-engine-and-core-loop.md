# 13 - Active Workout Engine and Core Loop

Type: task
Status: open
Blocked by: 11, 12

## Goal

Construir a máquina de estados reativa da sessão de treino em andamento no Solid-js, implementando o "Core Loop" de academia com conclusão de série em 1 toque (< 2s), steppers táteis de 44px sem teclado virtual, barra de descanso flutuante estilo Dynamic Island e vibração física háptica.

## Deliverables

1. **State Machine da Sessão Ativa (Solid-js Signals)**:
   - Gerenciamento reativo de tempo decorrido, índice de exercício ativo, séries concluídas e timer de descanso.
   - Sincronização atômica imediata no IndexedDB a cada toque (zero perda de dados se o celular desligar).
   - Antecipação automática de cargas e repetições do último treino registrado.
2. **Tabela de Séries Agrupada (iOS Inset Grouped)**:
   - Linhas com Número de Série, Carga, Repetições e Botão de Status Circular (44×44px).
   - Steppers táteis de 44px integrados na linha (`-2.5kg`, `+2.5kg`, `-1r`, `+1r`) para ajustes rápidos sem abrir teclado virtual.
   - Teclado nativo invocado exclusivamente via toque duplo intencional na célula.
   - Conclusão em 1 toque no botão primário gigante de polegar (`Concluir Série X`) ou no check circular.
   - Toggle direto e reversível para desmarcar sem alertas modais de confirmação.
3. **Floating Rest Bar (Dynamic Island Style)**:
   - Pílula flutuante na base com contagem regressiva em números tabulares.
   - Atalhos táteis de `+30s` e `Pular`.
   - Disparo de vibração háptica suave (`navigator.vibrate`) e áudio discreto ao término.
4. **Testes de Integração**:
   - Ciclo de bater séries, progressão de foco, cancelamento de timer e persistência de dados.
