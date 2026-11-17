# UIX z-index manager

ID: uixutils.zindex

Framework: shared; availability: public

## Authored interpretation

Assign and clear inline z-index values while tracking the module-local stack.

## Framework surface

See [authored signatures and interpretation](README.md). ZIndexOptions declares get(element?: HTMLElement): number; set(key: string, element: HTMLElement, baseZIndex?: number): void; clear(element: HTMLElement): void; getCurrent(key: string): number. The singleton ZIndex uses a module-local stack and default base index 999, reading/writing HTMLElement.style. The implementation accepts omitted elements for set/clear although the interface requires them; this declaration/runtime discrepancy is documented without repair. Root and ./zindex mappings are source/configuration evidence; HTMLElement use means no blanket SSR claim.

## Public exports

@ultimate/uix-utils#ZIndex
@ultimate/uix-utils#ZIndexOptions
@ultimate/uix-utils/zindex#ZIndex
@ultimate/uix-utils/zindex#ZIndexOptions

## Owned source and evidence

packages/uix-utils/src/zindex/index.ts

```text
packages/uix-utils/src/zindex/index.ts: export interface ZIndexOptions {
packages/uix-utils/src/index.ts: export * from "./zindex";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/ng-core/src/overlay/overlay.ts: import { ZIndex } from "@ultimate/uix-utils/zindex";
packages/vue-core/src/zindex/use-z-index.ts: import { ZIndex } from "@ultimate/uix-utils/zindex";
packages/uix-utils/src/zindex/index.ts: set: (key: string, element?: HTMLElement, baseZIndex?: number) => {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX z-index manager is present; this record describes the current source without asserting framework parity."
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
