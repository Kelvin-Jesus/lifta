# UI QA Policy

Do not consider a user-facing task complete only because tests pass.

For every meaningful UI change, use `ui-test` to inspect the implemented result in a real browser.

Prefer diff-driven testing after normal feature work.

Use full exploratory testing after:

* major UI refactors
* new navigation flows
* significant design-system changes
* changes affecting multiple screens

---

## Adversarial Inspection Checklist

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

---

## Adversarial User Mindset

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

---

## Animation & Motion QA

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

---

## Resolution Standard

Fix actionable findings before declaring the UI task complete.

A passing unit/E2E test suite does not replace visual and interactive QA.
