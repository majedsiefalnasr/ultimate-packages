# Theme configuration

ID: uixstyled.config

Framework: shared; availability: public

## Authored interpretation

Singleton holding the active theme, preset, options, resolved tokens and loaded-style bookkeeping, with accessors that compute CSS for common, component and custom presets.

## Framework surface

See [authored signatures and interpretation](README.md). Default export Theme (re-exported as the named root export Theme) is a plain object with defaults (variable prefix "u", selector ":root,:host", options prefix "u", darkModeSelector "system", cssLayer false), getters theme/preset/options/tokens, getTheme/setTheme, getPreset/setPreset, getOptions/setOptions, layer-name and loaded-style-name tracking, getTokenValue, getCommon, getComponent, deprecated getDirective, getCustomPreset, getLayerOrderCSS, transformCSS, getCommonStyleSheet, getStyleSheet and onStyleMounted/onStyleUpdated/onStyleLoaded. Setters emit ThemeService events (theme:change, preset:change, options:change, theme:load). Most parameters are typed any.

## Public exports

@ultimate/uix-styled#Theme

## Owned source and evidence

packages/uix-styled/src/config/index.ts

```text
packages/uix-styled/src/config/index.ts: setTheme(newValue: any) {
packages/uix-styled/src/config/index.ts: ThemeService.emit("preset:change", newValue);
packages/uix-styled/src/index.ts: export { default as Theme } from "./config/index";
```

## Relationships

uixstyled.service
uixstyled.utils

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Theme configuration is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed. Existing package tests under packages/uix-styled/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime (run twice; authored README SHA-256 checked before and after)",
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 27 source files accounted for, 59 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
