# UIX prop merging utilities

ID: uixutils.mergeprops

Framework: shared; availability: public

## Authored interpretation

Merge prop objects, including class/style composition and ordered callback chaining.

## Framework surface

See [authored signatures and interpretation](README.md). mergeProps(...props: any[]): object | undefined performs a left-to-right merge; styles merge shallowly, class/className use cn, and function-valued properties chain the prior callback before the later callback. mergeDefaultProps(...props: any[]): object | undefined applies the same rules while skipping later undefined values. It imports cn and isFunction. No production imports were found in the packages/ source scan; the package's own mergeprops test is a consumer. Package root and ./mergeprops mappings are source/configuration evidence only.

## Public exports

@ultimate/uix-utils#mergeDefaultProps
@ultimate/uix-utils#mergeProps
@ultimate/uix-utils/mergeprops#mergeDefaultProps
@ultimate/uix-utils/mergeprops#mergeProps

## Owned source and evidence

packages/uix-utils/src/mergeprops/index.ts

```text
packages/uix-utils/src/mergeprops/index.ts: export function mergeProps(...props: any[]): object | undefined {
packages/uix-utils/src/index.ts: export * from "./mergeprops";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/uix-utils/test/mergeprops.test.ts: import { mergeProps, mergeDefaultProps } from "../src/mergeprops";
```

## Relationships

package.ultimate.uix-utils.classnames → [uixutils.classnames](uixutils.classnames.md) (reconciled family alias)
package.ultimate.uix-utils.object → [uixutils.object](uixutils.object.md) (reconciled family alias)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX prop merging utilities is present; this record describes the current source without asserting framework parity."
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
