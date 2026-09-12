# Low-end mobile performance budget

Lifta must stay fluid on a ~6-year-old Android phone (Moto G Power class, <4 GB RAM).
The gates below are enforced by a harness, not by judgement.

## Gates (per screen)

| Gate | Threshold | Source |
| --- | --- | --- |
| Lighthouse performance score | >= 90 | Lighthouse mobile preset (Moto G Power emulation, 4x CPU slowdown, simulated Slow 4G) against `dist/` |
| Total Blocking Time | <= 200 ms | Lighthouse |
| Animation frames within budget | >= 95% | scripted interaction pass, frame counted as within budget when the rAF delta stays under 20 ms (a 60 Hz vsync is 16.7 ms, a dropped frame is >= 33 ms) |
| Long tasks during interaction | none > 200 ms | `PerformanceObserver('longtask')` under 4x CPU throttling |
| Initial JS transferred | <= 200 KB gzip | Lighthouse `network-requests`, script resources, served gzipped |

## Running it

```bash
pnpm build        # the audit measures the production build, never the dev server
pnpm perf:audit   # all screens; exits non-zero when any gate fails
node scripts/perf/audit.mjs workout exercises   # subset by route id
```

Output: `.scratch/perf/report.json` (per-route metrics and gate results) and
`.scratch/perf/routes.json` (the enumerated screen list).

## Attribution

```bash
node scripts/perf/diagnose.mjs workout      # per-interaction frame + LoAF attribution
BLOCK_GIFS=1 node scripts/perf/diagnose.mjs exercises   # isolate remote gif cost
```

`diagnose.mjs` reports, for each scripted interaction, how many frames missed the
budget and which Long Animation Frames (script, render, style+layout) caused it.

## Screens and deep links

The app is a single-URL SPA. `src/App.tsx` reads a read-only deep link on load so
every screen is directly addressable and therefore measurable:

- `/?tab=train|routines|history|exercises|settings`
- `/?screen=workout` — resumes the persisted active workout; falls back to the
  dashboard when no workout is active.

Navigating with the tab bar does not push history entries; the parameters only
seed the initial screen.

## Rules that keep the budget

- Never mount a screen's heavy media (exercise gifs, anatomy SVGs) before the user
  asks for it. The catalog mounts accordion content on first expand.
- Keep list rows alive across store writes. `Index` (not `For`) is required wherever
  the store replaces item objects on every mutation — otherwise each tap rebuilds
  every deck page.
- Reserve space for remote media so its arrival does not reflow a list.
- Ship images at display size: the header logo and PWA icons are sized assets, not
  1254 px originals.
- An optional integration (WebMCP, service worker) must never be able to abort app
  startup; wrap it and continue.
