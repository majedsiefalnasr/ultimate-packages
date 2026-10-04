# @ultimate/themes

Framework-neutral theme contract and baseline preset for the Ultimate Platform: token type definitions, an Aura-derived preset (primitive/semantic/component design tokens), and the single entry point that applies a theme before any Ultimate component mounts.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## What this package is

`@ultimate/themes` sits below all three framework-core packages (`ng-core`, `react-core`, `vue-core`) in the runtime dependency direction and depends only on `@ultimate/uix-styled` (workspace). It owns two things:

- **The theme contract** — TypeScript types describing the shape of a theme preset (`PrimitiveTokens`, `SemanticTokens`, `ComponentTokens`, `ColorScale`) and the supported mode/direction values (`UltimateThemeMode`, `UltimateThemeDirection`). These types describe data shapes only; they carry no runtime behavior of their own.
- **The Aura preset** — `auraPreset`, Ultimate's Option B port (reference, not verbatim copy) of `@primeuix/themes@2.0.3`'s Aura preset, covering the shared primitive/semantic base tier plus real per-component design tokens for 79 components: the original five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip), 71 modules ported in GAP-064's Batches 1-3 tranche (2026-10-01) and Badge, InputGroup and Paginator (GAP-064 Tranche 1). Many component style files do not consume their modules yet; see GAP-064 in `docs/architecture/BLUEPRINT_GAPS.md`. See `docs/architecture/provenance/themes.json` for the per-file provenance record and `THIRD-PARTY-NOTICES.md` for the upstream MIT license text.

Theme *application* — writing CSS custom properties onto the document and reacting to dark-mode/RTL — is not implemented here. That mechanism already exists in `@ultimate/uix-styled` (the `Theme`/`StyleSheet` runtime, rebranded in Phase 5 from PrimeUIX's `p`-prefixed CSS variables to Ultimate's own `u` prefix). `@ultimate/themes` supplies the *data* (`auraPreset`) and a thin, framework-agnostic *entry point* (`applyUltimateTheme`) that wires that data into `uix-styled`'s existing `Theme.setTheme()` call — it does not reimplement token resolution, dark-mode selectors, or CSS-layer handling.

## Public API

```typescript
export * from "./contract"; // PrimitiveTokens, SemanticTokens, ComponentTokens, ColorScale,
                              // UltimateThemeMode, UltimateThemeDirection
export { auraPreset } from "./presets/aura";
export { applyUltimateTheme, type ApplyUltimateThemeOptions } from "./apply-theme";
```

### `applyUltimateTheme(options?)`

```typescript
interface ApplyUltimateThemeOptions {
  /** Defaults to the Ultimate Aura-derived preset. */
  preset?: Record<string, unknown>;
  /** @default 'system' */
  darkModeSelector?: UltimateThemeMode;
  cssLayer?: boolean | { name?: string; order?: string };
}

function applyUltimateTheme(options?: ApplyUltimateThemeOptions): void;
```

Applies an Ultimate theme preset, framework-agnostically, by calling `@ultimate/uix-styled`'s `Theme.setTheme()` with `auraPreset` (or a caller-supplied `preset`) and `prefix: "u"` fixed. Every `*-core` package's style registration (`ngCoreStyleSheet`, `reactCoreStyleSheet`, the Vue equivalent) reads `dt()`-resolved values from the same `Theme` singleton this function configures — there is no per-framework theming path to call separately.

### `auraPreset`

The default preset object passed to `applyUltimateTheme()` when no `preset` option is supplied. Built via `@ultimate/uix-styled`'s `definePreset({ primitive, semantic, components: { ... } })`, registering all 79 component modules (see `src/presets/aura/index.ts`).

### Contract types

`PrimitiveTokens`, `SemanticTokens<T>`, `ComponentTokens<T>`, `ColorScale`, `UltimateThemeMode`, `UltimateThemeDirection` — exported for consumers authoring a custom preset or typing their own theme-related props. `UltimateThemeDirection` documents the two supported values only; Ultimate does not implement JS-driven direction switching. Component CSS already responds to a `dir` attribute on any ancestor element via the native CSS `:dir()` pseudo-class.

## Usage

Call `applyUltimateTheme()` **once**, before mounting any Ultimate component, regardless of framework:

```typescript
import { applyUltimateTheme } from "@ultimate/themes";

applyUltimateTheme();
```

```typescript
// Angular — main.ts, before bootstrapApplication()
import { applyUltimateTheme } from "@ultimate/themes";

applyUltimateTheme();
bootstrapApplication(AppComponent, appConfig);
```

```tsx
// React — index.tsx, before ReactDOM.createRoot(...).render()
import { applyUltimateTheme } from "@ultimate/themes";

applyUltimateTheme();
createRoot(document.getElementById("root")!).render(<App />);
```

```typescript
// Vue — main.ts, before app.mount()
import { applyUltimateTheme } from "@ultimate/themes";

applyUltimateTheme();
createApp(App).mount("#app");
```

To use dark mode with a class selector instead of following the OS preference, or to opt into `@layer`-scoped CSS:

```typescript
applyUltimateTheme({
  darkModeSelector: ".app-dark",
  cssLayer: { name: "ultimate", order: "ultimate, primeng" },
});
```

## Scope

**In scope (Phase 5):**

- Real Aura-derived design tokens for exactly the five-component proof set already built in Phases 2-4: Button, Checkbox, Dialog, Menu, Tooltip.
- The shared primitive/semantic base tier those five components' tokens reference.
- One framework-agnostic application entry point (`applyUltimateTheme`), consumed identically by Angular, React, and Vue apps.
- Light/dark mode (via `darkModeSelector`) and RTL/LTR (via the CSS `:dir()` mechanism already in `uix-styles`), both verified functional.

**Out of scope:**

- **Density** — no compact/comfortable/spacious token variants. Only the single Aura density Phase 5 ported.
- **Motion** — theming does not include animation/transition tokens or timing. That remains `@ultimate/uix-motion`'s responsibility, unchanged by this package.
- **Components without an Aura module** — 79 component modules exist. Not ported: `tabview`/`tabmenu` (React-only consumers) and `ripple` (excluded from GAP-064); `datatable`/`virtualscroller` are out of scope by earlier decision. No tokens exist here for any component `ng`/`react`/`vue` haven't built yet.
- **Alternate presets** (Lara, Nora, Material) — `auraPreset` is the only preset shipped. The `preset` option on `applyUltimateTheme` exists so a caller can supply their own, but Ultimate does not ship additional built-in presets in Phase 5.
- A known, pre-existing gap carried forward from Phase 3: React's components do not source their themeable CSS from `@ultimate/uix-styles` the way Angular's and Vue's do. This is a real Phase 3-era gap, documented but intentionally left unfixed by Phase 5 — out of this package's scope.

## Dependencies

Depends on `@ultimate/uix-styled` (workspace) at runtime. Development-only dependencies on `@ultimate/react`, `@ultimate/vue`, `@ultimate/uix-styles`, `react`, `react-dom`, and `vue` exist solely to exercise the cross-framework consistency test suite (`test/cross-framework-consistency.test.ts`) — none of them are runtime dependencies of the published package.

## Further reading

See `docs/superpowers/specs/2026-09-01-phase-5-ultimate-themes-design.md` for the full architectural rationale: the pin decision for `@primeuix/themes@2.0.3`, the `p`→`u` CSS-variable-prefix rebrand, the `dt()` wiring into each framework-core package, and the complete exit-criteria list this package was built to satisfy.
