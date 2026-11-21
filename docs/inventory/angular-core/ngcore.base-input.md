# Input base and fluid ancestor token

ID: ngcore.base-input

Framework: angular; availability: public

## Authored interpretation

Abstract base for text-like inputs that carries fluid, variant, size and native constraint inputs, plus the injection token that lets an ancestor make descendants fluid.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UBaseInput (abstract class extending UBaseEditableHolder) and U_FLUID_ANCESTOR (InjectionToken<true>). Fluid state reads the optional token from the host with skipSelf.

## Public exports

@ultimate/ng-core#UBaseInput
@ultimate/ng-core#U_FLUID_ANCESTOR

## Owned source and evidence

packages/ng-core/src/base-input/index.ts
packages/ng-core/src/base-input/base-input.ts
packages/ng-core/src/base-input/fluid-ancestor.token.ts

```text
packages/ng-core/src/base-input/base-input.ts: export abstract class UBaseInput extends UBaseEditableHolder {
packages/ng-core/src/base-input/fluid-ancestor.token.ts: export const U_FLUID_ANCESTOR = new InjectionToken<true>("U_FLUID_ANCESTOR");
```

## Relationships

ngcore.base-editable-holder

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Input base and fluid ancestor token is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/ng-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-core.json --out docs/inventory/angular-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 26 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
