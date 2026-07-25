# Research: Spelers toevoegen

This is the first feature in the project, so this research also covers the initial
technology setup decisions the constitution left open ("TypeScript-or-JavaScript, decide per
project setup"). Decisions made here apply to the whole project going forward, not just this
feature.

## Language: TypeScript vs. JavaScript

- **Decision**: TypeScript.
- **Rationale**: Constitution mandates Vite + React; Vite's official `react-ts` template gives
  this for free. Static types catch a class of mistakes (wrong prop shapes, typos in the
  `Player` entity) before runtime, which is valuable both as a safety net and as a learning
  tool for the student on this project. The added ceremony is small for a project this size
  and pays for itself the first time a refactor touches multiple files.
- **Alternatives considered**: Plain JavaScript — faster to start typing, but no compile-time
  safety net; rejected because the learning value and bug-prevention of TypeScript outweighs
  the minor setup cost for a project intended to run for a while.

## Package manager & scaffolding tool

- **Decision**: npm, scaffolded via `npm create vite@latest` using the `react-ts` template.
- **Rationale**: npm ships with Node.js, needs no extra install, and is the default assumed by
  Vite's own docs and by Vercel's zero-config deployment. Avoids adding a second tool
  (pnpm/yarn) with no material benefit at this scale (YAGNI).
- **Alternatives considered**: pnpm/yarn — faster installs and disk dedup, but that benefit
  only matters at a scale (many packages, monorepo) this project doesn't have.

## Styling: TailwindCSS setup

- **Decision**: TailwindCSS via its official Vite plugin (`@tailwindcss/vite`).
- **Rationale**: Constitution specifies TailwindCSS. The Vite plugin is the current
  recommended integration path (no separate PostCSS config file to maintain), which keeps
  setup minimal.
- **Alternatives considered**: PostCSS + `tailwind.config.js` classic setup — still supported,
  but more files to maintain for no extra benefit here.

## Testing stack

- **Decision**: Vitest + React Testing Library (`@testing-library/react`,
  `@testing-library/jest-dom`, `@testing-library/user-event`), jsdom as the test environment.
- **Rationale**: Constitution mandates this combination. Vitest shares Vite's config and
  transform pipeline (no separate Babel/webpack setup), and RTL encourages testing components
  the way a user interacts with them (press button, type name, see it appear) — matching this
  feature's acceptance scenarios directly.
- **Alternatives considered**: Jest — the more common default in older React projects, but
  requires extra config to work with Vite's ESM/TS pipeline; no reason to pay that cost when
  Vitest is a drop-in, Vite-native alternative.

## Persistence: localStorage shape

- **Decision**: Store the in-progress player list as a single JSON-serialized array under one
  `localStorage` key (e.g. `badzwanzen:players`), written on every add/remove, and cleared (or
  left for the next screen to consume) once the game starts.
- **Rationale**: Spec (FR-013) requires the list to survive a refresh before the game starts.
  A single key with the whole array is simplest to reason about and matches the small scale
  (max 20 players, FR-012) — no need for per-player keys or a versioned schema.
- **Alternatives considered**: `sessionStorage` instead of `localStorage` — would also survive
  a refresh but not survive accidentally closing the browser tab/app, which the spec's edge
  case explicitly wants covered; rejected as not fully meeting FR-013.

## Project structure

- **Decision**: Single-project structure (`src/` at repo root), not a `frontend/`+`backend/`
  split.
- **Rationale**: Constitution Principle IV mandates a client-side-only architecture with no
  backend at all, so the "web application" two-folder option in the plan template does not
  apply. A single `src/` tree is the simplest structure that fits (YAGNI).

## Test file placement

- **Decision**: Colocate test files next to the source they test (e.g.,
  `PlayerList.tsx` + `PlayerList.test.tsx` in the same folder), rather than a parallel
  `tests/` tree.
- **Rationale**: Common convention for Vitest + RTL projects; keeps a component and its tests
  moving together during refactors, which matters more than folder purity at this scale.
- **Alternatives considered**: Separate top-level `tests/` directory mirroring `src/` —
  more ceremony, no benefit for a project this size.

## Contracts

- **Decision**: No `contracts/` directory for this feature.
- **Rationale**: The constitution mandates a client-side-only app with no backend/API; there
  is no external interface (REST endpoint, CLI schema, etc.) for this feature to expose. The
  only "contract" is the shape of the `Player` entity and its `localStorage` representation,
  which is captured in `data-model.md` instead.

## Outcome

All open questions from the Technical Context are resolved above. No remaining
`NEEDS CLARIFICATION` markers.
