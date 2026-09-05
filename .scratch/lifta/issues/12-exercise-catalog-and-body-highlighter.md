# 12 - Exercise Catalog and Body Highlighter

Type: task
Status: resolved
Blocked by: 10

## Goal

Integrar o catálogo aberto de exercícios e o motor de renderização vetorial anatômico de alta precisão baseado na biblioteca open-source `body-highlighter`, criando componentes reativos no Solid-js para exibição de vista anterior e posterior com estilização adaptada ao tema e à cor de destaque.

## Deliverables

1. **Catálogo de Exercícios (+1.300 movimentos)**:
   - Dataset tipado de exercícios catalogados com grupos musculares primários e secundários, equipamento necessário e instruções posturais.
   - Suporte para cadastro de exercícios personalizados pelo usuário.
2. **Motor de Polígonos Anatômicos (`body-highlighter`)**:
   - Mapeamento das coordenadas vetoriais de músculos para vista anterior e posterior:
     - Peitoral, deltoides (anterior/lateral/posterior), bíceps, tríceps, antebraços, trapézio, dorsais, lombar, abdômen, oblíquos, quadríceps, isquiotibiais, glúteos, panturrilhas e sóleo.
   - Componente Solid-js `<BodyHighlighter />`:
     - Renderização de `<svg viewBox="0 0 100 205">` com elementos `<polygon>`.
     - Destaque em 100% da cor do tema (`--accent`) para músculos primários.
     - Destaque translúcido (42% de opacidade) para músculos sinergistas.
     - Linhas de separação muscular finas (`0.6px`) com cor contrastante ao fundo.
     - Suporte a viewport único (frente ou costas) e duplo lado a lado.
3. **Testes de Componente**:
   - Renderização correta dos IDs musculares e aplicação precisa das classes e atributos de cor.
