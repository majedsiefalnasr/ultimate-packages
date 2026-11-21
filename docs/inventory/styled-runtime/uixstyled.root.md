# Styled package entry and exported types

ID: uixstyled.root

Framework: shared; availability: public

## Authored interpretation

The package entry barrel, which re-exports every runtime part and declares the public configuration and style types.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports actions, Theme, color helpers, helper barrel, ThemeService, StyleSheet registrations and utils via named and relative star re-exports. It declares StyleOptions (a dt resolver carrier), StyleType<T = StyleOptions> (a string or function returning CSS), ThemeOptions (prefix, darkModeSelector, cssLayer) and ColorScale (shade keys 0 and 50-950 to hex strings). packages/uix-styled/package.json exports only the root "." subpath, built by tsup from one entry to dist/index.mjs and dist/index.d.mts; there are no subpath exports. The package is a dependency of the Angular, React and Vue core and component packages and of themes.

## Public exports

@ultimate/uix-styled#ColorScale
@ultimate/uix-styled#StyleOptions
@ultimate/uix-styled#StyleType
@ultimate/uix-styled#ThemeOptions

## Owned source and evidence

packages/uix-styled/src/index.ts

```text
packages/uix-styled/src/index.ts: export interface ThemeOptions {
packages/uix-styled/src/index.ts: export type ColorScale = {
packages/uix-styled/package.json: "import": "./dist/index.mjs"
packages/uix-styled/tsup.config.ts: entry: { index: "src/index.ts" }
packages/themes/package.json: "@ultimate/uix-styled": "workspace:*"
```

## Relationships

uixstyled.actions
uixstyled.config
uixstyled.service
uixstyled.helpers
uixstyled.stylesheet
uixstyled.utils
package.ultimate.themes.root (pending cross-batch)
package.ultimate.ng-core.root (pending cross-batch)
package.ultimate.react-core.root (pending cross-batch)
package.ultimate.vue-core.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Styled package entry and exported types is present; this record describes the current source without asserting framework parity."
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
