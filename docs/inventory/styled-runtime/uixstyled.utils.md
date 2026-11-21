# Token and CSS-variable utilities

ID: uixstyled.utils

Framework: shared; availability: public

## Authored interpretation

Shared regular expressions and functions for normalizing token keys, variable names and units, plus ThemeUtils, the engine that builds token maps and theme CSS.

## Framework surface

See [authored signatures and interpretation](README.md). EXPR_REGEX, CALC_REGEX and VAR_REGEX are exported global regular expressions. toTokenKey, merge, toValue, toUnit, toNormalizePrefix, toNormalizeVariable, getVariableName, hasOddBraces, getVariableValue, getComputedValue, setProperty, getRule and evaluateDtExpressions are named runtime functions (merge returns void and mutates). ThemeUtils (default export of themeUtils.ts, re-exported by name) is an object with getCommon, getPreset, getPresetC, deprecated-style getPresetD, applyDarkColorScheme, getColorSchemeOption, getLayerOrder, getCommonStyleSheet, getStyleSheet, createTokens, getTokenValue, getSelectorRule and transformCSS. Parameters are largely typed any.

## Public exports

@ultimate/uix-styled#CALC_REGEX
@ultimate/uix-styled#EXPR_REGEX
@ultimate/uix-styled#ThemeUtils
@ultimate/uix-styled#VAR_REGEX
@ultimate/uix-styled#evaluateDtExpressions
@ultimate/uix-styled#getComputedValue
@ultimate/uix-styled#getRule
@ultimate/uix-styled#getVariableName
@ultimate/uix-styled#getVariableValue
@ultimate/uix-styled#hasOddBraces
@ultimate/uix-styled#merge
@ultimate/uix-styled#setProperty
@ultimate/uix-styled#toNormalizePrefix
@ultimate/uix-styled#toNormalizeVariable
@ultimate/uix-styled#toTokenKey
@ultimate/uix-styled#toUnit
@ultimate/uix-styled#toValue

## Owned source and evidence

packages/uix-styled/src/utils/index.ts
packages/uix-styled/src/utils/sharedUtils.ts
packages/uix-styled/src/utils/themeUtils.ts

```text
packages/uix-styled/src/utils/sharedUtils.ts: export function evaluateDtExpressions(
packages/uix-styled/src/utils/themeUtils.ts: createTokens(
packages/uix-styled/src/utils/index.ts: export { default as ThemeUtils } from "./themeUtils";
```

## Relationships

uixstyled.config
package.ultimate.uix-utils.object (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Token and CSS-variable utilities is present; this record describes the current source without asserting framework parity."
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
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 26 source files, 57 named symbols, 57 root export identities, 8 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
