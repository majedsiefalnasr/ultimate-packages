# @ultimate/uix-styled

Theme/preset resolution engine for the Ultimate Platform UI foundation: design-token resolution (`dt`/`$dt`/`$t`), preset merging, palette generation, and runtime stylesheet registration.

**Status:** unstable (pre-1.0). No semver guarantee yet.

This package is styling _infrastructure_ — the mechanism that turns a theme's tokens into usable CSS. It does not define what tokens exist or what values they hold (that is a theme's responsibility, deferred to Phase 5), and it does not contain any component's styles (deferred to each component's own migration phase).

## Provenance

Adapted from `@primeuix/styled@0.7.4` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-styled.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Dependencies

Depends on `@ultimate/uix-utils` (workspace).

## Usage

```typescript
import { definePreset, usePreset, dt, StyleSheet } from "@ultimate/uix-styled";
```

### Notes on the real exported API

- `dt(tokenPath)` — resolves a dotted design-token path to a `var(...)` CSS reference against the currently active `Theme`.
- `$dt(tokenPath)` — like `dt`, but returns `{ name, variable, value }` instead of just the CSS reference.
- `$t(theme?)` — the fluent theme-builder used internally by `useTheme`/`updatePrimaryPalette`/`updateSurfacePalette`. There is no separate `t` export; the upstream package's builder is named `$t`.
- `StyleSheet` — a class, not a singleton service. `new StyleSheet({ attrs })` then `.add(name, css)` records CSS/markup for a named style and is a base for framework-specific subclasses; the base class's `createStyleElement` is a no-op hook and does **not** insert anything into `document.head` by itself.
