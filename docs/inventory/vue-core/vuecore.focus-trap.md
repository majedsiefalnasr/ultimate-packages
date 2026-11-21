# Focus trap directive

ID: vuecore.focus-trap

Framework: vue; availability: public

## Authored interpretation

Directive that inserts hidden sentinel elements and keeps tab focus inside the host element.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports focusTrapDirective and the type FocusTrapBindingValue (disabled, autoFocus, autoFocusSelector, firstFocusableSelector, lastFocusableSelector). Per-element state is kept in a WeakMap; a MutationObserver is part of the state.

## Public exports

@ultimate/vue-core#focusTrapDirective
@ultimate/vue-core#FocusTrapBindingValue

## Owned source and evidence

packages/vue-core/src/focus-trap/index.ts
packages/vue-core/src/focus-trap/focus-trap.ts

```text
packages/vue-core/src/focus-trap/focus-trap.ts: export interface FocusTrapBindingValue {
packages/vue-core/src/focus-trap/focus-trap.ts: const stateByElement = new WeakMap<HTMLElement, TrapState>();
```

## Relationships

vuecore.directive
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
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/vue-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-core.json --out docs/inventory/vue-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 34 source files accounted for, 47 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
