# 5M Banner Theme Assets

**Date:** 2026-08-05  
**Status:** Approved design (pending implementation)  
**Scope:** Website `5MBanner` — light/dark SVG assets and live theme switching

## Goal

Show black-ink artwork in light theme and white-ink artwork in dark theme for both the particle atlas and the title, reacting to Docusaurus color-mode changes without a page reload. Colors live in the SVG files; no runtime ink overrides.

## Assets

| Role           | Light                            | Dark                            |
| -------------- | -------------------------------- | ------------------------------- |
| Particle atlas | `/img/banner/5m/atlas-light.svg` | `/img/banner/5m/atlas-dark.svg` |
| Title          | `/img/banner/5m/title-light.svg` | `/img/banner/5m/title-dark.svg` |

- Derive placeholders from the current single files: dark variants keep white fills; light variants use black fills.
- Remove `atlas-placeholder.svg` and `title-placeholder.svg` once the new names are wired.
- Final artwork may replace these files later without code changes, as long as paths and transparent backgrounds stay the same.

## Approach

Use dual SVG files per asset and swap by site color mode (`useColorMode` + Docusaurus `ThemedImage`). Rejected alternatives: CSS ink overrides on a single atlas, dual groups inside one SVG (canvas `Image` cannot see parent `data-theme`), and `prefers-color-scheme`-only switching (ignores the site toggle).

## React / canvas wiring

### Title

Replace the plain `<img>` with `@theme/ThemedImage`:

```tsx
<ThemedImage sources={{ light: TITLE_LIGHT_SRC, dark: TITLE_DARK_SRC }} alt="5 million downloads" className="..." />
```

`ThemedImage` already tracks Docusaurus color mode.

### Atlas

In `Banner` (`website/src/components/5MBanner/index.tsx`):

1. Read `colorMode` from `useColorMode()` (Banner is under `Layout` on the homepage).
2. Map `light` → `atlas-light.svg`, `dark` → `atlas-dark.svg`.
3. On theme change, keep the running `ParticleSimulation`; only swap the atlas image:
   - set `atlasReady = false`
   - assign the new `atlas.src`
   - redraw when `onload` fires
4. Do not recreate the particle pool on theme change (avoids resetting positions).

Extract a tiny pure helper (e.g. `atlasSrcForColorMode(colorMode)`) so the mapping is unit-testable without mounting React.

### Simulation module

`particle-simulation.ts` stays theme-agnostic. It continues to draw whatever `CanvasImageSource` the caller passes.

## Testing

- Add a unit test for `atlasSrcForColorMode` (light/dark mapping).
- Existing particle-simulation math tests remain unchanged.
- Manual check: toggle the site theme control and confirm atlas + title update without reload and without particle jump.

## Out of scope

- Final production artwork beyond placeholder black/white ink.
- Changing particle motion, layout, or breakpoint config.
- Theme logic inside `particle-simulation.ts`.
