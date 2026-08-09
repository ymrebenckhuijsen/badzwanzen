# Contract: Web App Manifest & Icon Links

## `public/manifest.webmanifest`

Exact shape (values from `data-model.md`'s App Manifest table):

```json
{
  "name": "Badzwanzen",
  "short_name": "Badzwanzen",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b1326",
  "theme_color": "#0b1326",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Contract**: exactly one manifest file, at `public/manifest.webmanifest`, served at
`/manifest.webmanifest` by Vite's static `public/` passthrough (no build step needed). Any
change to app name, colors, or icon set must be made here and must stay in sync with the
`<link>`/`<meta>` tags below.

## `index.html` additions

Three additions to the existing `<head>`, alongside the current `favicon.svg` link:

```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0b1326" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

**Contract**:
- `rel="manifest"` is what makes Chrome/Android consider the app installable (combined with
  HTTPS and a fetchable `start_url`, both already true in production per spec.md Assumptions).
- `theme-color` must match the manifest's `theme_color` value exactly — kept as one source
  (`#0b1326`, the Vivid Social `surface`/`background` token) to avoid drift.
- `apple-touch-icon` is iOS Safari's **only** icon source for home-screen installs — it does not
  read the manifest's `icons` array at all. 180×180 is Apple's current recommended size.

## Icon files (`public/icons/`)

| File | Size | Generated from |
|---|---|---|
| `icon-192.png` | 192×192 | `public/favicon.svg`, via `qlmanage -t -s 192 …` (see research.md Decision 2) |
| `icon-512.png` | 512×512 | same source, `-s 512` |
| `icon-512-maskable.png` | 512×512 | same source, rendered with extra padding so the mark sits inside Android's maskable safe zone (center ~80% of the canvas) |
| `apple-touch-icon.png` | 180×180 | same source, `-s 180`, flattened onto an opaque background (iOS does not respect transparency for home-screen icons — it fills transparent regions with white/black depending on system theme, which looks wrong; flatten onto the `#0b1326` background color instead) |

**Contract**: all four files are static, committed assets — generated once at implementation
time, not at build time. Regenerating them (e.g. if the source mark changes) is a manual,
documented step (see quickstart.md), not part of `npm run build`.
