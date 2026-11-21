# Focus trap directive

ID: ngcore.focus-trap

Framework: angular; availability: public

## Authored interpretation

Directive that wraps Tab and Shift+Tab focus inside its host element.

## Framework surface

See [authored signatures and interpretation](README.md). Root export UFocusTrap, selector [uFocusTrap], input uFocusTrapDisabled. It uses the focusable element query from the uix-utils DOM utilities.

## Public exports

@ultimate/ng-core#UFocusTrap

## Owned source and evidence

packages/ng-core/src/focus-trap/index.ts
packages/ng-core/src/focus-trap/focus-trap.ts

```text
packages/ng-core/src/focus-trap/focus-trap.ts: selector: "[uFocusTrap]",
packages/ng-core/src/focus-trap/index.ts: export { UFocusTrap } from "./focus-trap";
```

## Relationships

package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Focus trap directive is present; this record describes the current source without asserting framework parity."
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
