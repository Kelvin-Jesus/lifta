<p align="center">
  <img src="public/logo.png" alt="Lifta logo" width="200">
</p>

<h1 align="center">Lifta</h1>

<p align="center">
  <strong>Treine. Registre. Evolua.</strong>
</p>

<p align="center">
  An offline-first workout tracker designed for the few seconds between one set and the next.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SolidJS-2c4f7c?logo=solid&logoColor=white" alt="SolidJS">
  <img src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Effect-111111?logo=typescript&logoColor=white" alt="Effect">
  <img src="https://img.shields.io/badge/PWA-offline--first-5a0fc8?logo=pwa&logoColor=white" alt="Offline-first PWA">
  <img src="https://img.shields.io/badge/data-local--first-34c759" alt="Local-first data">
</p>

`Lifta` is a mobile-first strength-training PWA with an iPhone-inspired
interface, fast thumb-friendly controls, and no account standing between you
and your workout. Your training data and settings stay in the browser on your
device.

> [!NOTE]
> Lifta is under active development. The interface is currently in Brazilian
> Portuguese, and a new local database is populated with sample Routines and
> WorkoutSessions so the experience can be explored immediately.

## Built for the gym floor

- **Log a set in one tap.** Complete a set and start its RestTimer without
  leaving the exercise.
- **Keep the keyboard out of the way.** Tactile steppers adjust weight and reps;
  press and hold to move faster.
- **Pick up where you stopped.** The ActiveSession is persisted after every
  change and restored when Lifta opens again.
- **Adapt without rebuilding the Routine.** Swap an occupied exercise for
  another movement targeting the same muscle group.
- **See what the exercise trains.** Front and back muscle maps highlight primary
  and secondary muscle groups.
- **Own the data.** Export a portable `.lifta.json` backup or a flat, set-level
  `.csv` history whenever you want.

## Highlights

- Routine creation, weekly scheduling, and a smart workout-of-the-day card
- Swipeable active-workout deck with SetKind controls, haptics, and a floating rest timer
- 51 curated exercises across 12 muscle groups and 6 equipment categories
- Exercise instructions, demonstration media, and anatomical muscle highlighting
- Workout history, weekly agenda, and a GitHub-style activity heatmap
- Deterministic calorie estimates based on session duration and training intensity
- Dark OLED and light themes with selectable Apple blue or indigo accents
- Installable PWA shell with precaching and runtime asset caching
- 12 WebMCP tools for exercise discovery, Routine management, progress analysis,
  and WorkoutSession operations

## Quick start

```sh
git clone https://github.com/Kelvin-Jesus/lifta.git
cd lifta
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

To exercise the production PWA locally:

```sh
pnpm build
pnpm preview
```

## Local data

Lifta stores its application state in IndexedDB:

- Routines and their schedules
- completed WorkoutSessions
- the single in-progress ActiveSession
- appearance and workout preferences

There is no automatic cloud sync. Export a backup before clearing site data,
switching browsers, or moving to another device. A `.lifta.json` file contains
settings, Routines, and completed WorkoutSessions and can be restored inside
Lifta. It does not include the in-progress ActiveSession, so finish your workout
before exporting. The `.csv` export is intended for spreadsheets and external
analysis.

The core tracker can reopen offline after an online repeat visit has cached its
built assets.

## Agent-ready by design

Lifta exposes a tool-oriented interface through `document.modelContext`. Its 12
WebMCP tools cover catalog search, Routine operations, workout history,
progressive-overload analysis, and WorkoutSession logging. Tools that update or
delete existing data are marked for human approval.

This layer is deliberately separate from the workout interface: the app remains
fully usable as a local workout tracker without an AI model or cloud service.

## Stack

| Layer | Technology |
| --- | --- |
| Interface | SolidJS, TypeScript, Tailwind CSS 4 |
| Domain and errors | Effect |
| Persistence | IndexedDB |
| Offline support | Web App Manifest, Service Worker |
| Testing | Vitest, Playwright |

## Limitations

- There is no cloud sync or automatic multi-device transfer.
- Exercise demonstration GIFs are external media and require a network connection.

## Development

```sh
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

The domain vocabulary used throughout the codebase is documented in
[`CONTEXT.md`](CONTEXT.md).
