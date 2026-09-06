# Workspace Agent Routing Policy

## Fundamental Rule

Before doing non-trivial work in this workspace:
1. Understand the user's actual intent;
2. Inspect the current workspace and its project instructions (`AGENTS.md`, `docs/agents/`);
3. Consult relevant persistent memory (`ai-memory`);
4. Identify which installed capabilities are relevant (skills, MCPs);
5. Use the smallest appropriate set of skills/tools;
6. Only then plan or modify code.

Do not require the user to name tools or skills explicitly.
Installed capabilities must be discovered and used autonomously based on their descriptions and applicability.
Do not run every capability on every task.

---

## Instruction Precedence

1. Explicit instruction from the current user request;
2. Project-specific `AGENTS.md`, `.agents/rules/`, or equivalent;
3. Durable project decisions stored in `ai-memory`;
4. Workflows in `.agents/workflows/`;
5. Defaults inferred by the agent.

---

## Context Retrieval

Minimize context usage by retrieving structured knowledge before reading large amounts of raw data.

Use each source for its intended purpose:

* `ai-memory`: previous decisions, rationale, project history, conventions, rejected approaches, unresolved questions and cross-session context.
* `codebase-memory-mcp`: current code structure, symbols, dependencies, call graphs, architecture, routes and impact analysis.
* direct source reads: exact implementation details after the relevant code has been located.

Prefer:
```
memory/graph lookup
→ narrow result
→ exact source verification only when necessary
```
instead of:
```
grep
→ read many files
→ more grep
→ more reads
→ infer relationships manually
```

### Retrieval rules

* **Do not query both memory systems automatically for every prompt.**
* **Use `ai-memory`** when historical context can affect the answer.
* **Use `codebase-memory-mcp`** when understanding existing code is required.
* **Use both** when the task depends on both historical decisions and current implementation.
* **Retrieve narrow results first.** Expand only if information is insufficient.
* **Do not load whole memory pages or large repository sections unnecessarily.**
* **Authority:** When `ai-memory` and the repository disagree about current implementation, the repository is authoritative. Memory should primarily explain history and rationale.
* **Verification:** For structural claims from `codebase-memory`, inspect exact source when correctness of the specific implementation matters.

#### Examples:

* *"Why did we choose IndexedDB?"* → `ai-memory`
* *"Where is workout persistence implemented?"* → `codebase-memory-mcp`
* *"Change workout persistence without breaking the architecture we decided on."* → `ai-memory` + `codebase-memory-mcp`
* *"Change this button label."* → neither unless necessary

---

## ai-memory

Treat `ai-memory` as persistent historical memory across sessions.
Use the official `ai-memory` integration, skills, hooks, and routing instructions when available.

### Before meaningful work
Query `ai-memory` proactively when previous context could affect the task:
* Previous architectural decisions;
* Design decisions;
* Project conventions;
* Previous investigations and benchmarks;
* Rejected approaches;
* Known limitations and unresolved work.

Do NOT wait for the user to say "check memory" or "use ai-memory".
For completely trivial/self-contained operations where historical context clearly cannot matter, avoid unnecessary memory retrieval.

### After meaningful work
Persist durable information when it will help a future agent/session understand WHY the project is the way it is:
* Architectural decisions and important tradeoffs;
* Selected approaches and rejected alternatives;
* External constraints and non-obvious conventions.

---

## codebase-memory-mcp

Treat `codebase-memory-mcp` as the preferred structural understanding layer for this codebase.
Use it proactively when tasks involve:
* Locating implementations and finding symbols;
* Architectural exploration and module relationships;
* Dependency analysis;
* Callers/callees and call graphs;
* Understanding data flow and impact analysis before refactoring.

Prefer semantic/structural exploration over blindly reading dozens of files or running broad grep searches.
Do not use codebase-memory merely for ceremony.

---

## Installed Skills (Matt Pocock Skills)

Reason about whether installed skills in `.agents/skills/` are applicable based on their SKILL.md.
Do NOT require the user to explicitly say: "Use X skill."

### Key Heuristics:
* **wayfinder**: Starting a substantial greenfield project or multi-phase route where sequencing decisions matters.
* **grilling / grill-me**: When requirements are ambiguous or multiple design directions exist. Ask questions progressively (one by one with concrete recommendations).
* **prototype**: Disposable validation of state models, UX, or experimental designs.
* **to-spec**: Consolidating feature requirements into an implementation-ready spec.
* **to-tickets**: Decomposing a spec or plan into independently actionable units in `.scratch/`.
* **implement**: Structured implementation after requirements are understood.
* **tdd**: Test-driven development for domain logic, bug fixes, parsers, transformations, and APIs.
* **diagnose**: Debugging loop when behavior is unexpected, failing, or slow. Form and test hypotheses before changing code.
* **code-review**: Proportional review after meaningful changes (standards, specs, regressions, tests).
* **ui-test**: Mandatory real-browser adversarial QA for meaningful UI changes (see `.agents/rules/ui-qa.md`). Never declare UI work complete based solely on unit/E2E test suite passing.
* **review-animations**: Auditing and inspecting motion and animations while they are actively running.

---

## UI QA & Browser Validation

Consult and strictly follow [`.agents/rules/ui-qa.md`](ui-qa.md).
- Never consider a user-facing task complete only because unit/E2E tests pass.
- Use `ui-test` with the `browse` CLI to inspect results in a real browser.
- Perform diff-driven testing after normal feature work; perform exploratory testing after major refactors/flows/design changes.
- Interact adversarially (rapid clicks, long values, empty submissions, edge cases, responsive resizing).
- Use `review-animations` to inspect animations in flight.

---

## Effect TypeScript

When writing or modifying Effect code:
* Consult the installed `effect-ts` skill and `node_modules/effect/AGENTS.md`.
* Follow official Effect conventions and patterns.

---

## Agent Autonomy & Avoid Ceremony

* Perform discoverable work autonomously. Do not ask trivia like "which file should I inspect?" or "should I run tests?".
* Avoid tool ceremony: don't run every tool on every turn, and don't produce giant plans for small changes.
* Verify real behavior with tests and UI QA before declaring work complete.

---

## Git Discipline & Automatic Commits

* **Always commit upon completing work**: Do not leave batches of uncommitted modifications across sessions or prompts.
* **Pre-commit verification**: Run `pnpm typecheck` and `pnpm test` before any commit. Never commit with failing tests or broken types.
* **Semantic messages**: Use Conventional Commits (`feat`, `fix`, `style`, `refactor`, `test`, `chore`).
* **Atomic staging**: Group logically related files together; do not blindly `git add .` across unrelated features.
