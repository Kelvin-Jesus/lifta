# Agent Configuration and Policies

This workspace is configured for agent-assisted development using specific tools, skills, and memory systems. The following policies dictate how and when agents (Antigravity, Claude Code, Codex) must autonomously use these capabilities.

---

## Routing Policy

Detailed rules are located in [`.agents/rules/routing.md`](.agents/rules/routing.md) and task workflows in [`.agents/workflows/routing.md`](.agents/workflows/routing.md).

- **`ai-memory`**: Use for historical memory and persistent decisions across sessions. You MUST consult `ai-memory` automatically when historical context, past failed approaches, or long-term design decisions might be relevant. At the end of significant work, update `ai-memory` with durable decisions.
- **`codebase-memory-mcp`**: Use for structural understanding of existing code. You MUST prefer `codebase-memory-mcp` (using its MCP tools) to understand architecture, locate symbols, analyze dependencies, check call graphs, assess the impact of changes, and explore existing code structurally, rather than reading large amounts of files or using indiscriminate `grep`.
- **Matt Pocock Skills**: Installed in `.agents/skills/`. Use them autonomously when appropriate:
  - `grilling`: Ambiguous requirements or architectural decisions.
  - `wayfinder`: Greenfield planning and phase sequencing (discovery coordinator).
  - `to-spec` & `to-tickets`: Writing specifications and breaking them into tasks in `.scratch/`.
  - `tdd` & `implement`: Test-driven development for domain logic, bug fixes, and features.
  - `diagnose`: Debugging loop for unexpected behavior or errors.
  - `code-review`: Proportional code review before completing tasks.
  - `prototype`: Test interaction alternatives and validate UX assumptions before consolidating decisions.
- **UX & Product Design Skills (Lifta Workflow)**:
  - `user-story-mapping`: Map the real workout user journey (backbone, activities, steps, release slices).
  - `ux-journey-architect`: End-to-end user journey analysis, edge cases, friction elimination, and cognitive walkthrough audits.
  - `interaction-design`: Refine interactions, component states, feedback timing, ergonomics, micro-interactions, and direct manipulation.
  - `apple-design`, `emil-design-eng`, `animate`, `web-design-guidelines`: Visual craftsmanship, fluid gesture physics, iOS ergonomics, and design polish.
- **Effect Skill**: Use the `effect-ts` skill automatically to apply correct patterns and practices whenever working with Effect-TS code.

---

## Agent Skills & Project Conventions

### Issue tracker
Issues and specs for this repo live as markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels
Triage state is recorded using standard labels. See `docs/agents/triage-labels.md`.

### Domain docs
Single-context. See `docs/agents/domain.md`.

---

## Learning more about Effect

This repository uses the Effect Typescript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md` **completely**, and follow the links in the file when required.

If you need to learn more about particular Effect apis and concepts that the guide doesn't cover, search through the source code in `node_modules/effect/src`.
