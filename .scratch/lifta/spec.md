# Lifta — Especificação do Produto e Arquitetura

Status: ready-for-agent

## 1. Product

### Identidade
- **Nome**: Lifta
- **Repository**: `lifta`
- **Package / App ID**: `lifta`
- **PWA Name**: Lifta
- **Tagline Principal**: *Treine. Registre. Evolua.*
- **Mensagens Secundárias**:
  - *"Seu treino, sem complicação."*
  - *"Seu treino fica com você."*
  - *"Treino simples, progresso visível."*

### Problema
Praticantes de musculação e condicionamento físico enfrentam atrito excessivo com aplicativos convencionais de treino:
1. **Fricção e Distração no Salão**: Interfaces inchadas (*bloatware*), formulários lentos, excesso de toques para registrar uma série, banners intrusivos e dependência de conexão estável (frequentemente inexistente no subsolo ou em academias lotadas).
2. **Perda de Soberania e Aprisionamento de Dados**: Históricos trancados em formatos proprietários sob paywalls ou risco de perda com encerramento de serviços na nuvem.
3. **Falta de Interoperabilidade com Agentes de IA**: Inexistência de uma interface estruturada e padronizada para que agentes autônomos ou assistentes possam analisar sobrecarga progressiva, periodização e gerar rotinas de treino sem simular cliques frágeis no DOM.

### Usuário & Perfil
Praticante regular de academia que realiza:
- **Musculação / Pesos Livres** (halteres, barras, anilhas em kg e repetições);
- **Máquinas** (pesos, placas, pinos e repetições);
- **Cardio** (esteira e bicicleta com controle de tempo, distância e velocidade).
Busca uma ferramenta ágil, discreta e focada, com sensação de utilitário nativo de iPhone.

### Principais Jobs-to-be-Done (JTBD)
1. *Quando estou na academia entre séries*, quero confirmar minha carga e repetições com 1 toque e ver imediatamente a meta do treino anterior, para garantir sobrecarga progressiva sem perder o foco no descanso.
2. *Quando termino uma série*, quero que um timer de descanso inicie automaticamente sem cobrir a tela e me avise com vibração discreta, para manter a densidade do meu treino.
3. *Quando estou planejando minha rotina*, quero poder conversar com um assistente em linguagem natural (via entrevista interativa) para gerar uma divisão de treino completa e personalizada diretamente no meu app.
4. *Quando abro o app na tela inicial*, quero ver minha consistência e calorias estimadas em uma grade estilo GitHub, além de poder alternar para uma **agenda semanal** que mostra os dias programados de cada treino.
5. *Quando consulto um exercício ou uma rotina*, quero ver um **mapa de calor muscular anatômico** em vetor SVG destacando os músculos primários e secundários na cor de destaque que escolhi para o app.
6. *Quando quero garantir a segurança dos meus dados*, quero exportar e importar tudo em um único arquivo JSON ou CSV, 100% offline.

### Escopo (Core Features)
- PWA instalável 100% funcional offline (App Shell, Service Worker, banco IndexedDB local).
- Registro ágil de treinos pré-carregados com valores da última sessão (1 toque para concluir série).
- Temporizador de descanso não-obstrutivo com vibração/áudio sutil.
- Ficha de exercícios híbrida com catálogo aberto (+1.300 exercícios com GIFs de demonstração) e suporte a exercícios customizados.
- **Mapa Muscular Anatômico SVG**: Destaque visual dos grupos musculares (primários e secundários) por exercício e cobertura total da ficha na cor principal do usuário.
- **Heatmap de Consistência & Agenda Semanal Expandível**: Grade estilo GitHub com intensidades de calorias calculadas offline (MET) + visualização de agenda por dias da semana programados.
- Interface WebMCP (W3C `document.modelContext`) operando diretamente sobre o banco local com suporte a fallback/polyfill e testes.
- Assistente de IA integrado opcional (via Vercel AI SDK) suportando modelos locais (Ollama) ou provedores em nuvem (OpenAI, Gemini, Anthropic, OpenRouter).
- Tema claro e escuro nativo (Apple Dark / Apple Light) com seletor de cor de destaque (Azul padrão, Roxo Índigo e cores do sistema).
- Backup e restauração soberana em arquivo JSON único.

### Não-Objetivos (Out of Scope)
- Servidor central obrigatório, banco em nuvem ou autenticação online para o core do produto.
- Feed social, compartilhamento em rede ou ranking de amigos.
- WebMCP tools que dependam de cliques no DOM ou simulação visual de usuário.
- Custo obrigatório com APIs de LLM (o app é autônomo sem IA, e os evals rodam via Ollama local).

---

## 2. User Stories

1. Como praticante, quero que a ficha do dia venha pré-preenchida com os pesos e repetições da minha última sessão, para que eu possa confirmar cada série com apenas 1 toque.
2. Como praticante, quero ajustar cargas e repetições por meio de steppers táteis de 44px (`+2.5kg`, `-2.5kg`, `+1r`, `-1r`), para evitar que o teclado virtual do celular suba e cubra a tela na academia.
3. Como praticante, quero ver uma barra de descanso flutuante na base da tela assim que terminar uma série, com atalhos de `+30s` e `Pular`, para descansar o tempo exato planejado.
4. Como praticante, quero que o aparelho vibre suavemente ao término do descanso, para que eu saiba a hora de voltar ao aparelho mesmo ouvindo música com fones.
5. Como praticante, quero poder abrir uma animação em GIF do exercício em um modal nativo com 1 toque, para tirar dúvidas rápidas sobre a execução postural.
6. Como praticante, quero poder substituir um exercício na hora caso o aparelho esteja ocupado, mantendo a integridade da minha sessão.
7. Como praticante, quero navegar entre os exercícios do treino através de um carrossel horizontal em tela cheia com scroll snap suave, para manter o foco exclusivamente no movimento atual.
8. Como praticante, quero ver na tela inicial um grid estilo GitHub com intensidades de cor proporcionais às calorias estimadas gastas, para ter reforço positivo de consistência.
9. Como praticante, quero que o cálculo calórico seja executado offline no meu próprio aparelho usando equações fisiológicas (MET), sem depender de internet.
10. Como praticante, quero escolher entre modo claro e escuro e alternar a cor de destaque entre Azul Apple e Roxo Índigo, para personalizar a estética ao meu gosto.
11. Como praticante, quero inserir uma API key e selecionar meu provedor favorito (ou Ollama local) para conversar com um assistente que conduza uma entrevista e gere minhas rotinas automaticamente.
12. Como agente de IA, quero descobrir ferramentas tipadas via `document.modelContext` para consultar exercícios, criar rotinas e analisar o progresso de cargas do usuário.
13. Como praticante, quero receber um card de confirmação visual no chat antes que o agente apague ou sobrescreva qualquer rotina ou histórico existente.
14. Como praticante, quero que o treino em andamento salve o estado no IndexedDB a cada toque, para que nenhuma informação se perca caso o celular desligue ou a aba feche.
15. Como praticante, quero exportar todas as minhas configurações, rotinas e histórico em um arquivo JSON único e seguro para backup ou migração de celular.
16. Como praticante durante o treino ativo, quero visualizar com destaque e tamanho generoso o músculo mais treinado pelo exercício atual em um mapa anatômico vetorial na cor de destaque do app, acompanhado dos músculos sinergistas, para manter a consciência corporal e foco na execução.

---

## 3. UX & Interface Specification

### Filosofia Visual
- **Design de Utilitário Nativo de iPhone**: Inspiração estrita no ecossistema iOS (Apple Health, Fitness e utilitários de produtividade).
- **Sobriedade e Restrição**: Zero gradientes decorativos, zero textos coloridos brilhantes, zero sombras estouradas (*glow*), zero emojis em botões e banners.
- **Estrutura Inset Grouped**: Agrupamentos em tabelas arredondadas nativas (`border-radius: 14px`), separadores sutis de 0.5px e tipografia com números tabulares (`tabular-nums`).
- **Alvos de Toque Seguros**: Todos os botões interativos principais possuem área mínima de 44×44px.

### Arquitetura de Informação & Telas
1. **Treinar (Home)**:
   - Header com marca, alternador de tema (Sol/Lua) e atalho do Assistente.
   - Heatmap de consistência e calorias (grade de 12 semanas estilo GitHub) com botão para alternar para a **Agenda Semanal**.
   - Card Hero da rotina do dia ("Treino A • Peito e Tríceps") com **visualizador anatômico ampliado** destacando os grupos musculares da ficha e botão "Iniciar Treino".
   - Atalhos para outras rotinas cadastradas.
   - Banner de sessão ativa caso haja treino em andamento.
2. **Treino Ativo (Active Session - Full Viewport 100dvh)**:
   - Top Bar com botão de saída segura, tempo decorrido tabular, alternador de tema e número do exercício (`X de N`).
   - Barra de progresso segmentada interativa.
   - Carrossel horizontal de tela cheia (100dvh) com scroll snap por exercício.
   - **Card de Foco Muscular Anatômico em Destaque**:
     - Visualização anatômica generosa em vetor SVG (~80×120px) com contraste nítido em tema claro e escuro.
     - Destaque vibrante do **músculo mais treinado (foco primário)** preenchido na cor de destaque do usuário (`--accent`).
     - Indicação clara de músculos sinergistas / secundários com preenchimento translúcido.
     - Tipografia proeminente com título do músculo, nível de ativação e tags de grupos musculares.
     - Toque no card abre o inspetor anatômico com visão dupla (frente e costas).
   - Banner sutil de meta de sobrecarga progressiva baseada no treino anterior.
   - Inset Grouped Table com linhas de séries: Série #, Carga com steppers de 44px, Repetições com steppers de 44px, e botão circular de Concluir.
   - Floating Rest Bar (Dynamic Island style) na base com contagem regressiva e atalhos de `+30s` e `Pular`.
   - Bottom Sheet nativo do iOS com guia postural, demonstração em GIF e anatomia detalhada.
3. **Rotinas**:
   - Lista das fichas do usuário (A, B, C) com resumo de grupos musculares e quantidade de exercícios.
   - Ações: criar rotina manual ou iniciar entrevista com o agente.
4. **Histórico**:
   - Linha do tempo cronológica com data, tempo total, calorias estimadas e detalhes de volume.
5. **Exercícios**:
   - Catálogo com barra de busca, filtros por músculo/equipamento, reprodução de GIFs e criação de exercícios customizados.

### Temas e Acessibilidade
- **Dark Mode**: Fundo preto puro OLED (`#000000`), superfícies agrupadas `#1c1c1e`, superfícies elevadas `#2c2c2e`, texto `#ffffff`.
- **Light Mode**: Fundo cinza nativo (`#f2f2f7`), superfícies agrupadas `#ffffff`, texto `#000000`.
- **Destaque**: Padrão Azul Apple (`#007aff` / `#0a84ff`), com suporte a Roxo Índigo (`#5856d6` / `#5e5ce6`).
- Suporte a `prefers-reduced-motion` desativando transições físicas para usuários com sensibilidade vestibular.
- Respeito completo às safe areas (`env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`).

---

## 4. Domain Model

### Entidades Canônicas (definidas no CONTEXT.md)
- `Routine`: Template/modelo reutilizável contendo nome, descrição, lista ordenada de exercícios, metas de séries e dias programados na semana (`scheduledDays?: Weekday[]`).
- `WorkoutSession`: Registro concreto e histórico de um treino executado em uma data/hora específica, imutável após finalização.
- `ActiveSession`: Instância única em andamento no estado do app, persistida reativamente a cada toque.
- `Exercise`: Movimento físico catalogado com `primaryMuscles: MuscleGroup[]`, `secondaryMuscles: MuscleGroup[]`, equipamento necessário, e instruções/GIF.
- `MuscleMap`: Representação vetorial anatômica dos grupos musculares (peitoral, dorsais, deltoides, bíceps, tríceps, quadríceps, isquiotibiais, glúteos, panturrilhas, abdômen) dinamicamente colorida na cor do tema do usuário.
- `ResistanceSet`: Série de musculação contendo `weightKg`, `reps`, `durationSeconds?`, `restSeconds?`, `rpe?`, `kind: 'normal' | 'warmup' | 'dropset' | 'failure'`.
- `CardioSet`: Bloco aeróbico contendo `durationMinutes`, `distanceKm?`, `speedKmh?`, `incline?`, `calories?`.
- `Settings`: Configurações locais (tema, cor de destaque, peso corporal para cálculo MET, provedor/chave de LLM opcional).

### Invariantes do Domínio
1. **Unicidade de Sessão Ativa**: No máximo 1 `ActiveSession` pode existir simultaneamente. Iniciar novo treino exige descartar ou concluir a anterior.
2. **Imutabilidade Histórica**: Uma vez concluída, a `WorkoutSession` grava um snapshot dos dados executados; alterações posteriores na `Routine` original não alteram o histórico.
3. **Cálculo Determinístico de Calorias**: Toda sessão finalizada calcula e armazena o gasto calórico estimado via fórmula de MET baseada na modalidade, duração e carga.
4. **Série Válida**: Séries de musculação exigem `weightKg >= 0` e `reps >= 1`.

### Tipagem de Erros (Effect)
- `EntityNotFoundError`: Identificador de rotina ou exercício inexistente.
- `ActiveSessionConflictError`: Tentativa de iniciar treino com outra sessão em andamento.
- `ValidationError`: Carga ou repetições inválidas.
- `StorageError`: Falha em transação do IndexedDB.
- `SchemaMigrationError`: Incompatibilidade estrutural de versão local.

---

## 5. Offline & Storage Architecture

### Persistência Local
- **Motor**: IndexedDB nativo envelopado em camada de serviços com **Effect Schema** e **Effect Context/Layer**.
- **Object Stores**:
  - `routines`: chave primária `id` (UUID), índice por `updatedAt`.
  - `workout_sessions`: chave primária `id` (UUID), índice por `startedAt`.
  - `active_session`: store singleton com o treino em andamento.
  - `custom_exercises`: chave primária `id`, índice por `muscleGroup`.
  - `settings`: store chave-valor para preferências locais e API keys.

### PWA & Service Worker
- **Estratégia de Cache**:
  - App Shell (HTML, CSS, bundles JavaScript do Solid-js, fontes): *Cache-first* com atualização em background (*stale-while-revalidate*).
  - Assets e GIFs de exercícios: *Cache on-demand* (lazy caching) com limite de armazenamento para não inflar o dispositivo.
- **Comportamento de Atualização**: O Service Worker detecta nova versão e ativa notificação sutil para recarregar quando o usuário não estiver em sessão de treino ativa.

### Migrações & Backup
- Versionamento incremental nativo (`db.version`) gerenciado por array de migrações declarativas em Effect.
- **Exportação Unificada**: Gera arquivo `.lifta.json` contendo schema version, configurações, rotinas, histórico e exercícios.
- **Exportação CSV**: Relatório tabular de todas as séries para análise em planilhas externas.
- **Importação com Dry-Run**: Validação completa dos dados via Effect Schema antes de realizar a gravação no IndexedDB.

---

## 6. Agent Interface (WebMCP)

### Especificação de Ferramentas (`document.modelContext`)

| Tool | Purpose | Input Schema | Output Schema | Mutates | Confirmation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `search_exercises` | Busca no catálogo por texto, músculo ou equipamento | `{ query?: string, muscleGroup?: string, equipment?: string }` | `{ exercises: ExerciseSummary[] }` | Não | Nenhuma |
| `get_exercise_details` | Retorna instruções completas e metadados do exercício | `{ exerciseId: string }` | `ExerciseDetail` | Não | Nenhuma |
| `list_routines` | Lista todas as rotinas cadastradas | `{}` | `{ routines: RoutineSummary[] }` | Não | Nenhuma |
| `get_routine` | Retorna exercícios e séries de uma rotina | `{ routineId: string }` | `Routine` | Não | Nenhuma |
| `create_routine` | Salva uma nova rotina gerada | `{ name: string, description?: string, exercises: RoutineExerciseInput[] }` | `{ routineId: string, routine: Routine }` | Sim | Toast informativo |
| `update_routine` | Modifica uma rotina existente | `{ routineId: string, patch: RoutinePatch }` | `{ routine: Routine }` | Sim | **Exige Confirmação** |
| `delete_routine` | Apaga permanentemente uma rotina | `{ routineId: string }` | `{ success: boolean }` | Sim | **Exige Confirmação** |
| `replace_exercise_in_routine` | Helper de alto nível: troca um exercício mantendo séries | `{ routineId: string, oldExerciseId: string, newExerciseId: string }` | `{ routine: Routine }` | Sim | **Exige Confirmação** |
| `get_workout_history` | Consulta histórico de sessões | `{ limit?: number, fromDate?: string, toDate?: string }` | `{ sessions: WorkoutSessionSummary[] }` | Não | Nenhuma |
| `get_exercise_progress` | Helper de alto nível: cargas e 1RM estimado de um exercício | `{ exerciseId: string, periodDays?: number }` | `{ history: ProgressPoint[], estimated1RM: number }` | Não | Nenhuma |
| `log_workout_session` | Registra uma sessão de treino completa | `WorkoutSessionInput` | `{ sessionId: string, summary: SessionSummary }` | Sim | Toast informativo |
| `delete_workout_session` | Remove um treino do histórico | `{ sessionId: string }` | `{ success: boolean }` | Sim | **Exige Confirmação** |

### Fallback e Governança
- **Polyfill W3C 2026**: Garante presença de `document.modelContext.registerTool({ name, description, inputSchema, handler })` em qualquer navegador.
- **Canal de Testes (`postMessage`)**: Permite que Playwright ou agentes em processos externos invoquem ferramentas e escutem `CustomEvent('webmcp:ready')`.
- **Human-in-the-Loop**: Proposal Card no chat ou System Approval Dialog no rodapé antes de executar qualquer mutação destrutiva.

---

## 7. Architecture & Stack

```
UI (Solid-js + Tailwind v4)
          ↓
Application Layer (Adapters & Signals)
    ↙                     ↘
Domain Services (Effect)   WebMCP Tools (document.modelContext)
    ↓
Local Database (IndexedDB + Effect Schema)
```

- **Frontend**: **Solid-js + TypeScript** (reatividade granular com Signals, zero overhead de Virtual DOM em timers de 1s, bundle ~7kB).
- **Design System**: Tailwind CSS v4 customizado com design tokens nativos do iOS (Apple Inset Grouped, SF Pro, alvos de 44px).
- **Mapa Muscular Anatômico**: **`body-highlighter`** (polígonos anatômicos SVG de alta precisão anterior/posterior, sem dependências externas pesadas, estilizado com as cores e contraste do tema).
- **Core Domain & Services**: **Effect** (`effect`, `@effect/schema`) para entidades imutáveis, validação de tipos, repositórios assíncronos e tratamento estruturado de erros.
- **AI Assistente**: **Vercel AI SDK** (`ai`) orquestrando streaming de chat e tool calling para provedores remotos e instâncias locais do **Ollama** (`http://localhost:11434`).

---

## 8. Testing Strategy

1. **Unit & Domain Tests (Vitest + Effect)**:
   - Cálculos determinísticos de calorias (equações MET para musculação e cardio).
   - Validações e decodificações de Effect Schema.
   - Transações e migrações do IndexedDB em ambiente in-memory.
2. **WebMCP Contract Tests (Vitest)**:
   - Execução automatizada das 12 ferramentas WebMCP contra schemas de entrada e saída.
3. **Agent Eval em Linguagem Natural (Ollama Local)**:
   - Teste automatizado com modelo rodando localmente no Ollama (zero custo) avaliando a descoberta e uso autônomo das ferramentas WebMCP para criação de treinos a partir de prompts.
4. **End-to-End Tests (Playwright Mobile)**:
   - Emulação de iPhone (390×844 com touch).
   - Testes de ciclo completo: offline start, registrar séries, contagem regressiva do timer de descanso, restauração pós-recarregamento e exportação de backup.

---

## 9. Definition of Done (Agent-Ready)

O Lifta será considerado concluído e pronto para entrega quando:
1. Um usuário humano conseguir realizar todo o ciclo (iniciar treino, bater séries, consultar histórico e exportar dados) através da interface Solid-js 100% offline.
2. Um agente conseguir realizar os mesmos fluxos essenciais através das ferramentas WebMCP (`document.modelContext`), sem desvios de regras de negócio.
3. O teste automatizado de eval com o Ollama local demonstrar a conclusão com sucesso de um objetivo de treino guiado por linguagem natural.
