# Component base hook

ID: reactcore.base

Framework: react; availability: public

## Authored interpretation

Hook that registers a component style module and returns a cx resolver turning style-module class entries into class strings.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports useComponentBase and the types ClassValue, StyleModule and ComponentBaseOptions. cx(key, params) resolves a function or string entry of styleModule.classes through classNames and returns undefined for unknown keys.

## Public exports

@ultimate/react-core#useComponentBase
@ultimate/react-core#ClassValue
@ultimate/react-core#StyleModule
@ultimate/react-core#ComponentBaseOptions

## Owned source and evidence

packages/react-core/src/base/index.ts
packages/react-core/src/base/component-base.ts

```text
packages/react-core/src/base/component-base.ts: export function useComponentBase({ componentName, styleModule }: ComponentBaseOptions): {
packages/react-core/src/base/index.ts: export { useComponentBase } from "./component-base";
```

## Relationships

reactcore.styling
package.ultimate.uix-utils.classnames (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component base hook is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/react-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "bc2ea64ece059085cc26dbc0e72e983b12f16cd1",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 37 source files accounted for, 39 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
