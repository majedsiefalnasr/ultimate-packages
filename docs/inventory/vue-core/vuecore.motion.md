# Motion transition hooks

ID: vuecore.motion

Framework: vue; availability: public

## Authored interpretation

Factory producing Vue transition hooks that drive uix-motion enter and leave.

## Framework surface

See [authored signatures and interpretation](README.md). Root export createMotionTransitionHooks(getOptions) returning onEnter, onLeave, onEnterCancelled and onLeaveCancelled. Motion instances are kept per element in a WeakMap and cancelled on cancellation hooks.

## Public exports

@ultimate/vue-core#createMotionTransitionHooks

## Owned source and evidence

packages/vue-core/src/motion/index.ts
packages/vue-core/src/motion/use-motion.ts

```text
packages/vue-core/src/motion/use-motion.ts: export function createMotionTransitionHooks(
```

## Relationships

package.ultimate.uix-motion.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Motion transition hooks is present; this record describes the current source without asserting framework parity."
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
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 59 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
