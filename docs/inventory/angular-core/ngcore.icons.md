# Icon primitives

ID: ngcore.icons

Framework: angular; availability: public

## Authored interpretation

Abstract icon base and the spinner, times and window maximize and minimize icon components used by composite components.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UBaseIcon (abstract, with aria-label alias input and spin flag), USpinnerIcon, UTimesIcon, UWindowMaximizeIcon and UWindowMinimizeIcon with selectors u-spinner-icon, u-times-icon, u-window-maximize-icon and u-window-minimize-icon. The spinner builds a path id with crypto.randomUUID.

## Public exports

@ultimate/ng-core#UBaseIcon
@ultimate/ng-core#USpinnerIcon
@ultimate/ng-core#UTimesIcon
@ultimate/ng-core#UWindowMaximizeIcon
@ultimate/ng-core#UWindowMinimizeIcon

## Owned source and evidence

packages/ng-core/src/icons/index.ts
packages/ng-core/src/icons/base-icon.ts
packages/ng-core/src/icons/spinner-icon.ts
packages/ng-core/src/icons/times-icon.ts
packages/ng-core/src/icons/window-maximize-icon.ts
packages/ng-core/src/icons/window-minimize-icon.ts

```text
packages/ng-core/src/icons/base-icon.ts: export abstract class UBaseIcon {
packages/ng-core/src/icons/spinner-icon.ts: selector: "u-spinner-icon",
packages/ng-core/src/icons/times-icon.ts: export class UTimesIcon extends UBaseIcon {}
packages/ng-core/src/icons/window-maximize-icon.ts: export class UWindowMaximizeIcon extends UBaseIcon {
packages/ng-core/src/icons/window-minimize-icon.ts: export class UWindowMinimizeIcon extends UBaseIcon {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Icon primitives is present; this record describes the current source without asserting framework parity."
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
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 60 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
