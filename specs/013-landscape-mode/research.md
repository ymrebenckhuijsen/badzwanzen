# Phase 0 Research: Landscape-modus ondersteuning

No `NEEDS CLARIFICATION` markers exist in `spec.md`'s Technical Context. This document records
the technical decisions made while translating the spec's requirements into a concrete approach,
based on inspecting the current codebase (`src/App.tsx`, the four screen components, and
`design/tailwind-theme.css`).

## Decision 1: CSS-only via Tailwind orientation/height variants, not JS orientation state

**Decision**: Detect and respond to landscape orientation and low viewport height purely through
CSS — Tailwind's built-in `landscape:`/`portrait:` variants (`@media (orientation: landscape)` /
`(orientation: portrait)`) plus one new custom variant, `short:`, for the low-height phone-
landscape case (~320–360px tall), added to `design/tailwind-theme.css` via Tailwind v4's
`@custom-variant` (e.g. `@custom-variant short (@media (max-height: 500px));` — confirm exact
syntax against the installed Tailwind v4 version during implementation, since this project has no
`tailwind.config.js` and all theme/variant config lives in that one CSS file).

**Rationale**:
- FR-006 rules out new components; a CSS-only approach touches only `className` strings and one
  theme file, nothing structural.
- FR-004/SC-002 require that rotating the device never lose session state (players, current
  card, active virus effects). A JS-based approach (`window.matchMedia` + `useState`/`useEffect`)
  would work too, but adds a re-render trigger and state to a feature whose entire risk profile
  is "don't lose state on rotate" — safest way to guarantee that is to never touch React state
  for orientation at all. Pure CSS media queries repaint the same DOM tree; there is nothing to
  lose.
- No orientation-lock behavior is wanted (spec Assumptions: both orientations stay supported) —
  CSS variants don't lock anything, they just style differently per current orientation.

**Alternatives considered**:
- `window.matchMedia('(orientation: landscape)')` + React state → rejected: unnecessary
  re-render risk for a "never lose state" requirement, no benefit over CSS here since no
  orientation-dependent *logic* (only layout) is needed.
- A dedicated orientation-lock library → rejected: out of scope, spec explicitly keeps both
  orientations supported.

## Decision 2: Keep `min-h-svh`, don't switch to `dvh`/`vh`

**Decision**: Leave the existing `min-h-svh` (small viewport height unit) on all five screen
containers unchanged; landscape variants only add to it, they don't replace it.

**Rationale**: The spec's dynamic-address-bar edge case (mobile browser toolbar changing visible
height while scrolling) is already handled correctly by `svh`, which resolves to the *smallest*
possible viewport height regardless of toolbar state — that's precisely what prevents buttons
from becoming intermittently unreachable as the toolbar shows/hides. Switching to `dvh` would
reintroduce that exact problem (content/controls shifting as the toolbar animates); switching to
plain `vh` is worse (ignores the toolbar entirely, historically the older iOS Safari bug this
project's `svh` choice already avoids).

**Alternatives considered**: `100dvh` → rejected per above. Plain `100vh` → rejected, known
mobile viewport bug.

## Decision 3: Widen the column in landscape, but keep it bounded

**Decision**: Add a `landscape:max-w-2xl` (or similar bounded value, finalized during
implementation against real device-emulation review) alongside the existing `max-w-md`, so
landscape orientation uses more of the available width without going full-bleed.

**Rationale**: FR-005 requires using landscape width "more effectively than the same narrow
portrait column with large empty side margins," but the tablet-landscape edge case explicitly
warns against an "extremely stretched or largely empty" layout. A bounded, wider column satisfies
both: meaningfully wider than `max-w-md` (28rem) on a phone in landscape, still readable and not
absurdly stretched on a tablet.

**Alternatives considered**: Full-width (`landscape:max-w-none`) → rejected, tablet-landscape
edge case explicitly warns against this.

## Decision 4: Scroll instead of clip when content doesn't fit

**Decision**: Add `overflow-y-auto` to each screen's outer container (already `flex flex-col`,
so this only takes effect once content actually exceeds the available height) so low-height
landscape (`short:` variant range) degrades to scrolling rather than clipping. No separate change
is needed inside `ActiveVirusList`: a flex child has no implicit height limit, so its `<ul>`
(up to 4 active-virus rows, User Story 1 Acceptance Scenario 3) already renders at full height and
is carried along by the outer container's scroll — adding a second, nested scroll region there
would be redundant complexity the spec doesn't ask for.

**Rationale**: Directly satisfies FR-003 and FR-008 ("content that doesn't fit MUST become
scrollable rather than being cut off"), and matches the existing pattern in the codebase — no new
scrolling mechanism is introduced, just the standard CSS `overflow-y-auto` on the one outer
container each screen already has.

**Alternatives considered**: Shrinking font sizes/spacing at low heights instead of scrolling →
rejected, FR-006 rules out visual-design changes and the design system's type scale is not meant
to be altered per-viewport; scrolling is the behavior the spec explicitly calls for.

## Decision 5: Testing strategy for a CSS-only change under Vitest + jsdom

**Decision**: Automated tests (Vitest + RTL) assert that each screen's root container element,
and `ActiveVirusList`'s list container, carry the expected Tailwind utility classes (e.g.
`landscape:max-w-2xl`, `short:overflow-y-auto`) via `element.className` / `toHaveClass` checks.
Written and observed failing *before* the class changes exist (Red), then passing after
(Green) — satisfying Constitution Principle II's Red-Green-Refactor requirement even though
jsdom cannot render real box-model geometry. `quickstart.md` documents the manual, browser
DevTools device-emulation walkthrough (real orientation + real low-height viewports) that
verifies the actual rendered behavior the classes are meant to produce.

**Rationale**: jsdom has no layout engine — it cannot compute whether an element is clipped,
off-screen, or overflowing, so no assertion library running under Vitest can directly verify
"the button stays reachable." Asserting on the presence of the specific utility classes that
implement each requirement is the closest meaningful thing that *can* fail before the change and
pass after, keeping this within Principle II's TDD discipline rather than exempting the feature
from it.

**Alternatives considered**: Skipping automated tests entirely and relying only on manual
verification → rejected, conflicts with Constitution Principle II (NON-NEGOTIABLE for
application code, no blanket exemption for CSS). A headless-browser visual-regression tool
(e.g. Playwright) → rejected as introducing a new dependency/tooling stack for one feature,
disproportionate to the change and not part of the project's established test stack.
