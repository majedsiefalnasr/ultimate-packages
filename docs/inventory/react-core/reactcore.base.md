# Component base hook

ID: reactcore.base

Framework: react; availability: public

## Authored interpretation

Hook that registers a component style module and returns a cx resolver turning style-module class entries into class strings.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports useComponentBase and the types ClassValue, StyleModule and ComponentBaseOptions. cx(key, params) resolves a function or string entry of styleModule.classes through classNames and returns undefined for unknown keys. ComponentBaseOptions gains unstyled; useComponentBase returns { cx, isUnstyled } and cx returns undefined while unstyled (ADR-085). ComponentBaseOptions also takes an optional additionalPresetKeys list, which useComponentBase passes to useComponentStyle (ticket #207, ADR-105). React has no per-instance dt. createPassThrough(componentName, { props, state, parent, hostName }) returns ptm and ptmo, and getPassThroughValue resolves one section from props.pt, in passthrough.ts (ADR-077). React has no automatic host lookup: the caller passes parent (ADR-079). The global and default pt sources, usePassThrough and pt.hooks are not implemented (ADR-080), so ptOptions has no visible effect yet.

## Public exports

@ultimate/react-core#useComponentBase
@ultimate/react-core#ClassValue
@ultimate/react-core#StyleModule
@ultimate/react-core#ComponentBaseOptions
@ultimate/react-core#createPassThrough
@ultimate/react-core#getPassThroughValue
@ultimate/react-core#PassThrough
@ultimate/react-core#PassThroughAttributes
@ultimate/react-core#PassThroughContext
@ultimate/react-core#PassThroughMetadata
@ultimate/react-core#PassThroughOptions

## Owned source and evidence

packages/react-core/src/base/index.ts
packages/react-core/src/base/component-base.ts
packages/react-core/src/base/passthrough.ts

```text
packages/react-core/src/base/component-base.ts: export function useComponentBase({
packages/react-core/src/base/component-base.ts: additionalPresetKeys?: readonly string[];
packages/react-core/src/base/index.ts: export { useComponentBase } from "./component-base";
packages/react-core/src/base/passthrough.ts: export function createPassThrough(
```

## Relationships

reactcore.styling
package.ultimate.uix-utils.classnames (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component base hook is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/react-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 56 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
