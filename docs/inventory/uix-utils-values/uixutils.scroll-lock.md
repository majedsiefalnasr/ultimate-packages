# UIX shared scroll-lock registry

ID: uixutils.scroll-lock

Framework: shared; availability: public

## Authored interpretation

Keep body scrolling locked while at least one registered overlay ID remains active.

## Framework surface

See [authored signatures and interpretation](README.md). ScrollLockRegistry declares register(id: string): void and unregister(id: string): void. createScrollLockRegistry(): ScrollLockRegistry returns an instance-local Set-backed registry; the first registration calls blockBodyScroll with className u-overflow-hidden and variableName --u-scrollbar-width; removing the last existing ID calls unblockBodyScroll. The singleton scrollLockRegistry is module-scoped. Its implementation imports body-scroll helpers from the DOM utility family and requires browser body access when the first lock is added; no blanket SSR safety is claimed. Root and ./scroll-lock mappings are source/configuration evidence only.

## Public exports

@ultimate/uix-utils#ScrollLockRegistry
@ultimate/uix-utils#createScrollLockRegistry
@ultimate/uix-utils#scrollLockRegistry
@ultimate/uix-utils/scroll-lock#ScrollLockRegistry
@ultimate/uix-utils/scroll-lock#createScrollLockRegistry
@ultimate/uix-utils/scroll-lock#scrollLockRegistry

## Owned source and evidence

packages/uix-utils/src/scroll-lock/index.ts
packages/uix-utils/src/scroll-lock/registry.ts

```text
packages/uix-utils/src/scroll-lock/index.ts: export { createScrollLockRegistry, scrollLockRegistry } from "./registry";
packages/uix-utils/src/index.ts: export * from "./scroll-lock";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/ng/src/dialog/dialog.ts: import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";
packages/react-core/src/scroll-lock/use-scroll-lock.ts: import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";
packages/uix-utils/src/scroll-lock/registry.ts: if (blockingIds.size === 0) unblockBodyScroll(SCROLL_LOCK_OPTIONS);
```

## Relationships

package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX shared scroll-lock registry is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-values.json --out docs/inventory/uix-utils-values (run twice; authored README SHA-256 checked before and after)",
    "revision": "7a06beb32487f04ccd84a765f7722ac606825c74",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 55 source files, 64 named symbols, 128 root/subpath export identities, 8 records, no problems; the authored README SHA-256 was unchanged. The #143 DOM relationship remains in the pending cross-scope ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; the #143 cross-scope relationship remains pending in the pilot, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/uix-utils-values/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash. The cross-scope #143 relationship is transparently retained in the pending ledger."
  }
]
```
