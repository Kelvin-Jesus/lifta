# 09 - Consolidate Spec

Type: task
Status: resolved
Blocked by: 05, 06, 07, 08

## Question

Consolidar todas as decisões de produto, UX, domínio, persistência offline, interface WebMCP, arquitetura e testes no documento de especificação `.scratch/lifta/spec.md` usando a skill `to-spec` para revisão final do usuário antes da decomposição em tickets de implementação.

## Answer

Especificação consolidada com sucesso e publicada no issue tracker local em [`.scratch/lifta/spec.md`](../spec.md), com status `ready-for-agent`.

O documento cobre de ponta a ponta:
1. **Product**: Identidade (Lifta: *Treine. Registre. Evolua.*), problema real, usuário, Jobs-to-be-Done, escopo core e não-objetivos.
2. **User Stories**: 15 histórias de usuário numeradas cobrindo desde o toque de registro no salão até a invocação de ferramentas por agentes e exportação de backup.
3. **UX**: Design restrito e elegante de utilitário nativo de iPhone (Inset Grouped), suporte completo a tema claro e escuro, seletor de cores de destaque (Azul padrão e Roxo Índigo), e alvos táteis de 44px.
4. **Domain**: Entidades canônicas do CONTEXT.md, invariantes de sessão única, fórmulas fisiológicas determinísticas de calorias (MET) 100% offline e erros tipados em Effect.
5. **Offline & Storage**: IndexedDB nativo envelopado com Effect Schema e Repositories, Service Worker com cache-first e backup unificado em arquivo JSON único.
6. **Agent Interface**: Catálogo completo das 12 ferramentas WebMCP (`document.modelContext`), tabela de schemas e governança com confirmação humana obrigatória para operações destrutivas.
7. **Architecture**: Solid-js + TypeScript, Effect, Vercel AI SDK para assistente (Ollama local e provedores em nuvem).
8. **Testing Strategy**: Pirâmide em 4 níveis (Vitest unitário, contratos WebMCP, eval via Ollama local a custo zero, e Playwright E2E emulando iPhone).
9. **Definition of Done**: Validação dos fluxos por humanos (UI) e agentes (WebMCP).
