# Escape and display-order mixins

ID: vuecore.escape

Framework: vue; availability: public

## Authored interpretation

Mixins and a composable that register Escape key handlers with priorities and track display order of visible groups.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports createGlobalEscapeKeyMixin, CreateGlobalEscapeKeyMixinOptions, useDisplayOrder, createDisplayOrderMixin and CreateDisplayOrderMixinOptions. The mixins register on mount and update and unregister before unmount; useDisplayOrder registers on mount only when visible.

## Public exports

@ultimate/vue-core#createGlobalEscapeKeyMixin
@ultimate/vue-core#CreateGlobalEscapeKeyMixinOptions
@ultimate/vue-core#useDisplayOrder
@ultimate/vue-core#createDisplayOrderMixin
@ultimate/vue-core#CreateDisplayOrderMixinOptions

## Owned source and evidence

packages/vue-core/src/escape/index.ts
packages/vue-core/src/escape/create-display-order-mixin.ts
packages/vue-core/src/escape/use-display-order.ts
packages/vue-core/src/escape/use-global-escape-key.ts

```text
packages/vue-core/src/escape/use-global-escape-key.ts: export function createGlobalEscapeKeyMixin({
packages/vue-core/src/escape/use-display-order.ts: export function useDisplayOrder(
packages/vue-core/src/escape/create-display-order-mixin.ts: export function createDisplayOrderMixin({ group, isVisible }: CreateDisplayOrderMixinOptions) {
```

## Relationships

package.ultimate.uix-utils.escape (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Escape and display-order mixins is present; this record describes the current source without asserting framework parity."
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
