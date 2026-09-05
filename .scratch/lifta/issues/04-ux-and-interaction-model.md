# 04 - UX and Interaction Model

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Como deve ser a experiência e a ergonomia de navegação no mobile durante o treino (interação rápida, dedos suados, tela travada/destravada, descansos) versus no desktop (planejamento, histórico detalhado, atalhos de teclado)?

## Answer

Decisões consolidadas na Rodada 4 de grilling com o usuário:

1. **Navegação Geral e Feed Dinâmico**:
   - **Mobile**: Bottom Navigation bar ergonômica com 4 seções principais (Treinar, Rotinas, Histórico, Exercícios) + transição contínua em formato de feed/carrossel deslizante (scroll snap suave e transições fluidas) para navegar entre treinos anteriores no histórico e alternar entre fichas (A ↔ B ↔ C).
   - **Desktop**: Sidebar recolhível com layout responsivo em 2 colunas e suporte a atalhos de teclado (`Cmd/Ctrl + K`, navegação por setas).
   - **Qualidade de Interface**: Foco obsessivo em conforto visual, micro-interações táteis, feedback imediato em ações, e empty states acolhedores e orientadores.

2. **Ergonomia no Treino Ativo**:
   - Cards de exercícios modulares com lista de séries rolável.
   - Cada série exibe: número do set, carga anterior como referência (*ghost text*), inputs numéricos de alto contraste e botão de confirmação grande (mínimo 48x48px) para toque seguro mesmo com dedos suados.
   - Acesso com 1 toque ao modal com GIF demonstrativo do exercício e ação rápida de "Substituir Exercício".

3. **Floating Rest Dock**:
   - Barra flutuante compacta na base da tela após confirmação de série, inspirada nos docks do OpenSourceUI.
   - Contagem regressiva em destaque com atalhos de ajuste rápido (`+30s`, `-15s`, `Pular`).
   - Feedback sensorial ao finalizar o tempo (vibração suave via `navigator.vibrate` e tom sonoro discreto).
   - Cálculo baseado no relógio do sistema (`timestamp`), garantindo sincronia mesmo se o PWA estiver em segundo plano ou a tela desligada.

4. **Consideração de Framework (Solid-js vs React)**:
   - Registrada a abertura do usuário para considerar Solid-js em vez de React caso resulte em performance superior, bundle menor e reatividade granular mais limpa, mantendo a adaptabilidade dos componentes do OpenSourceUI. Essa decisão técnica será aprofundada formalmente no ticket de arquitetura.
