# 08 - Architecture and Effect Boundaries

Type: grilling
Status: resolved
Blocked by: 02, 06, 07

## Question

Como desenhar os limites arquiteturais do Lifta para garantir que a UI humana e o WebMCP consumam os mesmos serviços de domínio (sem duplicação), onde exatamente o Effect TypeScript será empregado (Services, Repositories, Schemas, Erros Tipados) versus Solid-js puro, e como manter a codebase modular e agent-friendly?

## Answer

Decisões de arquitetura consolidadas com o usuário na Rodada 6:

1. **Separação em Camadas Limpas (Domain, Services, Application, UI)**:
   - `src/domain/`:
     - Schemas puros e imutáveis com **Effect Schema** (`Routine`, `WorkoutSession`, `Exercise`, `Settings`).
     - Erros de domínio tipados (`EntityNotFoundError`, `ValidationError`, `SessionAlreadyActiveError`, `StorageError`).
     - Fórmulas determinísticas de cálculo metabólico (MET e calorias).
   - `src/services/`:
     - Serviços Effect isolados: `DatabaseService` (IndexedDB nativo), `RoutineService`, `SessionService`, `ExerciseService`.
     - 100% testáveis sem DOM e sem dependência de framework visual.
   - `src/application/`:
     - Adapters que expõem as operações de domínio:
       - Para a UI (Solid-js): funções reativas limpas baseadas em Promises e Signals.
       - Para o WebMCP: registro unificado de ferramentas no `document.modelContext` consumindo os mesmos serviços de domínio.
   - `src/ui/`:
     - Componentes em **Solid-js + TypeScript** com Tailwind CSS v4, seguindo a estética de utilitário nativo de iPhone (*Inset Grouped*, alvos de 44px, zero vibecode/emojis).

2. **Camada de IA do Assistente com Vercel AI SDK**:
   - Uso da biblioteca open-source Vercel AI SDK para orquestrar streaming e tool calling com máxima simplicidade de código e manutenção.
   - Suporte nativo a provedores locais (Ollama em `http://localhost:11434`) e provedores em nuvem caso o usuário insira sua chave (OpenAI, Anthropic, Gemini, Groq, OpenRouter).

3. **Estratégia Completa de Testes em 4 Níveis**:
   - **Nível 1: Testes Unitários de Domínio (Vitest + Effect)**: Fórmulas de calorias, validações de schemas e migrações do IndexedDB em milissegundos.
   - **Nível 2: Testes de Contrato WebMCP (Vitest)**: Validação estruturada de inputs e outputs das 12 ferramentas WebMCP contra repositório em memória.
   - **Nível 3: Evals de Agente em Linguagem Natural (Ollama Local)**: Executados exclusivamente via Ollama local (zero custo de API) para testar a capacidade do modelo de descobrir e acionar ferramentas do Lifta.
   - **Nível 4: Testes End-to-End no Mobile (Playwright)**: Emulação de iPhone (viewport e touch) testando fluxos reais de treino, timers e persistência offline.

4. **Personalização da Cor de Destaque (Accent Color)**:
   - Cor padrão: **Azul Apple** (`#007aff` / `#0a84ff`).
   - Opção de **Roxo Índigo** (`#5856d6` / `#5e5ce6`), além de opções adicionais do sistema (Esmeralda, Âmbar, Coral).
   - Persistência imediata da preferência nas configurações locais.

5. **Backup Unificado de Dados e Configurações**:
   - Exportação e importação completa em **arquivo JSON único** contendo metadados de versão, configurações de tema/cor, peso corporal, todas as rotinas, sessões históricas e exercícios customizados.
   - Validação atômica e prévia com Effect Schema na importação antes de aplicar no banco local.
