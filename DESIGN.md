---
stitch_project: projects/2820714669126137113
stitch_design_system: assets/007b1ea290b0477fbb6cd6e71d98c20d
last_updated_by: 003-ui-design-workflow
name: Vivid Social
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4ae176'
  on-secondary: '#003915'
  secondary-container: '#00b954'
  on-secondary-container: '#004119'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#cf2c30'
  on-tertiary-container: '#ffecea'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-xl:
    fontFamily: Rubik
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Rubik
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 30px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-margin: 20px
  gutter: 16px
---

# Badzwanzen Design System

Canonical, project-wide design system. Bootstrapped 2026-07-25 by feature
`003-ui-design-workflow` from the existing Stitch project "Party Quest"
(`projects/2820714669126137113`), design system "Vivid Social"
(`assets/007b1ea290b0477fbb6cd6e71d98c20d`). Every UI-affecting feature extends this file (via
`/speckit-design`) rather than inventing its own styling — see
[contracts/design-addendum-format.md](specs/003-ui-design-workflow/contracts/design-addendum-format.md)

## Tailwind CSS Mapping

The tokens above are also maintained as a ready-to-use Tailwind v4 theme at
[`design/tailwind-theme.css`](design/tailwind-theme.css) (this project uses Tailwind v4's
CSS-first `@theme` config, confirmed against `package.json`/`src/index.css` — no
`tailwind.config.js`). Once this workflow lands alongside the app's source, wire it in with one
line in `src/index.css`, right after `@import 'tailwindcss';`:

```css
@import '../design/tailwind-theme.css';
```

`/speckit-design` regenerates this file whenever it updates the tokens above — implementers
should use its `bg-primary`, `text-on-surface`, `font-display`, `text-display-xl`,
`rounded-xl`, etc. utility classes directly rather than hand-picking colors/spacing.
for the update contract.

## Brand & Style

The design system is engineered for high-energy social environments. It prioritizes instant
legibility in low-light settings and evokes a sense of spontaneous fun through a
**Tactile-Playful** aesthetic. By combining bold, saturated colors with large, squishy UI
elements, the system creates an interface that feels more like a physical toy than a utility.
The brand personality is extroverted, energetic, and unapologetically loud, ensuring that the
app becomes a focal point of the party rather than a background element.

## Colors

The palette utilizes a high-contrast dark mode foundation to allow primary "mode colors" to pop
with neon-like intensity.

- **Primary (Electric Blue):** Used for standard play and navigation.
- **Secondary (Neon Green):** Used for "Truth" or positive action modes.
- **Tertiary (Bright Red):** Used for "Dare" or high-stakes challenge modes.
- **Accent (Playful Yellow):** Used for warnings, highlights, and "Special" game modes.
- **Neutral:** A deep navy-black (`#0F172A`) serves as the canvas, providing maximum contrast
  for text and vibrant card surfaces.

See the `colors` block in this file's frontmatter for the full token set (surface levels,
on-color pairs, fixed variants, error states).

## Typography

Typography is optimized for readability from a distance (e.g., across a table).

- **Rubik** is used for all headings and labels; its rounded terminals match the "squishy" UI
  components.
- **Be Vietnam Pro** is used for body text and game instructions to ensure clarity without
  sacrificing the friendly tone.
- Text should predominantly be white (`#FFFFFF`) on colored backgrounds to maintain an
  AA/AAA accessibility rating against the vibrant palette.

See the `typography` block in this file's frontmatter for the full type scale.

## Layout & Spacing

The layout uses a **Fluid Grid** with generous safe areas. Because this is a mobile-first party
game, touch targets are oversized.

- **Margins:** A minimum of 20px on the left and right edges.
- **Stacking:** Elements use a vertical rhythm based on 8px increments.
- **Reflow:** On larger screens, content is contained within a 500px centered column to keep
  game cards focused and prevent line lengths from becoming unreadable.

See the `spacing` block in this file's frontmatter for the full spacing scale.

## Elevation & Depth

Depth is created through **Tonal Stacking** and **Soft Ambient Shadows**.

- **Level 0 (Background):** Deep neutral navy.
- **Level 1 (Cards):** Saturated mode color (Blue, Green, Red) with a 15% black inner glow to
  create a "pressed" or "molded" look.
- **Level 2 (Active Elements):** Buttons and interactive chips feature high-diffusion shadows
  (`0px 10px 30px rgba(0,0,0,0.3)`) to make them appear physically lifted off the card.
- **Level 3 (Modals/Popups):** Use a heavy backdrop blur (20px) to isolate the game action from
  the background.

## Shapes

The shape language is defined by extreme roundedness (see the `rounded` block in this file's
frontmatter for exact values):

- **Large Components (Cards):** Use `rounded-xl` (3rem) for a friendly, toy-like appearance.
- **Buttons/Inputs:** Use a full pill-shape (999px) to encourage tapping.
- **Icons:** Set within circular containers to maintain the "bubble" aesthetic throughout the
  interface.

## Component Style

- **Game Cards:** The central component. Full-bleed vibrant color backgrounds with white
  `display-xl` text. Cards should include a subtle "grain" or "noise" overlay to add texture.
- **Tactile Buttons:** High-contrast buttons (e.g., Yellow on Navy) with a 4px bottom border
  (offset) to simulate a physical 3D button that depresses when tapped.
- **Mode Chips:** Small, pill-shaped labels used at the top of cards to indicate the current
  category (e.g., "DRINK", "CHALLENGE").
- **Progress Bar:** A thick, 12px height bar with fully rounded end-caps. The track is a darker
  shade of the mode color, and the filler is the mode color itself.
- **Input Fields:** Dark semi-transparent fills with thick 2px borders in the primary color,
  using `body-lg` typography for easy typing during active play.

## Screens by Feature

- `003-ui-design-workflow`: no screens of its own — this feature bootstrapped this file from
  the pre-existing "Vivid Social" Stitch design system. It has no UI impact itself (it's the
  workflow tooling that makes this file update automatically for future UI-affecting features).
