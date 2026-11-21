# Vue core entry

ID: vuecore.root

Framework: vue; availability: internal

## Authored interpretation

The package entry barrel that selects which Vue core primitives are public.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts star re-exports eleven modules (base, directive, escape, focus-trap, icons, motion, overlay, scroll-lock, service, styling, zindex). Availability is internal because the barrel owns no export identities; the identities it forwards are attributed to the module records.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/vue-core/src/index.ts

```text
packages/vue-core/src/index.ts: export * from "./base";
packages/vue-core/src/index.ts: export * from "./zindex";
```

## Relationships

vuecore.base
vuecore.directive
vuecore.escape
vuecore.focus-trap
vuecore.icons
vuecore.motion
vuecore.overlay
vuecore.scroll-lock
vuecore.service
vuecore.styling
vuecore.zindex

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Vue core entry is present; this record describes the current source without asserting framework parity."
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
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 35 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
