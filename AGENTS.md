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
- **UI QA & Motion Validation**:
  - `ui-test`: Use for real browser inspection, adversarial testing, and diff-driven UI verification on every meaningful UI change.
  - `review-animations`: Use to audit and inspect animations while they are actively running.

---

## UI QA

Do not consider a user-facing task complete only because tests pass.

For every meaningful UI change, use `ui-test` to inspect the implemented result in a real browser.

Prefer diff-driven testing after normal feature work.

Use full exploratory testing after:

* major UI refactors
* new navigation flows
* significant design-system changes
* changes affecting multiple screens

During UI QA, actively look for:

* broken interactions
* missing interaction feedback
* unexpected navigation
* rapid-click/double-submit bugs
* stale UI state
* loading-state bugs
* empty-state bugs
* error-state bugs
* focus/keyboard problems
* clipping and overflow
* layout shifts
* inconsistent spacing
* inconsistent typography
* inconsistent colors
* inconsistent radii
* inconsistent component variants
* misaligned elements
* weak visual hierarchy
* poor mobile ergonomics
* undersized touch targets
* safe-area issues
* console/runtime errors
* visual regressions

Do not only test the happy path.

Interact with the application like an adversarial user:

* click quickly
* repeat actions
* submit empty values
* enter unusually long values
* navigate backward/forward
* resize when relevant
* trigger empty/loading/error states when feasible
* test keyboard interaction where relevant

For animations and transitions, additionally use `review-animations`.

Inspect animations while they are actually occurring, not only their final state.

Treat motion as defective when it:

* feels sluggish
* starts from an incorrect origin
* causes layout shift
* fires unnecessarily
* blocks interaction
* lacks appropriate interaction feedback
* is visually inconsistent with equivalent interactions
* performs poorly
* ignores reduced-motion preferences

Fix actionable findings before declaring the UI task complete.

A passing unit/E2E test suite does not replace visual and interactive QA.

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

---

## Git Discipline & Automatic Commits

Agents MUST maintain a clean, atomic Git history. Do not let uncommitted work accumulate across tasks or sessions.

1. **When to Commit**:
   - Upon completing any feature, bug fix, refactor, or approved UI refinement.
   - Upon resolving or advancing any ticket in `.scratch/`.
2. **Pre-Commit Verification**:
   - Always run `pnpm typecheck` and `pnpm test` before committing.
   - NEVER commit broken types or failing tests.
   - Fix all lint and type errors before committing.
3. **Commit Standards**:
   - Use Conventional Commits format (`feat(...)`, `fix(...)`, `refactor(...)`, `style(...)`, `test(...)`, `chore(...)`).
   - Write clear, descriptive commit messages outlining what was changed and why.
   - Stage files intentionally by logical unit; do not blindly `git add .` when changes span unrelated areas.
