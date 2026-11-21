# Component, editable and input bases

ID: vuecore.base

Framework: vue; availability: public

## Authored interpretation

Options-API factories producing base components: class resolution with style registration, an editable value holder and an input base.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports createBaseComponent, createBaseEditableHolder, createBaseInput and the types ClassValue, StyleModule and BaseComponentOptions. createBaseComponent adds a cx method and registers the style module on mount; createBaseEditableHolder adds modelValue and defaultValue props, update:modelValue and value-change emits, dValue, controlled and filled; createBaseInput adds size, fluid and variant props and injects pcFluid. createBaseComponent also declares the unstyled and dt props, a computed isUnstyled and a cx that returns undefined while unstyled; dt is written as a scoped variable block on mount, rewritten on change and removed on unmount (ADR-085). createBaseComponent mixes in createPassThroughMixin (passthrough.ts, ADR-077): the pt and ptOptions props, ptm, ptmi, ptmo, the pt:section:attribute attributes and the $parentInstance provide and inject, with an optional hostName in BaseComponentOptions (ADR-079). The global and default pt sources, usePassThrough, pt.hooks, the $attrSelector dataset and the ptmi id fallback are not implemented (ADR-080), so ptOptions has no visible effect yet.

## Public exports

@ultimate/vue-core#createBaseComponent
@ultimate/vue-core#StyleModule
@ultimate/vue-core#ClassValue
@ultimate/vue-core#BaseComponentOptions
@ultimate/vue-core#createBaseEditableHolder
@ultimate/vue-core#createBaseInput
@ultimate/vue-core#createPassThroughMixin
@ultimate/vue-core#getPassThroughValue
@ultimate/vue-core#PassThrough
@ultimate/vue-core#PassThroughAttributes
@ultimate/vue-core#PassThroughContext
@ultimate/vue-core#PassThroughOptions

## Owned source and evidence

packages/vue-core/src/base/index.ts
packages/vue-core/src/base/base-component.ts
packages/vue-core/src/base/base-editable-holder.ts
packages/vue-core/src/base/base-input.ts
packages/vue-core/src/base/passthrough.ts

```text
packages/vue-core/src/base/base-component.ts: export function createBaseComponent(options: BaseComponentOptions) {
packages/vue-core/src/base/base-editable-holder.ts: export function createBaseEditableHolder(
packages/vue-core/src/base/base-input.ts: export function createBaseInput() {
packages/vue-core/src/base/passthrough.ts: export function createPassThroughMixin(
```

## Relationships

vuecore.styling
package.ultimate.uix-utils.classnames (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component, editable and input bases is present; this record describes the current source without asserting framework parity."
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
    "revision": "2b9a684df33d0e7dc1e2120eb6ca981fd2865932",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 59 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
