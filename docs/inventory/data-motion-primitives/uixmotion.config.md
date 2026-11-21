# Motion configuration and factory

ID: uixmotion.config

Framework: shared; availability: public

## Authored interpretation

Default motion options and the createMotion factory.

## Framework surface

See [authored signatures and interpretation](README.md). Root export of @ultimate/uix-motion only (single "." export; tsup builds one entry). DEFAULT_MOTION_OPTIONS: MotionOptions (name "u" since ticket #177 (F13), safe, enter, leave, autoHeight true; disabled and autoWidth false) and createMotion(element: Element, options?: MotionOptions): MotionInstance, which throws when the element is missing or when both enter and leave are false.

## Public exports

@ultimate/uix-motion#DEFAULT_MOTION_OPTIONS
@ultimate/uix-motion#createMotion

## Owned source and evidence

packages/uix-motion/src/config/index.ts

```text
packages/uix-motion/src/config/index.ts: export const DEFAULT_MOTION_OPTIONS: MotionOptions = {
packages/uix-motion/src/config/index.ts: export function createMotion(element: Element, options?: MotionOptions): MotionInstance {
```

## Relationships

uixmotion.types
uixmotion.utils
uixmotion.root

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Motion configuration and factory is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/uix-motion/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/data-motion-primitives.json --out docs/inventory/data-motion-primitives (run twice; authored README SHA-256 checked before and after)",
    "revision": "75271f0ae536520ff9179f33b4309e7950b7aab4",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 11 source files, 34 named symbols, 34 root export identities, 11 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/data-motion-primitives/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
