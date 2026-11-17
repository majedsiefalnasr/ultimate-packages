# UIX classname utilities

ID: uixutils.classnames

Framework: shared; availability: public

## Authored interpretation

Build conditional CSS class strings; expose cn and the deprecated classNames alias.

## Framework surface

See [authored signatures and interpretation](README.md). cn(...args: any[]): string | undefined recursively includes truthy strings, numbers, arrays, and object keys whose values are truthy. classNames(...args: any[]): string | undefined forwards to cn and is marked deprecated. The module has no direct DOM access. Both package-root and ./classnames source exports are evidenced; installed artifact resolution is not exercised.

## Public exports

@ultimate/uix-utils#classNames
@ultimate/uix-utils#cn
@ultimate/uix-utils/classnames#classNames
@ultimate/uix-utils/classnames#cn

## Owned source and evidence

packages/uix-utils/src/classnames/index.ts

```text
packages/uix-utils/src/classnames/index.ts: export function cn(...args: any[]): string | undefined {
packages/uix-utils/src/index.ts: export * from "./classnames";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/ng-core/src/basecomponent/base-component.ts: import { cn } from "@ultimate/uix-utils/classnames";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX classname utilities is present; this record describes the current source without asserting framework parity."
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
