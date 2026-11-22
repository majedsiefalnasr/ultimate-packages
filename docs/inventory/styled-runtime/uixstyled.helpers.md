# Token, CSS and color helpers

ID: uixstyled.helpers

Framework: shared; availability: public

## Authored interpretation

Helpers that resolve design tokens, tag CSS templates, build CSS variables from a theme object and derive color scales.

## Framework surface

See [authored signatures and interpretation](README.md). $dt(tokenPath) returns { name, variable, value }. dt(...args) and dtwt(theme, tokenPath, fallback?, type?) resolve a token to a var() reference or, in strict mode or type "value", to its value. css(strings, ...exprs) is a tag/function that resolves dt() expressions. $t(theme) is a chainable builder with preset, options, primaryPalette, surfacePalette, define, update and use. toVariables(theme, options) returns toVariableOutput (default export, re-exported by name) with the toVariableOptions and toVariableOutput interfaces. mix(color1, color2, weight), shade(color, percent), tint(color, percent) and palette(color) are color utilities; palette returns a ColorScale of shades 50-950 or token references.

## Public exports

@ultimate/uix-styled#$dt
@ultimate/uix-styled#$t
@ultimate/uix-styled#css
@ultimate/uix-styled#dt
@ultimate/uix-styled#dtwt
@ultimate/uix-styled#mix
@ultimate/uix-styled#palette
@ultimate/uix-styled#shade
@ultimate/uix-styled#tint
@ultimate/uix-styled#toVariableOptions
@ultimate/uix-styled#toVariableOutput
@ultimate/uix-styled#toVariables

## Owned source and evidence

packages/uix-styled/src/helpers/index.ts
packages/uix-styled/src/helpers/css.ts
packages/uix-styled/src/helpers/dt.ts
packages/uix-styled/src/helpers/t.ts
packages/uix-styled/src/helpers/toVariables.ts
packages/uix-styled/src/helpers/color/mix.ts
packages/uix-styled/src/helpers/color/palette.ts
packages/uix-styled/src/helpers/color/shade.ts
packages/uix-styled/src/helpers/color/tint.ts

```text
packages/uix-styled/src/helpers/dt.ts: export const dtwt = (theme: any = {}
packages/uix-styled/src/helpers/t.ts: export const $t = (theme: any = {}) => {
packages/uix-styled/src/helpers/color/shade.ts: mix("#000000", color, percent)
packages/uix-styled/src/helpers/index.ts: export * from "./dt";
packages/uix-styled/src/index.ts: export { default as palette } from "./helpers/color/palette";
```

## Relationships

uixstyled.config
uixstyled.utils
uixstyled.root
package.ultimate.uix-utils.object (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Token, CSS and color helpers is present; this record describes the current source without asserting framework parity."
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
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 28 source files accounted for, 61 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
