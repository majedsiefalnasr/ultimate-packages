# uix-data — Narrow Shared Data Foundation

**Status:** Approved — implemented as `packages/uix-data` (extends Phase 1's `uix-*` package family); `docs/architecture/ROADMAP.md` marks Phase 1 (UltimateUIX Foundation) Complete.
**References:** `ULTIMATE_PLATFORM_BLUEPRINT.md` (v0.1, §2.4 framework-native implementations, §6 dependency direction), `docs/architecture/{PROVENANCE,DEPENDENCIES,PACKAGE_ARCHITECTURE,DECISIONS}.md`, six prior architectural research passes (Discovery Audit; Data Architecture Research Report; Narrow Shared Data Foundation — Boundary Research; uix-data Public API Boundary Research; uix-data Ownership & Semantics Boundary Research; uix-data Consumption-Readiness Research)

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

---

## Context

This spec follows the "Full Ultimate System Expansion" program's Discovery Audit, which found 8 Data components (Table, TreeTable, Tree, Scroller, Paginator, OrderList, PickList, DataView) explicitly tagged `NEEDS ARCHITECTURE DECISION` in `docs/architecture/COMPONENT_INVENTORY.md`, blocked on an undecided shared data/selection/sort/filter/virtualization contract — with TreeSelect and OrganizationChart also depending on part of that surface through Tree.

Five subsequent architecture research passes, each verified against real pinned Prime source (PrimeNG 21.1.9, PrimeReact commit `d0f574e...`/v10.9.9, PrimeVue 4.5.5 — per `docs/architecture/checksums.json`) and each approved before the next began, narrowed that open question to exactly this:

1. **Data Architecture Research Report** — established that a shared, framework-neutral contract is supported by real evidence, but only for a narrow set of concepts (item identity, selection-equality, sort metadata, filter metadata, pagination state, virtualization windowing), not a universal Data-component abstraction. Hierarchical (Tree-family) identity/selection/expansion was found structurally incompatible across frameworks (PrimeNG mutates `TreeNode` object references in place; PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps) and explicitly excluded.
2. **Narrow Shared Data Foundation — Boundary Research** — established the package boundary: a new dedicated package, sibling to `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`, not an extension of `uix-utils` (domain-vocabulary mismatch) and not folded into any existing uix-* package (category error).
3. **uix-data Public API Boundary Research** — established the exact type/function shapes, re-verifying real Prime source line-by-line and correcting the prior report's claim that virtualization math was fully identical across all three frameworks (Angular's real source has a zero-guard React/Vue's lacks).
4. **uix-data Ownership & Semantics Boundary Research** — established the ownership split: `uix-data` owns pure types/functions only; all live state (selection collections, sort/filter/pagination/scroll state, change events, DOM measurement) is 100% framework-owned, following the `ADR-036` (escape/scroll-lock) precedent.
5. **uix-data Consumption-Readiness Research** — simulated real consumption against actual Prime call sites and confirmed, with evidence, that no additional primitive is needed (several tempting candidates — sort-toggle cycling, page-link display math, virtualization's live-state-coupled `calculateFirst` family, selection toggling — were each investigated and rejected as either not-genuinely-identical-across-frameworks or as crossing into framework-owned state/rendering).

All five passes are approved. This spec formalizes their combined output into a buildable package specification, changing nothing substantive.

---

## Objective

Establish `@ultimate/uix-data` as a new, independently owned, independently buildable, independently testable, framework-neutral package containing exactly the six approved Data primitives — ready for `ng-core`/`react-core`/`vue-core` to consume once Table/DataView/Paginator/Scroller/OrderList/PickList implementation begins (not part of this spec).

---

## Inputs

- `ULTIMATE_PLATFORM_BLUEPRINT.md` §2.4 (framework-native implementations — shared contracts permitted where genuinely proven, never forced), §6 (dependency direction).
- `docs/architecture/{PROVENANCE,DEPENDENCIES,DECISIONS,PACKAGE_ARCHITECTURE}.md` — existing package conventions, ADR-036 precedent, dependency-direction enforcement (`validate-boundaries.mjs`, matches by `uix`-prefixed directory name, requires no configuration change for a new `uix-*` package).
- `docs/architecture/checksums.json` — pinned commit/tarball identifiers for PrimeNG, PrimeReact, PrimeVue, and the four `@primeuix/*` packages.
- `packages/uix-utils/src/object/methods/equals.ts` (and its `resolveFieldData`/`deepEquals` dependencies) — the existing implementation this package reuses without duplication.
- The six approved research reports (conversation record; not separately filed as documents).

---

## Constraints (from the Blueprint and approved research, binding on this package)

- Zero dependency on Angular, React, or Vue (enforced by existing `validate-boundaries.mjs`, which matches any `uix`-prefixed package directory automatically).
- Depend on `@ultimate/uix-utils` only where genuine reuse applies (`equals`); no other runtime dependency.
- No hierarchical (Tree-family) identity, selection, or expansion semantics — Tree, TreeTable, TreeSelect, and OrganizationChart remain framework-native for these concerns, revisited only if future evidence establishes genuine shared semantics.
- No selection state, collection, ownership, event, or controlled/uncontrolled abstraction — only the `SelectionMode` vocabulary type.
- No filter `operator`/`constraints`/multi-constraint model — deferred until real `Table` implementation provides evidence (a deferral, not a rejection).
- No component logic, rendering, templating, framework lifecycle, or event-delivery mechanism.
- No page-link display math (`pageLinkSize`-driven), no sort-toggle/removable-sort behavior, no live-state-coupled virtualization helpers beyond the two approved pure functions, no selection-toggle helper — each investigated and rejected in the Consumption-Readiness pass.
- Package name (`@ultimate/uix-data`) remains provisional, consistent with Blueprint §34 and the still-open naming question from the Boundary Research pass.

---

## Real-Source Findings Carried Into This Spec

Re-stated from the approved research (not re-derived here; see the six reports for full verification detail):

- `uix-utils/object/methods/equals.ts`: `equals(obj1: any, obj2: any, field?: string): boolean` — verified pure, zero module-level state, delegates to `resolveFieldData` (dot-path traversal, function-fields, try/catch-guarded) and `deepEquals`. Already more general than Prime's own `dataKey`-based equality checks require. **Reused verbatim, not duplicated.**
- Sort: `SortMeta { field: string; order: 1 | 0 | -1 }` verified identical field names/types in PrimeNG (`SortMeta[]`) and PrimeReact (`DataTableSortMeta`); `SortMode = "single" | "multiple"` verified identical union. No standalone comparator function found genuinely shared across frameworks (sort execution is entangled with row-value resolution in real Table source) — type-only.
- Filter: `FilterMatchMode` (union of match-mode strings) and `FilterMetadata { value: unknown; matchMode: FilterMatchMode }` verified as the common subset between PrimeReact's `DataTableFilterMetaData` and PrimeNG's `FilterMetadata`. The operator/constraints wrapper (PrimeReact's `DataTableOperatorFilterMetaData`, PrimeNG's `FilterMetadata[]`-as-array-of-alternatives) is a real, verified, but *differently normalized* shape between the two frameworks — explicitly deferred, not shipped.
- Pagination: `PaginationState { first: number; rows: number; totalRecords: number; rowsPerPageOptions?: number[] }` verified against PrimeNG's real Paginator fields. `getPageCount(totalRecords: number, rows: number): number` verified as a real (if only internally-inlined, never previously exported even by Prime itself) one-line calculation in PrimeNG's `paginator.ts`; included with a zero-guard (`rows > 0 ? Math.ceil(...) : 0`) Prime's own source lacks, to prevent a `NaN`/`Infinity` edge case once centralized.
- Virtualization: `calculateNumItemsInViewport(contentSize: number, itemSize: number): number` and `calculateLast(first: number, numItemsInViewport: number, numToleratedItems: number, isColumns?: boolean): number` verified as pure tolerance-buffered offset math, present with materially the same formula across all three frameworks' real Scroller/VirtualScroller source — **with one correction surfacing during the API-shape pass**: Angular's real `calculateNumItemsInViewport` includes a zero-guard (`_itemSize || _contentSize ? Math.ceil(...) : 0`) that PrimeReact's and PrimeVue's real implementations lack (they would produce `NaN` on a `0/0` input). The shared function adopts Angular's safer guard. Array-bounds clamping against live collection length is excluded — it requires live component state, verified as a separate line of code at Prime's real call sites, not part of the pure calculation.
- Selection vocabulary: `SelectionMode = "single" | "multiple"` verified identical across PrimeNG/React/Vue's Table `selectionMode` prop in the original Data Architecture Research Report. No broader selection-shape abstraction is supported by evidence (Table's `selection: T | T[]` already diverges from any prospective key-map shape, independent of the separately-excluded Tree-family case).

---

## Package Scope

One new package:

```text
packages/
└── uix-data/    @ultimate/uix-data (provisional name)
```

Sibling to `uix-utils`, `uix-styled`, `uix-styles`, `uix-motion` — same architectural layer (shared UIX infrastructure, below framework core).

### `@ultimate/uix-data`

|                      |                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose              | Framework-neutral pure types and pure functions for the six verified-shared Data semantics (identity, selection vocabulary, sort metadata, filter metadata, pagination state, virtualization windowing) |
| Public API           | `equals` (re-export), `SelectionMode`, `SortMeta`, `SortMode`, `FilterMatchMode`, `FilterMetadata`, `PaginationState`, `getPageCount`, `calculateNumItemsInViewport`, `calculateLast` — single flat barrel |
| Internal API         | none — the package is small enough that internal concept-folders (see Export Structure) contain no logic beyond what the barrel re-exports |
| Dependencies         | `@ultimate/uix-utils` (for `equals` only)                                                                                                 |
| Peer dependencies    | none                                                                                                                                       |
| Build output         | ESM (`dist/index.mjs`), `.d.mts` declarations, source maps, single entry (no subpath exports — package is too small to warrant `uix-utils`'s wildcard-subpath convention; matches `uix-styled`/`uix-motion`'s single-barrel shape instead) |
| Exports              | `.` only                                                                                                                                   |
| Side effects         | `sideEffects: false` — every export is a type or a pure function                                                                          |
| Tests                | Vitest, unit tests per concept; no jsdom needed (nothing touches the DOM)                                                                 |
| Consumers (future)   | `ng-core`, `react-core`, `vue-core`, once Table/DataView/Paginator/Scroller/OrderList/PickList implementation begins (not part of this spec) |
| Ownership            | Ultimate — mixed provenance: `equals` re-exported from an existing MIT-derived, RETAIN-classified `uix-utils` function; the five new types/functions (`SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`) are Ultimate-authored, informed by (not copied verbatim from) verified real Prime source shapes — see Provenance Requirements |

---

## Ownership Boundaries

- **Belongs in `uix-data`:** the six approved pure primitives/types listed above, and nothing else.
- **Belongs in framework core (future, not this spec):** the live selection collection (whatever shape a framework's own Table design picks — array, key-map, or object-reference, informed by but not dictated by Table's already-verified `selection: T | T[]` shape), live `sortField`/`sortOrder`/`multiSortMeta` state, live `filters` state map, live `first`/`rows` pagination state and its change-event handling, `rowsPerPageOptions`-driven dropdown rendering, page-link display math (`pageLinkSize`-driven), live scroll-position/viewport-measurement state, and the final array-bounds clamp on `calculateLast`'s result.
- **Belongs in framework components (future, not this spec):** rendering, templating, keyboard interaction, accessibility wiring, drag/drop, editing/mutation — none of which are part of the approved six-concept scope at any layer.
- **Must remain outside `uix-data` permanently, absent new evidence:** hierarchical Tree-family identity/selection/expansion (Tree, TreeTable, TreeSelect, OrganizationChart), grouping (no evidence found in any research pass), the filter `operator`/`constraints` model (deferred, not rejected — revisit against real `Table` requirements), sort-toggle/removable-sort cycling (verified present in React/Vue's real source but absent from Angular's — fails the cross-framework-identity bar), any selection-toggle or selection-collection helper.

---

## Dependency Rules

Runtime dependency direction (unchanged from Blueprint §6, `PACKAGE_ARCHITECTURE.md`):

```text
Framework Components (future)
        down to
Framework Core (future)
        down to
UltimateUIX (including uix-data, this spec)
```

Within UIX: `uix-data` down to `uix-utils` (for `equals` only) — no other uix-* package dependency, no reverse dependency. `validate-boundaries.mjs` already scans any `packages/uix*`-prefixed directory for framework imports by name-prefix match; a new `packages/uix-data` package requires **zero script changes** to inherit this enforcement.

`validate-dependency-ceiling.mjs`'s existing `WATCHED_PREFIXES` (already extended in Phase 1 to include `uix`, per that phase's spec) already covers `packages/uix-data/package.json` with no further change needed.

---

## Export Structure

Single flat barrel, matching `uix-styled`/`uix-motion`'s existing shape (verified: both re-export selectively from internal subfolders through one curated `index.ts`, not a wildcard subpath map) rather than `uix-utils`'s wildcard-subpath convention (which exists because `uix-utils` is a large, growing, unrelated-mechanism grab-bag — `uix-data` is a small, single-domain package, structurally closer to `uix-styled`/`uix-motion`).

```text
packages/uix-data/src/
├── identity/
│   └── index.ts        # re-exports `equals` from @ultimate/uix-utils/object
├── selection/
│   └── index.ts        # SelectionMode
├── sort/
│   └── index.ts         # SortMeta, SortMode
├── filter/
│   └── index.ts         # FilterMatchMode, FilterMetadata
├── pagination/
│   └── index.ts         # PaginationState, getPageCount
├── virtualization/
│   └── index.ts         # calculateNumItemsInViewport, calculateLast
└── index.ts              # single public barrel, re-exports all of the above
```

Internal per-concept folders exist for source organization and per-concept unit testing only — they are not independently exported subpaths. `package.json` declares `"."` only, matching `uix-styled`/`uix-motion`.

---

## Function and Type Semantics

- **`equals(obj1: any, obj2: any, field?: string): boolean`** — re-exported unchanged from `@ultimate/uix-utils/object`. No renaming, no adapter, no wrapper (verified: signature already matches Data-context call patterns; a rename such as `isSameItem` would introduce a second name for one function with no behavioral difference).
- **`SelectionMode = "single" | "multiple"`** — vocabulary only. Carries no information about how selection is stored, mutated, or communicated.
- **`SortMeta { field: string; order: 1 | 0 | -1 }`**, **`SortMode = "single" | "multiple"`** — plain data shape. No default-value export, no comparator-builder function (none survived the Consumption-Readiness pass's real-source verification).
- **`FilterMatchMode`**, **`FilterMetadata { value: unknown; matchMode: FilterMatchMode }`** — plain data shape, simple (non-operator) variant only. No predicate/evaluation function (none found as genuinely shared in real source across frameworks).
- **`PaginationState { first: number; rows: number; totalRecords: number; rowsPerPageOptions?: number[] }`** — plain data shape; `rowsPerPageOptions` is carried as pass-through configuration for framework-native rendering, touched by no function in this package.
- **`getPageCount(totalRecords: number, rows: number): number`** — pure; returns `rows > 0 ? Math.ceil(totalRecords / rows) : 0`.
- **`calculateNumItemsInViewport(contentSize: number, itemSize: number): number`** — pure; returns `itemSize || contentSize ? Math.ceil(contentSize / (itemSize || contentSize)) : 0` (Angular's verified safer guard).
- **`calculateLast(first: number, numItemsInViewport: number, numToleratedItems: number, isColumns?: boolean): number`** — pure; returns the tolerance-buffered offset (`first + numItemsInViewport + (first < numToleratedItems ? 2 : 3) * numToleratedItems`). Does not clamp against a live array length — callers must apply their own bound.

No function in this package accepts or returns a framework-specific type (no Angular `Signal`, no React element/ref, no Vue `Ref`/reactive proxy). Every signature uses only plain TypeScript primitives, plain objects, and plain unions.

---

## Naming Conventions Applied

- Package name (`uix-data`) is provisional, per the Boundary Research pass — not finalized by this spec.
- Type and function names inside the package keep Prime-recognizable vocabulary (`SortMeta`, `FilterMetadata`) rather than inventing Ultimate-specific renames — verified consistent with existing practice: the "full Ultimate namespace rename" policy in `docs/architecture/PROVENANCE.md` applies to components, selectors, and CSS classes, not to generic/utility-level type or function names (confirmed by `uix-utils`'s own unrenamed `deepEquals`, `resolveFieldData`, `sort`, `filter`, `localeComparator`).
- `equals` is re-exported under its existing name, not aliased.

---

## Testing Requirements

Vitest (matching every other UIX package's existing choice).

- **Unit:** one test file per concept folder (`identity`, `selection`, `sort`, `filter`, `pagination`, `virtualization`). No jsdom environment needed — nothing in this package touches the DOM.
- **`equals` re-export:** a test confirms `@ultimate/uix-data`'s exported `equals` is reference-identical to `@ultimate/uix-utils/object`'s `equals` (catches accidental reimplementation or drift on a future refactor).
- **`getPageCount`:** correctness across normal input, the `rows === 0` zero-guard case, and a case where `totalRecords` is not evenly divisible by `rows` (ceiling behavior).
- **`calculateNumItemsInViewport`:** correctness across normal input and the `itemSize === 0 && contentSize === 0` zero-guard case (the exact case where React's/Vue's real unguarded implementation would produce `NaN`).
- **`calculateLast`:** correctness across the `first < numToleratedItems` and `first >= numToleratedItems` branches, and the `isColumns` parameter (confirming it is accepted and passed through per its verified real-source signature, even though this package's function does not branch on it internally beyond what upstream's real signature does).
- **Type-only exports:** compile-time assertion tests (e.g. a `.test-d.ts` or equivalent) confirming `SortMeta`, `FilterMetadata`, `PaginationState`, `SelectionMode` accept the exact shapes described in Function and Type Semantics and reject shapes outside them (e.g. `SelectionMode` rejects `"none"`).
- **Package:** the single declared export subpath (`.`) is import-tested, matching every sibling UIX package's existing package-export test pattern.
- **Dependency Boundary:** existing `boundary:validate` script exercises this package automatically (name-prefix match, no script change).
- **Prime Dependency Boundary:** existing `ceiling:validate` script exercises this package automatically (already extended to watch `uix`-prefixed packages in Phase 1).
- **Determinism:** no test depends on wall-clock time, DOM availability, or non-seeded randomness.

---

## Provenance Requirements

- **`equals`:** no new provenance entry needed beyond what already exists for `uix-utils/object/methods/equals.ts` (Phase 1's provenance manifest) — this package re-exports, it does not re-incorporate.
- **New types/functions (`SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`):** these are Ultimate-authored, **informed by** verified real Prime source shapes (cited by file path and pinned version in the six research passes) but not mechanically copied — no single Prime file is the direct origin of any of these five modules. `docs/architecture/provenance/uix-data.json` records, per item, the **verification basis** rather than a `originalPath`/`ultimateDestination` pair (the existing manifest schema's field names are reused where they apply; a `verifiedAgainst` array field is added per entry, listing the specific pinned-version source files and line ranges/function names that established cross-framework equivalence, per the approved research reports).
- **`docs/architecture/PROVENANCE.md`:** new package-level entry for `@ultimate/uix-data`, following the existing template, noting mixed provenance (one re-exported function, five independently-authored-but-evidence-verified items) rather than a single wholesale RETAIN classification.
- **`validate-provenance.mjs`:** already extended (Phase 1) to require every `.ts` file under a `packages/uix-*/src/` to have a manifest entry — `uix-data`'s manifest entries use the `verifiedAgainst`-based schema described above rather than claiming a direct `originalPath`, since no single Prime file is the source.

---

## Documentation Requirements

- `packages/uix-data/README.md`: purpose, public API (TSDoc-derived signatures for all ten exports), explicit statement of what is out of scope (hierarchical identity, selection state, filter operators, sort-toggle behavior, page-link math) with a one-line reason each, and a link to `PROVENANCE.md`'s entry plus the manifest JSON.
- Mark the entire public API **unstable** (pre-1.0, no semver guarantee), consistent with every other UIX package's current documentation posture.
- TSDoc comments on every exported symbol, structured consistently with existing UIX packages (supports future metadata generation without rework, per the Blueprint's AI/tooling extensibility goal — no metadata generator is built now).

---

## Security Requirements

- No dynamic evaluation (`eval`/`Function` constructor) anywhere in this package — trivially satisfied, every function is arithmetic or object-field comparison.
- No DOM access, no URL handling, no dynamic `import()` — confirmed by design (the Ownership Boundaries section excludes anything that would require it).
- No new external dependency beyond the existing `@ultimate/uix-utils` — no new supply-chain surface.

---

## Performance Requirements

- Record, after implementation: `dist/` size (bytes), gzip size of the single barrel entry, install size when installed standalone — consistent with every other UIX package's recorded baseline.
- No runtime/initialization-cost benchmark is meaningful yet — no framework consumer exists until Table/DataView/Paginator implementation begins (out of this spec's scope). Defer to that future phase's exit criteria, matching the precedent already set for `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion` in Phase 1.

---

## Deliverables

```text
Package (source + config):
  packages/uix-data/{src/,package.json,tsup.config.ts,README.md}

Tests: *.test.ts colocated per concept folder, vitest.config.ts (shared root config or per-package, per existing convention)

Provenance:
  docs/architecture/provenance/uix-data.json (new — verifiedAgainst-based schema)
  docs/architecture/PROVENANCE.md (new package-level entry)

Architecture decisions:
  docs/architecture/DECISIONS.md — new ADR-043 (uix-data package introduced; six-concept narrow scope; filter operator/constraints and hierarchical identity explicitly deferred/excluded)

Documentation: packages/uix-data/README.md (see Documentation Requirements)

CI: .github/workflows/ci.yml unchanged (existing validators cover the new package by name-prefix match with zero script changes)
```

Note: `THIRD-PARTY-NOTICES.md` is **not** part of this package's deliverables — unlike Phase 1's four UIX packages (each a wholesale RETAIN-classified adaptation of a pinned `@primeuix/*` tarball with its own MIT license text to preserve), `uix-data` has no single upstream package license to carry: `equals` is already covered by `uix-utils`'s existing `THIRD-PARTY-NOTICES.md`, and the five new types/functions are Ultimate-authored.

---

## Acceptance Criteria

- [ ] `packages/uix-data` builds independently via `pnpm -r run build` from a clean checkout.
- [ ] The package's single declared export (`.`) resolves (package/export test passes).
- [ ] `boundary:validate` passes non-trivially for `packages/uix-data` (zero framework imports found).
- [ ] `ceiling:validate` passes non-trivially for `packages/uix-data` (zero `@primeuix/*`/Prime runtime dependency).
- [ ] `provenance:validate` passes — `docs/architecture/provenance/uix-data.json` has an entry for every `.ts` file under `packages/uix-data/src/`, and `PROVENANCE.md` has the new package-level entry.
- [ ] All Vitest suites pass (unit tests per concept, `equals` re-export identity test, type-only export compile-time assertions, package/export test).
- [ ] `equals` is confirmed reference-identical to `@ultimate/uix-utils/object`'s `equals` — no duplicate implementation exists anywhere in `packages/uix-data`.
- [ ] `calculateNumItemsInViewport` is confirmed to use the zero-guard (Angular's safer form), verified by a test exercising the `0/0` input case.
- [ ] README exists, documenting public API, explicit out-of-scope list, and provenance linkage.
- [ ] `docs/architecture/DECISIONS.md` has ADR-043 recorded.
- [ ] No `packages/uix-data` file imports anything from `packages/{ng,react,vue}*` (verified manually at review time, consistent with existing package-boundary review practice).

---

## Risks

| Risk | Impact | Likelihood | Mitigation | Decision point |
| --- | --- | --- | --- | --- |
| A future Table implementation discovers the deferred filter `operator`/`constraints` model is needed sooner than expected, creating pressure to add it ad hoc without going through the same evidence-based process as the other five concepts | Medium — could reintroduce the exact "shared-because-it's-convenient" risk this program's research explicitly guarded against | Medium (Table is the next likely consumer) | Treat the filter-operator addition as its own small architectural fork when it arises, re-verifying real Table requirements against real Prime source at that time — not silently expanding `uix-data`'s scope inside a component implementation task | Table specification/implementation, whenever it begins |
| `getPageCount`'s inclusion (a one-line calculation, never centralized even within Prime itself) is later judged not worth a dedicated package export | Low — the Consumption-Readiness pass already weighed and accepted this trade-off explicitly | Low | If later evidence shows zero real duplication risk in practice, this is a candidate for removal at a future minor-version review — not a blocking concern now | Post-implementation review, once framework consumers exist |
| The `verifiedAgainst`-based provenance manifest schema (proposed in this spec, not previously used for any existing UIX package) turns out awkward for CI tooling to validate mechanically | Low-Medium — could need a schema revision mid-implementation | Low-Medium (schema is new, not yet validated against real bulk data) | Schema is intentionally simple; implementation plan may refine field names/structure without needing a new spec, as long as the required fact (which real source established the equivalence) is preserved | uix-data implementation, `validate-provenance.mjs` extension task |
| Package name `uix-data` is later judged inaccurate or too broad (flagged as a real risk in the Boundary Research pass — "data" over-promises scope relative to the six-concept reality) | Low — a rename is mechanical (single package, no external consumers yet) | Medium (explicitly still an open, provisional decision) | Revisit naming once the package has shipped and its README makes the narrow scope self-evident to any reader — not blocking for this spec | Any point before the package's first external (framework-core) consumer lands |

---

## Decisions vs Open Questions

### Already decided (six approved research passes, unchanged by this spec)

Six-concept narrow scope (identity/equality, selection vocabulary, sort metadata, filter metadata simple shape, pagination state, virtualization windowing); hierarchical Tree-family exclusion; package boundary (new dedicated package, sibling to existing UIX packages, not an extension of `uix-utils`); public API shape (all ten exports, exact signatures); ownership split (pure primitives here, all state framework-owned); filter operator/constraints deferral (not rejection); confirmation that no additional primitive is needed before Table/DataView/Paginator consumption can begin.

### This spec's decisions

- Export structure: single flat barrel (matching `uix-styled`/`uix-motion`), not wildcard-subpath (`uix-utils`'s pattern) — package is too small and single-domain to warrant per-concept independent subpath versioning.
- Provenance manifest schema for this package uses a `verifiedAgainst` field (citing real-source verification basis) rather than the existing `originalPath`/`ultimateDestination` pair, since five of the six concepts are Ultimate-authored rather than directly copied from a single Prime file.
- `THIRD-PARTY-NOTICES.md` is not part of this package's deliverables (no single upstream package to attribute wholesale).
- New ADR-043 records the package's introduction and scope as a single decision record, matching the existing ADR log's granularity for a package-level architectural decision (comparable to ADR-036's escape/scroll-lock extraction).

### Open questions (requiring resolution during implementation or a later review)

- Final package name (`uix-data` remains provisional).
- Whether `vitest.config.ts` is shared at the workspace root or per-package (tooling detail, not architectural).
- Exact `verifiedAgainst` manifest field shape (may be refined during implementation without a new spec).

### Deferred decisions (explicitly postponed)

Filter `operator`/`constraints`/multi-constraint model (revisit against real Table implementation evidence); any hierarchical Tree-family shared contract (revisit only if future evidence establishes genuine shared semantics — currently verified absent); any broader selection-state/collection abstraction beyond `SelectionMode` (revisit only against real Table implementation evidence); sort-toggle/removable-sort behavior (fails the cross-framework-identity bar as currently verified — PrimeNG has no equivalent feature at all); page-link display math (a rendering concern, not a Data-semantics concern).

---

## Package Exit Criteria

`@ultimate/uix-data` is exited and ready for framework-core consumption when:

1. All Acceptance Criteria above are checked.
2. The package builds and passes tests independently from a clean `pnpm install --frozen-lockfile`.
3. `docs/architecture/PROVENANCE.md` has the new package-level entry, backed by `docs/architecture/provenance/uix-data.json`.
4. CI (`ci.yml`, unchanged pipeline) passes with all validators exercising this package's real content.
5. `docs/architecture/DECISIONS.md` records ADR-043.
6. A fresh spot-check confirms `packages/uix-data` has zero imports from any `packages/{ng,react,vue}*` package and zero runtime dependency beyond `@ultimate/uix-utils`.
7. Performance baseline numbers are recorded.

---

## Non-Goals (restated for implementation-plan authors)

Do not, in `uix-data` implementation:

- Build any part of Table, TreeTable, Tree, Scroller, Paginator, OrderList, PickList, DataView, TreeSelect, or OrganizationChart themselves.
- Add the filter `operator`/`constraints`/multi-constraint model.
- Add any hierarchical (Tree-family) identity, selection, or expansion type or function.
- Add any selection-state, selection-collection, or selection-event abstraction beyond the `SelectionMode` vocabulary type.
- Add a sort-toggle, removable-sort, or comparator-builder function.
- Add page-link display math, or any other rendering-support calculation.
- Add array-bounds clamping to `calculateLast`, or any function that requires live component state as an argument.
- Finalize the package name.
- Implement or wrap any framework-specific state (Angular signal, React `useState`, Vue `ref`) inside `uix-data` itself.
- Publish the package to npm.
