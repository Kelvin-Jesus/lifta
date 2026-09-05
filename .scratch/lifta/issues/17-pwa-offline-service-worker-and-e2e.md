# 17 - PWA Offline Service Worker and E2E Mobile Audits

Type: task
Status: resolved
Blocked by: 14, 15, 16

## Goal

Configurar o Service Worker para operação offline completa com estratégia de cache-first, manifest PWA com suporte a safe-areas nativas do iOS, e executar a suite completa de testes End-to-End com Playwright Mobile emulando o iPhone 15, incluindo a auditoria de distração e ergonomia do `ux-journey-architect`.

## Deliverables

1. **Configuração do PWA & Service Worker**:
   - `manifest.webmanifest` com ícones, tema e display `standalone`.
   - Meta tags do iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`).
   - Service worker com cache-first para App Shell (JS, CSS, fontes) e *stale-while-revalidate* em background.
   - Cache sob demanda para mídias de demonstração com limite de armazenamento.
2. **Suite de Testes E2E (Playwright Mobile)**:
   - Emulação de iPhone 15 (viewport 390×844 com suporte a touch e deviceScaleFactor).
   - Teste 1: Happy path de treino completo (início em 1 toque, registro de séries, timer de descanso, conclusão de treino e atualização do heatmap).
   - Teste 2: Operação 100% offline (ativação de offline mode no navegador e verificação de que nenhuma ação falha).
   - Teste 3: Resiliência a crash de memória do iOS (forçar reload da aba no meio do treino e validar restauração de estado exata em <100ms sem perda de séries).
   - Teste 4: Ciclo de backup soberano (exportar `.lifta.json`, limpar banco, importar arquivo e validar restauração integral).
3. **Auditorias Finais do `ux-journey-architect`**:
   - Cognitive Walkthrough com foco em usuário com atenção dividida na academia.
   - Auditoria de ergonomia e alcance de polegar (Thumb Zone).
   - Auditoria de contraste e acessibilidade (WCAG AA).
