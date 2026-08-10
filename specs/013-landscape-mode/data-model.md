# Phase 1 Data Model: Landscape-modus ondersteuning

No new entities, fields, or state transitions. This feature is CSS/layout-only (FR-006).

The existing session state this feature must *not* disturb (FR-004, SC-002) already lives in
prior features and is unchanged here:

- **Players** (`Player[]`, `src/features/players/types.ts`) — held in `App`'s `players` state,
  persisted via `src/lib/storage.ts`.
- **Current card** (`DrawnCard | null`, `src/App.tsx`) — held in `GameScreen`'s local `current`
  state.
- **Active virus effects** (`ActiveVirusEffect[]`, `src/features/virus/virus.types.ts`) — held
  by `useVirusEffects` inside `GameScreen`.
- **Current screen** (`'card' | 'players'` in `GameScreen`, plus the `players`/`cardSet`
  null-checks in `App`) — plain React state, unaffected by CSS media queries.

Because orientation changes are handled entirely via CSS media queries (see
[research.md](./research.md) Decision 1), none of this state is read, written, or re-derived on
rotation — the component tree never unmounts or re-renders due to an orientation change, so
state preservation is a property of the chosen approach rather than something requiring its own
model or transition to design.
