# Wayfinder Map: Lifta

## Destination

Descobrir e especificar um PWA offline-first pequeno, extremamente bom para meu caso de uso, com uma interface humana excelente e uma interface estruturada para agentes através de WebMCP.

## Notes

- **Effort**: Lifta (PWA local-first, offline-first, agent-ready)
- **Identidade**:
  - Nome: Lifta
  - Repository: lifta
  - Package/app id: lifta
  - PWA name: Lifta
  - Tagline principal: *Treine. Registre. Evolua.*
  - Mensagens secundárias: *"Seu treino, sem complicação."*, *"Seu treino fica com você."*, *"Treino simples, progresso visível."*
- **Skills consultadas**: `wayfinder`, `grilling`, `domain-modeling`, `prototype`, `effect-ts`, `to-spec`, `emil-design-eng`, `apple-design`, `web-design-guidelines`.
- **Restrições técnicas consolidadas**:
  - **Frontend**: Solid-js + TypeScript (com Tailwind CSS v4 e design tokens nativos do iOS)
  - **Domínio & Serviços**: Effect TypeScript (`effect`, `@effect/schema`) para entidades imutáveis, validação, repositórios assíncronos e erros tipados
  - **Armazenamento**: IndexedDB nativo envelopado com serviços Effect (zero dependências pesadas de banco externo)
  - **IA & Assistente**: Vercel AI SDK (`ai`) com suporte nativo ao Ollama local (`http://localhost:11434`) para custo zero e testes automatizados, além de provedores em nuvem com API key do usuário
  - **WebMCP**: Padrão W3C 2026 (`document.modelContext`) com polyfill e canal de automação `postMessage` para testes E2E com Playwright

## Decisions so far

- [01 - Workout Workflow and User Profile](issues/01-workout-workflow-and-user-profile.md): Treino em academia (máquinas, pesos livres, cardio/esteira/bike), workflow de 1 toque pré-carregado com a última carga, timer de descanso e duração de set opcional, sobrecarga progressiva + histórico limpo, e agente integrado via WebMCP (com API key opcional e entrevista interativa estilo grilling) para gerar treinos salvos localmente.
- [02 - Domain Model and Entities](issues/02-domain-model-and-entities.md): Entidades desacopladas (Routine vs WorkoutSession), polimorfismo discriminado tipado (ResistanceSet com peso/reps/duração vs CardioSet com tempo/distância/velocidade), catálogo híbrido (open source com GIFs + customizados), ActiveSession única com persistência reativa imediata no IndexedDB e glossário formal no CONTEXT.md.
- [03 - Agent Role and WebMCP Scenarios](issues/03-agent-role-and-webmcp-scenarios.md): Agente como aprimoramento 100% opcional (app completo e autônomo sem IA); ciclo completo (grilling para criação de rotinas, histórico, substituição de exercícios e registro via NL); arquitetura híbrida (chat embutido com chave local + ferramentas expostas via document.modelContext); e confirmação humana obrigatória para operações destrutivas.
- [04 - UX and Interaction Model](issues/04-ux-and-interaction-model.md): Bottom bar no mobile com navegação tipo feed contínuo/scroll snap suave entre dias/rotinas, cards de exercício com alvos de toque grandes (min 48px), Floating Rest Dock não-obstrutivo com vibração/som, layout em 2 colunas no desktop e adoção de Solid-js + TypeScript.
- [05 - Prototype Workout Flow](issues/05-prototype-workout-flow.md): Design de utilitário nativo de iPhone (iOS Inset Grouped, surfaces neutras escuras, zero emojis/vibecode, separadores de 0.5px, um único azul de destaque #0a84ff, alvos táteis de 44px, steppers ágeis, tipografia com números tabulares e botão de ação na base).
- [06 - Storage and Offline Strategy](issues/06-storage-and-offline-strategy.md): IndexedDB nativo envelopado em camadas de serviços Effect (Effect Schema + Repositories), zero dependência externa pesada, migrações declarativas locais e export/import em JSON e CSV 100% offline.
- [07 - WebMCP Design and Security](issues/07-webmcp-design-and-security.md): Catálogo híbrido de ferramentas (operações canônicas de domínio + helpers de alto nível), dual interface (polyfill W3C document.modelContext + canal postMessage para testes e evals), e aprovação humana obrigatória via Proposal Card ou System Dialog.
- [08 - Architecture and Effect Boundaries](issues/08-architecture-and-effect-boundaries.md): Camadas limpas (Domain com Effect Schema, Services Effect, Application adapters para UI e WebMCP, UI em Solid-js), Vercel AI SDK para assistente (Ollama local / provedores remotos), pirâmide de testes em 4 níveis (Vitest, contratos WebMCP, evals via Ollama local, Playwright E2E), personalização de cor de destaque (Azul padrão, Roxo Índigo) e backup soberano em arquivo JSON único.
- [09 - Consolidate Spec](issues/09-consolidate-spec.md): Especificação completa e detalhada compilada via `/to-spec` e publicada em `.scratch/lifta/spec.md` com status `ready-for-agent`.

## Implementation Frontier (Tracer-Bullet Tickets)

- [10 - Project Scaffold and Domain Core](issues/10-project-scaffold-and-domain-core.md) (`ready-for-agent`, unblocked)
- [11 - Offline Storage and Repositories](issues/11-offline-storage-and-repositories.md) (`open`, blocked by: 10)
- [12 - Exercise Catalog and Body Highlighter](issues/12-exercise-catalog-and-body-highlighter.md) (`open`, blocked by: 10)
- [13 - Active Workout Engine and Core Loop](issues/13-active-workout-engine-and-core-loop.md) (`open`, blocked by: 11, 12)
- [14 - Exercise Carousel and Fluid Sheet](issues/14-exercise-carousel-and-fluid-sheet.md) (`open`, blocked by: 13)
- [15 - Home Dashboard Heatmap and Agenda](issues/15-home-dashboard-heatmap-and-agenda.md) (`open`, blocked by: 11, 12)
- [16 - WebMCP Agent Interface and Evals](issues/16-webmcp-agent-interface-and-evals.md) (`open`, blocked by: 11, 15)
- [17 - PWA Offline Service Worker and E2E](issues/17-pwa-offline-service-worker-and-e2e.md) (`open`, blocked by: 14, 15, 16)

## Out of scope

- Backend remoto próprio ou banco na nuvem no MVP (core estritamente offline-first)
- Autenticação e login com conta externa (dados pertencem 100% ao dispositivo do usuário)
- Feed social, redes de amigos ou compartilhamento online
- Ferramentas de WebMCP que simulam cliques de DOM ou navegação artificial de UI
