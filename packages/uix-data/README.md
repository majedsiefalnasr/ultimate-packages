# @ultimate/uix-data

Framework-neutral pure types and pure functions for shared Data-component semantics, for the Ultimate Platform UI foundation.

**Status:** unstable (pre-1.0). No semver guarantee yet. Package name is provisional.

This package contains exactly six concepts, each verified as genuinely shared across Angular, React, and Vue real source (PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5) through a sequence of six approved architecture research passes. It does not, and will not, contain component logic, rendering, templating, framework lifecycle, or any framework-specific state — see Out of Scope below.

## Provenance

Mixed: `equals` is re-exported unchanged from `@ultimate/uix-utils/object` (see that package's own provenance). The remaining five modules are Ultimate-authored, each verified against real pinned Prime source rather than copied from a single file. See `docs/architecture/PROVENANCE.md` (`@ultimate/uix-data` entry) and `docs/architecture/provenance/uix-data.json` for the full verification basis per module.

## Public API

```typescript
import {
  equals,
  type SelectionMode,
  type SortMeta,
  type SortMode,
  type FilterMatchMode,
  type FilterMetadata,
  type PaginationState,
  getPageCount,
  calculateNumItemsInViewport,
  calculateLast,
} from "@ultimate/uix-data";
```

- **`equals(obj1: any, obj2: any, field?: string): boolean`** — deep-equality or field-path comparison. Re-exported unchanged from `@ultimate/uix-utils/object`.
- **`SelectionMode = "single" | "multiple"`** — selection-cardinality vocabulary only. Carries no information about selection storage, mutation, or events.
- **`SortMeta { field: string; order: 1 | 0 | -1 }`**, **`SortMode = "single" | "multiple"`** — sort metadata shape. No comparator function is provided.
- **`FilterMatchMode`** (union of verified match-mode strings), **`FilterMetadata { value: unknown; matchMode: FilterMatchMode }`** — simple filter shape only.
- **`PaginationState { first: number; rows: number; totalRecords: number; rowsPerPageOptions?: number[] }`**, **`getPageCount(totalRecords: number, rows: number): number`**.
- **`calculateNumItemsInViewport(contentSize: number, itemSize: number): number`**, **`calculateLast(first: number, numItemsInViewport: number, numToleratedItems: number, isColumns?: boolean): number`** — pure virtualization windowing math.

## Out of scope (deliberately, with evidence)

- **Hierarchical (Tree-family) identity/selection/expansion** — verified structurally incompatible across frameworks (object-mutation vs. external key-maps). Tree, TreeTable, TreeSelect, and OrganizationChart remain framework-native.
- **Selection state, collections, ownership, events** — only the `SelectionMode` vocabulary is shared; everything else is framework-owned.
- **Filter `operator`/`constraints`/multi-constraint model** — real, verified, but differently normalized between frameworks; deferred until real `Table` implementation justifies it.
- **Sort-toggle/removable-sort cycling** — verified present in React/Vue's real source, absent from Angular's; fails the cross-framework-identity bar.
- **Page-link display math, array-bounds clamping, any live-scroll-state-coupled calculation** — rendering or live-state concerns, not pure Data semantics.

## Dependencies

Depends on `@ultimate/uix-utils` (workspace), for `equals` only.
