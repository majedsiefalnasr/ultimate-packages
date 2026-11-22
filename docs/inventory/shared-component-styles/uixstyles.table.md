# Table styles

ID: uixstyles.table

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the data table component, including sorting, filtering, resizing, reordering, scrolling and virtual-scroller spacing parts.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/table only (it is not re-exported from the package root). Selectors: .u-table-* covering header, footer, sortable and sorted columns, inline and popover filter overlays and rules, resizers, reorder handles and indicators, striped, gridlines, hoverable, scrollable and flex-scrollable modes, row toggle, mask and loading icon. Tokens use the datatable.* namespace, not table.*; the module name and token namespace differ in source.

## Public exports

@ultimate/uix-styles/table#style

## Owned source and evidence

packages/uix-styles/src/table/index.ts

```text
packages/uix-styles/src/table/index.ts: export const style = /*css*/ `
packages/uix-styles/src/table/index.ts: .u-table {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Table styles is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and snapshot tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/uix-styles/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/shared-component-styles.json --out docs/inventory/shared-component-styles (run twice; authored README SHA-256 checked before and after)",
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 14 source files, 14 named symbols, 14 root/subpath export identities, 13 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/shared-component-styles/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
