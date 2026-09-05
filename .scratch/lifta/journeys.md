# Lifta — Arquitetura de Jornadas do Usuário (User Story Map & IxD)

Documento de referência para modelagem de fluxos, ergonomia e decisões de interação do Lifta.
Elaborado integrando as skills:
- **`user-story-mapping`**: Estrutura de atividades (backbone horizontal) e decomposição em tarefas e fatias.
- **`ux-journey-architect`**: Filosofia anti-IA genérica, auditoria impiedosa de atrito e mapeamento de estados emocionais/estresse.
- **`interaction-design`**: 5 dimensões de IxD, ergonomia da "Thumb Zone", estados de componentes e microinterações táteis.

---

## 1. O Contexto Real de Academia (Design Constraints)

Qualquer fluxo desenhado para o Lifta deve ser validado sob as condições reais e adversas de uso:

| Restrição Física | Impacto no Design | Regra de IxD no Lifta |
| :--- | :--- | :--- |
| **Uso com apenas 1 mão** | O usuário segura a barra ou garrafa com a outra mão. | 100% das ações primárias na **Thumb Zone** (metade inferior da tela). |
| **Mãos suadas / Magnésio** | Toques imprecisos e falhas em gestos delicados. | Alvos de toque generosos (mínimo 44×44px), sem botões pequenos adjacentes. |
| **Atenção dividida / Fadiga** | Batimento a 150+ bpm, respiração ofegante, barulho. | Zero ambiguidade. Zero necessidade de ler parágrafos de texto para agir. |
| **Tempo escasso (45s–90s)** | O descanso deve ser usado para recuperar, não brigar com o app. | Conclusão de série em **1 toque (< 2 segundos)**. |
| **Tela bloqueando no bolso** | O celular é guardado no bolso após cada série. | Restauração de estado atômica no IndexedDB; zero reload ao desbloquear. |
| **Offline obrigatório** | Academias em subsolos ou redes Wi-Fi saturadas. | 100% da lógica, cálculo calórico e assets operando offline. |

---

## 2. User Story Map (Backbone Horizontal)

O mapa de histórias organiza o ciclo completo do praticante em 5 grandes atividades temporais:

```
[Atividade 1]               [Atividade 2]               [Atividade 3]               [Atividade 4]               [Atividade 5]
Chegar & Iniciar Treino  →  Executar & Bater Série  →  Ajustar Desvios na Hora →  Mudar / Substituir      →  Finalizar & Salvar
                            (O Core Loop: 15-25x)       (Carga, Reps, Falha)        (Aparelho Ocupado)          (Heatmap, Backup)
```

### Decomposição Vertical (Passos e Fatias de Entrega)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATIVIDADE 1: CHEGAR & INICIAR TREINO DO DIA                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Passo 1.1: Abrir o app (PWA direto da tela de início)                                               │
│ • Passo 1.2: Reconhecer a rotina prevista (Hero Card do dia baseado na agenda ou rodízio A/B/C)        │
│ • Passo 1.3: 1 toque em "Iniciar Treino de Hoje"                                                       │
│ • Passo 1.4: Entrar direto na tela cheia de treino no Exercício 1                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATIVIDADE 2: EXECUTAR & REGISTRAR SÉRIE (CORE LOOP — EXECUTADO ~4.000× POR ANO)                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Passo 2.1: Consultar meta do treino anterior (peso/reps) em linha sutil de topo                      │
│ • Passo 2.2: Fazer a série física no aparelho                                                          │
│ • Passo 2.3: 1 toque no botão primário gigante de polegar ("Concluir Série X")                         │
│ • Passo 2.4: Linha marcada em verde, feedback háptico sutil (`light impact`)                           │
│ • Passo 2.5: Barra de descanso flutuante inicia contagem regressiva automaticamente                    │
│ • Passo 2.6: Foco visual avança suavemente para a próxima série; celular vai para o bolso               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATIVIDADE 3: AJUSTAR DESVIOS NA HORA (SEM DIGITAÇÃO)                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Passo 3.1: O usuário falhou na repetição 8 em vez de 10 (ou usou peso diferente)                    │
│ • Passo 3.2: Toca no stepper tátil de 44px (`-1r` ou `-2.5kg`)                                        │
│ • Passo 3.3: O número atualiza inline imediatamente sem abrir o teclado virtual do celular             │
│ • Passo 3.4: Conclui a série normalmente                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATIVIDADE 4: MUDAR / SUBSTITUIR EXERCÍCIO (APARELHO OCUPADO)                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Passo 4.1: Máquina ocupada com fila; usuário toca em "Substituir" no topo do exercício              │
│ • Passo 4.2: Abre Bottom Sheet nativo já filtrado nos exercícios que atingem o mesmo músculo alvo      │
│ • Passo 4.3: 1 toque no substituto (ex: Supino Inclinado Halteres substitui Supino Máquina)            │
│ • Passo 4.4: Sessão em andamento atualizada mantendo séries, sem danificar a ficha modelo              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ATIVIDADE 5: FINALIZAR & SALVAR HISTÓRICO SOBERANO                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Passo 5.1: Conclusão da última série do último exercício transforma o botão em "Finalizar Treino"    │
│ • Passo 5.2: Resumo sucinto na tela (tempo total, volume em kg, calorias estimadas via MET)            │
│ • Passo 5.3: Confirmação de 1 toque; snapshot imutável gravado no IndexedDB local                      │
│ • Passo 5.4: Retorno à Home com a célula correspondente no heatmap do GitHub acesa na intensidade certa │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Análise Detalhada das 5 Jornadas Principais (12 Dimensões)

---

### Jornada A: O Core Loop do Treino (Concluir Série & Descansar)
*A jornada mais crítica do produto — responsável por 90% do tempo de interação ativa.*

1. **Trigger**: O praticante completa a última repetição da série, solta a barra/halter e pega o telefone com a mão suada.
2. **Intenção**: Registrar a série realizada no menor tempo humanamente possível, garantir que progrediu em relação à semana passada e descansar os 90 segundos programados.
3. **Entrada**: Tela de treino ativo (100dvh) no exercício atual, com a série vigente em destaque.
4. **Happy Path**:
   - O usuário bate o olho na tela: a carga e as reps já estão pré-preenchidas com os valores do treino anterior;
   - Dá **1 toque** no botão primário de polegar no rodapé (`Concluir Série 2`) ou no check circular da linha;
   - A linha ganha check verde com micro-transição física;
   - O timer de descanso surge na barra inferior flutuante iniciando a contagem regressiva;
   - O celular é bloqueado e guardado no bolso.
5. **Quantidade de Ações**: **1 toque**.
6. **Decisões Exigidas**: Nenhuma no caminho feliz.
7. **Interrupções Possíveis**:
   - Alguém pede para revezar o aparelho;
   - Notificação do WhatsApp aparece;
   - O usuário senta para conversar e esquece de registrar a série.
8. **Erros**:
   - Tocar sem querer na série antes da hora;
   - Toque fantasma por gota de suor na tela.
9. **Recuperação**:
   - Toque de desmarcação instantâneo (toggle reversível no botão de check sem alerta modal);
   - Timer pode ser pulado com 1 toque em `Pular` na barra flutuante.
10. **Conclusão**: Estado persistido no IndexedDB local via Effect Schema atômico; dados imunes a queda de energia ou fechamento de aba.
11. **Feedback**:
    - Tátil: Vibração física suave via Web Vibration API (`navigator.vibrate([15])`);
    - Visual: Linha de série com fundo e check verde;
    - Auditivo: Tom sutil e não-estridente quando o timer atinge zero.
12. **Próximo Passo Provável**: Guardar o celular, respirar e esperar o aviso de término do descanso.

---

### Jornada B: Desvio de Carga / Reps com Uma Mão Só
*Acontece sempre que a academia está cheia (halteres ocupados) ou o usuário atinge a falha antes da meta.*

1. **Trigger**: O praticante fez 8 reps em vez de 10, ou precisou pegar anilhas mais leves.
2. **Intenção**: Atualizar o registro para 8 reps sem interromper o fluxo mental de treino e sem brigar com o teclado do celular.
3. **Entrada**: Linha da série ativa na tabela agrupada.
4. **Happy Path**:
   - Usuário toca 2 vezes no botão `-1` do stepper de repetições;
   - O número muda de 10 para 8 inline (números tabulares, zero deslocamento de layout);
   - Toca em `Concluir Série`.
5. **Quantidade de Ações**: **3 toques rápidos** com o polegar.
6. **Decisões**: Apenas a quantidade de decremento/incremento.
7. **Interrupções**: O descanso já começou psicologicamente; pressa para não perder o tempo de intervalo.
8. **Erros**: Clicar 3 vezes em vez de 2 (passou de 8 para 7).
9. **Recuperação**: Clicar no botão `+1` imediatamente ao lado.
10. **Conclusão**: Novo valor salvo na série atual. O sistema anota internamente que houve ajuste pontual.
11. **Feedback**: Micro-clique táctil nos steppers, sem animações lentas.
12. **Próximo Passo**: Concluir a série e iniciar descanso.

---

### Jornada C: Substituição Imediata de Aparelho (Aparelho Ocupado)
*Ocorre em horários de pico (segunda à noite) onde esperar 10 minutos na fila do leg press arruinaria o treino.*

1. **Trigger**: O praticante chega ao aparelho previsto e encontra 3 pessoas revezando.
2. **Intenção**: Substituir por outro exercício com o mesmo estímulo muscular sem perder o treino e sem ter que reprogramar a rotina inteira.
3. **Entrada**: Botão secundário discreto no cabeçalho do exercício ativo ("Substituir").
4. **Happy Path**:
   - Toca em `Substituir`;
   - Um Bottom Sheet nativo do iOS sobe com sugestões inteligentes do **mesmo grupo muscular primário** no topo da lista (ex: para Supino Reto: Supino Reto Halteres, Supino Articulado, Flexão de Braço);
   - 1 toque no exercício escolhido;
   - O carrossel atualiza o card mantendo as séries e o progresso da sessão ativa;
   - Toast informativo sutil na base: *"Substituído apenas para o treino de hoje"*.
5. **Quantidade de Ações**: **2 toques**.
6. **Decisões**: Qual equipamento livre está mais próximo na academia.
7. **Interrupções**: A máquina original é liberada antes dele começar a substituta.
8. **Erros**: Tocar no exercício errado.
9. **Recuperação**: Botão `Desfazer` no Toast por 5 segundos ou substituir novamente.
10. **Conclusão**: Treino prossegue sem interrupção de ritmo.
11. **Feedback**: Transição fluida horizontal; novo mapa anatômico e instruções carregados instantaneamente.
12. **Próximo Passo**: Iniciar a primeira série do exercício substituto.

---

### Jornada D: Retomada após Bloqueio no Bolso (Resiliência Operacional)
*Acontece 15 a 25 vezes por sessão.*

1. **Trigger**: O celular passa 90 segundos desligado no bolso enquanto o usuário caminha ou bebe água.
2. **Intenção**: Desbloquear o celular com uma mão e continuar o treino imediatamente.
3. **Entrada**: Tela de bloqueio do iOS.
4. **Happy Path**:
   - FaceID desbloqueia o aparelho;
   - O navegador PWA reabre **instantaneamente** na mesma tela, no mesmo exercício, na série seguinte;
   - Zero splash screen, zero tela de carregamento, zero recarregamento forçado para a Home.
5. **Quantidade de Ações**: **0 toques no app** (apenas o desbloqueio do sistema operacional).
6. **Decisões**: Nenhuma.
7. **Interrupções**: O Safari/iOS matou a aba em segundo plano por pressão de memória.
8. **Erros**: Perda do estado do treino.
9. **Recuperação**: O Effect Layer do Lifta restaura o snapshot de `active_session` do IndexedDB em menos de 80ms antes do primeiro frame de renderização. O usuário nem percebe que houve reinício da aba.
10. **Conclusão**: Continuidade absoluta de sessão.
11. **Feedback**: Barra de descanso mostra o tempo restante real (calculado pela diferença entre `performance.now()` / timestamp absoluto).
12. **Próximo Passo**: Preparar-se para a próxima série.

---

### Jornada E: Finalizar o Treino & Visualizar Consistência
*O fechamento da sessão.*

1. **Trigger**: O usuário conclui a última série do último exercício planejado.
2. **Intenção**: Garantir que todos os dados foram salvos com segurança e ver o saldo do treino (tempo, volume, calorias).
3. **Entrada**: Botão primário muda para `Finalizar Treino` com cor de destaque.
4. **Happy Path**:
   - Toca em `Finalizar Treino`;
   - Exibe Sheet com resumo estético e contido:
     - ⏱️ 52 min de treino
     - 🏋️ 4.850 kg de volume acumulado
     - 🔥 ~460 kcal gastas (cálculo fisiológico offline)
     - 📈 3 novos recordes de sobrecarga (PRs)
   - 1 toque em `Salvar e Fechar`;
   - Redireciona para a Home onde o Heatmap estilo GitHub ganha o bloco preenchido com a cor do treino de hoje.
5. **Quantidade de Ações**: **2 toques**.
6. **Decisões**: Nenhuma obrigatória (campo de anotações é opcional e recolhido).
7. **Interrupções**: Bateria fraca (1%); pressa para tomar banho.
8. **Erros**: Tocar em finalizar antes de fazer todas as séries.
9. **Recuperação**: Se houver séries em branco, o sistema avisa com clareza: *"Você ainda tem 2 séries não marcadas. Deseja finalizar mesmo assim?"*.
10. **Conclusão**: `ActiveSession` singleton apagada; `WorkoutSession` imutável gravada no histórico; backup automático preparado.
11. **Feedback**: Animação de preenchimento do heatmap; feedback háptico de sucesso (`heavy impact`).
12. **Próximo Passo**: Guardar o celular na mochila.

---

## 4. Auditoria de Eliminação Agressiva de Fricção (Antes vs. Depois)

Comparativo entre o padrão da indústria (Hevy / Strong) e a abordagem do Lifta:

| Ponto de Atrito | Padrão dos Apps Concorrentes | Solução Otimizada do Lifta | Economia de Fricção |
| :--- | :--- | :--- | :--- |
| **Registrar uma série normal** | Tocar na carga, teclado sobe, digitar, fechar teclado, tocar em check. (4-5 ações) | Carga já pré-preenchida da sessão anterior. **1 toque em Concluir**. | **-80% de toques** |
| **Ajustar carga pequena** | Tocar no input, apagar no backspace, digitar novo número, esconder teclado. | **Steppers táteis de 44px** (`-2.5`, `+2.5`) direto na linha sem teclado virtual. | **Zero teclado na tela** |
| **Timer de Descanso** | Popup modal invasivo ou tela inteira cobrindo o exercício seguinte. | **Floating Rest Bar** estilo Dynamic Island na base, sem bloquear navegação. | **Zero obstrução de tela** |
| **Trocar exercício ocupado** | Entrar em modo de edição da rotina, excluir exercício, buscar no catálogo, reconfigurar séries. | **1 toque em Substituir** → Sheet inteligente com alternativas do mesmo grupo muscular. | **De 8 passos para 2 passos** |
| **Desfazer série marcada errada** | Modal de confirmação: *"Tem certeza que deseja desmarcar?"*. | **Toggle direto reativo**: toca no check e ele desmarca instantaneamente. | **Zero modais inúteis** |
| **Navegar entre exercícios** | Rolar uma lista vertical infinita de 40 séries perdendo o ponto de foco. | **Carrossel horizontal 100dvh** com scroll snap por exercício (1 exercício por tela). | **Foco mental absoluto** |

---

## 5. O Teste Ácido dos 365 Dias

> *"Se alguém usasse o Lifta 4 vezes por semana durante um ano (mais de 200 treinos e 4.000 séries registradas!), quais pequenas fricções desta interface se tornariam irritantes?"*

Submetemos a interface a essa pergunta como critério de corte e identificamos 5 armadilhas que foram terminantemente banidas da spec:

1. **🚫 Bloqueio por Confirmações Excessivas**:
   - *A irritação*: Após 50 treinos, ter que clicar em "Sim, tenho certeza" toda vez que encerra um descanso ou desmarca uma série faz o usuário querer desinstalar o app.
   - *Decisão*: Confirmações são reservadas **exclusivamente** para deleção de dados históricos. Ações de treino são otimistas e reversíveis com 1 toque.

2. **🚫 Teclado Virtual Saltando na Tela**:
   - *A irritação*: O teclado do iOS empurra o rodapé para cima, quebra a rolagem da página e exige tocar fora para sumir.
   - *Decisão*: O teclado nativo só é invocado com toque duplo intencional na célula; 95% das operações diárias ocorrem exclusivamente via botões táteis de 44px.

3. **🚫 Textos Longos e Tutoriais Invasivos**:
   - *A irritação*: Dicas de "Como usar", banners promocionais ou descrições extensas de exercícios toda vez que abre a tela.
   - *Decisão*: *Progressive disclosure*. A tela de treino mostra apenas o essencial (músculo alvo, tabela de séries, meta anterior). Detalhes posturais e GIFs vivem no Bottom Sheet acionado sob demanda.

4. **🚫 Dependência de Conexão ou Spinners de Loading**:
   - *A irritação*: A tela travar com um spinner cinza no meio de um agachamento porque o sinal 4G oscilou na academia.
   - *Decisão*: Latência zero. Operação 100% síncrona sobre IndexedDB local via Effect. Nenhum spinner de carregamento no fluxo de treino ativo.

5. **🚫 Ter que Selecionar o Treino Manualmente Todo Dia**:
   - *A irritação*: Ter que entrar numa aba "Rotinas", rolar, achar o "Treino B" e tocar em iniciar.
   - *Decisão*: O Card Hero na Home detecta o dia da semana pela Agenda ou a sequência lógica do rodízio (A → B → C) e coloca o botão "Iniciar Treino de Hoje" na primeira dobra.

---

## 6. Próximos Passos de Validação

1. **Apresentar e alinhar este mapeamento** com o usuário.
2. **Aplicar os testes do `ux-journey-architect`** nos protótipos executáveis:
   - Happy Path verification;
   - Cognitive Walkthrough (usuário distraído na academia);
   - Ergonomic Thumb-Zone audit (iPhone 13/15/Pro Max);
   - Accessibility & High Contrast audit.
3. **Refinar a especificação formal** em `.scratch/lifta/spec.md` incorporando essas garantias ergonômicas antes da decomposição em tickets (`to-tickets`).
