# UIX prefixed ID counter

ID: uixutils.uuid

Framework: shared; availability: public

## Authored interpretation

Create incrementing module-local IDs with caller-selected prefixes.

## Framework surface

See [authored signatures and interpretation](README.md). uuid(prefix: string = "pui_id_"): string increments a module-local counter independently per prefix. It is deterministic and not random or cryptographic; it has no direct DOM dependency. Package-root and ./uuid source/configuration mappings are recorded; installed artifact resolution is unverified.

## Public exports

@ultimate/uix-utils#uuid
@ultimate/uix-utils/uuid#uuid

## Owned source and evidence

packages/uix-utils/src/uuid/index.ts

```text
packages/uix-utils/src/uuid/index.ts: export function uuid(prefix: string = "pui_id_"): string {
packages/uix-utils/src/index.ts: export * from "./uuid";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/ng/src/fieldset/fieldset.ts: import { uuid } from "@ultimate/uix-utils/uuid";
packages/vue/src/tooltip/tooltip.ts: import { uuid } from "@ultimate/uix-utils/uuid";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX prefixed ID counter is present; this record describes the current source without asserting framework parity."
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
