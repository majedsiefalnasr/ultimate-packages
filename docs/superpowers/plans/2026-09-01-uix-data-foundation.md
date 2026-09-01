# uix-data Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `@ultimate/uix-data`, a new framework-neutral package exposing exactly six approved Data primitives (identity/equality, selection vocabulary, sort metadata, filter metadata, pagination state, virtualization windowing) so future Table/DataView/Paginator/Scroller/OrderList/PickList work has a shared, evidence-verified foundation to build on.

**Architecture:** A single new package, `packages/uix-data`, sibling to `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`. One `equals` re-export from `@ultimate/uix-utils/object`; five new Ultimate-authored type/function modules organized in per-concept source folders, all re-exported through one flat `src/index.ts` barrel. Zero framework dependency, zero DOM dependency, zero mutable module-level state.

**Tech Stack:** TypeScript (strict, ES2022/ESNext/Bundler resolution, per `tsconfig.base.json`), tsup (ESM build + `.d.mts` declarations via the existing `rename-dts.mjs` pattern), Vitest (unit + type-only assertion tests), pnpm workspaces (auto-discovered via `packages/*`).

**Spec:** `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`

## Global Constraints

- Zero dependency on Angular, React, or Vue (enforced automatically by `scripts/provenance/validate-boundaries.mjs`, which scans any `packages/uix*`-prefixed directory).
- Only runtime dependency: `@ultimate/uix-utils` (workspace protocol), for `equals` only.
- No hierarchical (Tree-family) identity/selection/expansion semantics anywhere in this package.
- No selection state, collection, ownership, event, or controlled/uncontrolled abstraction — only the `SelectionMode` vocabulary type.
- No filter `operator`/`constraints`/multi-constraint model.
- No component logic, rendering, templating, framework lifecycle, or event-delivery mechanism.
- No page-link display math, sort-toggle/removable-sort behavior, live-state-coupled virtualization helpers beyond the two approved pure functions, or selection-toggle helper.
- Package name `@ultimate/uix-data` is provisional (matches directory name `packages/uix-data`) but is committed for this implementation, consistent with how Phase 1 committed its four package names despite Blueprint §34's general provisional-naming stance.
- Single flat barrel export (`.` only) — no wildcard-subpath exports map, matching `uix-styled`/`uix-motion`, not `uix-utils`.
- `sideEffects: false` — every export is a type or a pure function.
- Module format: ESM only, no CJS output.
- Test runner: Vitest, no jsdom needed (nothing in this package touches the DOM).

---

### Task 1: Package scaffold — `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`

**Files:**
- Create: `packages/uix-data/package.json`
- Create: `packages/uix-data/tsconfig.json`
- Create: `packages/uix-data/tsup.config.ts`
- Create: `packages/uix-data/vitest.config.ts`
- Create: `packages/uix-data/scripts/rename-dts.mjs`
- Create: `packages/uix-data/.gitignore`

**Interfaces:**
- Consumes: `@ultimate/uix-utils` (workspace dependency declared here, consumed for real in Task 3).
- Produces: a buildable, testable, empty package shell that later tasks add source to. No exports yet — `src/index.ts` does not exist until Task 8.

- [ ] **Step 1: Create the package directory and `package.json`**

```json
{
  "name": "@ultimate/uix-data",
  "version": "0.1.0",
  "description": "Framework-neutral pure types and pure functions for shared Data-component semantics (identity, selection vocabulary, sort metadata, filter metadata, pagination state, virtualization windowing) in the Ultimate Platform UI foundation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

Note: no `THIRD-PARTY-NOTICES.md` in `files` — per the spec, this package has no single upstream tarball license to carry (`equals` is already covered by `uix-utils`'s own notices; the other five modules are Ultimate-authored).

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `tsup.config.ts`**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

Note: `environment: "node"`, not `"jsdom"` — unlike `uix-motion`, nothing in `uix-data` touches the DOM.

- [ ] **Step 5: Create `scripts/rename-dts.mjs`** (identical to `uix-motion`'s, needed because tsup's `dts: true` emits `.d.ts` for a `"type": "module"` package instead of honoring `.d.mts`)

```javascript
#!/usr/bin/env node
// tsup's non-experimental `dts: true` generator does not honor a custom
// `outExtension().dts` when the package is already `"type": "module"`
// (it falls back to `.d.ts`, since `.ts` is unambiguous ESM in that case).
// Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
// after the build so they match this package's `.mjs` exports map.
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

function renameDtsToMts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameDtsToMts(fullPath);
    } else if (entry.name.endsWith(".d.ts.map")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts\.map$/, ".d.mts.map"));
    } else if (entry.name.endsWith(".d.ts")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts$/, ".d.mts"));
    }
  }
}

renameDtsToMts("dist");
```

- [ ] **Step 6: Create `.gitignore`**

```text
dist/
node_modules/
```

- [ ] **Step 7: Install workspace dependencies**

Run: `pnpm install` (from repo root)
Expected: pnpm links `@ultimate/uix-utils` into `packages/uix-data/node_modules` via the workspace protocol; no error. `pnpm-workspace.yaml`'s `packages/*` glob picks up the new directory automatically — no manual registration step.

- [ ] **Step 8: Commit**

```bash
git add packages/uix-data/package.json packages/uix-data/tsconfig.json packages/uix-data/tsup.config.ts packages/uix-data/vitest.config.ts packages/uix-data/scripts/rename-dts.mjs packages/uix-data/.gitignore pnpm-lock.yaml
git commit -m "chore(uix-data): scaffold package"
```

---

### Task 2: Identity module — re-export `equals`

**Files:**
- Create: `packages/uix-data/src/identity/index.ts`
- Test: `packages/uix-data/test/identity.test.ts`

**Interfaces:**
- Consumes: `equals` from `@ultimate/uix-utils/object` (existing, real signature: `equals(obj1: any, obj2: any, field?: string): boolean`).
- Produces: `equals` re-exported unchanged from `packages/uix-data/src/identity/index.ts`, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-data/test/identity.test.ts
import { describe, expect, it } from "vitest";
import { equals as equalsFromIdentity } from "../src/identity/index";
import { equals as equalsFromUixUtils } from "@ultimate/uix-utils/object";

describe("identity", () => {
  it("re-exports uix-utils's equals unchanged (reference-identical)", () => {
    expect(equalsFromIdentity).toBe(equalsFromUixUtils);
  });

  it("compares by deep equality when no field is given", () => {
    expect(equalsFromIdentity({ id: 1 }, { id: 1 })).toBe(true);
    expect(equalsFromIdentity({ id: 1 }, { id: 2 })).toBe(false);
  });

  it("compares by field path when a field is given", () => {
    const a = { id: 1, label: "A" };
    const b = { id: 1, label: "B" };
    expect(equalsFromIdentity(a, b, "id")).toBe(true);
    expect(equalsFromIdentity(a, b, "label")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: FAIL — `src/identity/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/identity/index.ts
export { equals } from "@ultimate/uix-utils/object";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: PASS — all 3 tests in `identity.test.ts` green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/identity packages/uix-data/test/identity.test.ts
git commit -m "feat(uix-data): re-export equals as identity primitive"
```

---

### Task 3: Selection module — `SelectionMode` type

**Files:**
- Create: `packages/uix-data/src/selection/index.ts`
- Test: `packages/uix-data/test/selection.test-d.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `SelectionMode` type, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing type test**

```typescript
// packages/uix-data/test/selection.test-d.ts
import { assertType, describe, it } from "vitest";
import type { SelectionMode } from "../src/selection/index";

describe("SelectionMode", () => {
  it("accepts 'single' and 'multiple'", () => {
    assertType<SelectionMode>("single");
    assertType<SelectionMode>("multiple");
  });

  it("rejects values outside the union", () => {
    // @ts-expect-error "none" is not a valid SelectionMode
    assertType<SelectionMode>("none");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-data run typecheck`
Expected: FAIL — `src/selection/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/selection/index.ts
/**
 * Selection-cardinality vocabulary, verified identical across Angular,
 * React, and Vue Table implementations. Carries no information about how
 * selection is stored, mutated, or communicated — that remains
 * framework-owned.
 */
export type SelectionMode = "single" | "multiple";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-data run typecheck && pnpm --filter @ultimate/uix-data test`
Expected: PASS — typecheck succeeds (including the `@ts-expect-error` line resolving as expected), Vitest's `typecheck.include` picks up `.test-d.ts` under Vitest 2's built-in type-testing support run via `vitest run --typecheck` (see Step 4a below if the default `vitest run` does not execute type tests).

- [ ] **Step 4a: If `.test-d.ts` is not picked up by default, add typecheck test config**

Modify `packages/uix-data/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: {
      include: ["test/**/*.test-d.ts"],
    },
  },
});
```

Run: `pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — 2 type tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/selection packages/uix-data/test/selection.test-d.ts packages/uix-data/vitest.config.ts
git commit -m "feat(uix-data): add SelectionMode vocabulary type"
```

---

### Task 4: Sort module — `SortMeta`, `SortMode`

**Files:**
- Create: `packages/uix-data/src/sort/index.ts`
- Test: `packages/uix-data/test/sort.test-d.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `SortMeta`, `SortMode`, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing type test**

```typescript
// packages/uix-data/test/sort.test-d.ts
import { assertType, describe, it } from "vitest";
import type { SortMeta, SortMode } from "../src/sort/index";

describe("SortMeta", () => {
  it("accepts field + order in {1, 0, -1}", () => {
    assertType<SortMeta>({ field: "name", order: 1 });
    assertType<SortMeta>({ field: "name", order: 0 });
    assertType<SortMeta>({ field: "name", order: -1 });
  });

  it("rejects an order outside {1, 0, -1}", () => {
    // @ts-expect-error order must be 1, 0, or -1
    assertType<SortMeta>({ field: "name", order: 2 });
  });

  it("rejects a missing field", () => {
    // @ts-expect-error field is required
    assertType<SortMeta>({ order: 1 });
  });
});

describe("SortMode", () => {
  it("accepts 'single' and 'multiple'", () => {
    assertType<SortMode>("single");
    assertType<SortMode>("multiple");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: FAIL — `src/sort/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/sort/index.ts
/**
 * Sort metadata shape, verified identical field names/types between
 * PrimeNG's SortMeta[] and PrimeReact's DataTableSortMeta. No comparator
 * function is included — sort execution is entangled with row-value
 * resolution in real Table source, not a genuinely shared standalone
 * primitive (see uix-data spec, Consumption-Readiness Research).
 */
export interface SortMeta {
  field: string;
  order: 1 | 0 | -1;
}

/**
 * Sort-cardinality vocabulary, verified identical across Angular, React,
 * and Vue Table implementations.
 */
export type SortMode = "single" | "multiple";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — 4 type tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/sort packages/uix-data/test/sort.test-d.ts
git commit -m "feat(uix-data): add SortMeta and SortMode types"
```

---

### Task 5: Filter module — `FilterMatchMode`, `FilterMetadata`

**Files:**
- Create: `packages/uix-data/src/filter/index.ts`
- Test: `packages/uix-data/test/filter.test-d.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `FilterMatchMode`, `FilterMetadata`, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing type test**

```typescript
// packages/uix-data/test/filter.test-d.ts
import { assertType, describe, it } from "vitest";
import type { FilterMatchMode, FilterMetadata } from "../src/filter/index";

describe("FilterMatchMode", () => {
  it("accepts every verified match mode", () => {
    const modes: FilterMatchMode[] = [
      "startsWith",
      "contains",
      "notContains",
      "endsWith",
      "equals",
      "notEquals",
      "in",
      "notIn",
      "lt",
      "lte",
      "gt",
      "gte",
      "between",
      "dateIs",
      "dateIsNot",
      "dateBefore",
      "dateAfter",
      "custom",
    ];
    assertType<FilterMatchMode[]>(modes);
  });

  it("rejects an unrecognized match mode", () => {
    // @ts-expect-error "fuzzyMatch" is not a verified FilterMatchMode
    assertType<FilterMatchMode>("fuzzyMatch");
  });
});

describe("FilterMetadata", () => {
  it("accepts value + matchMode, no operator/constraints", () => {
    assertType<FilterMetadata>({ value: "abc", matchMode: "contains" });
    assertType<FilterMetadata>({ value: 42, matchMode: "equals" });
  });

  it("rejects an operator/constraints shape (deferred, not part of this type)", () => {
    // @ts-expect-error operator/constraints are deferred, not part of FilterMetadata
    assertType<FilterMetadata>({ operator: "and", constraints: [] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: FAIL — `src/filter/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/filter/index.ts
/**
 * Filter match-mode vocabulary, verified as the common subset between
 * PrimeReact's DataTableFilterMetaData and PrimeNG's FilterMetadata.
 */
export type FilterMatchMode =
  | "startsWith"
  | "contains"
  | "notContains"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "between"
  | "dateIs"
  | "dateIsNot"
  | "dateBefore"
  | "dateAfter"
  | "custom";

/**
 * Simple (non-operator) filter metadata shape. The operator/constraints
 * variant (PrimeReact's DataTableOperatorFilterMetaData, PrimeNG's
 * FilterMetadata[]-as-array-of-alternatives) is deferred, not rejected —
 * revisit against real Table implementation requirements (see uix-data
 * spec, Approved Decision — Filter Contract).
 */
export interface FilterMetadata {
  value: unknown;
  matchMode: FilterMatchMode;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — 4 type tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/filter packages/uix-data/test/filter.test-d.ts
git commit -m "feat(uix-data): add FilterMatchMode and FilterMetadata types"
```

---

### Task 6: Pagination module — `PaginationState`, `getPageCount`

**Files:**
- Create: `packages/uix-data/src/pagination/index.ts`
- Test: `packages/uix-data/test/pagination.test.ts`
- Test: `packages/uix-data/test/pagination.test-d.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PaginationState`, `getPageCount(totalRecords: number, rows: number): number`, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/uix-data/test/pagination.test.ts
import { describe, expect, it } from "vitest";
import { getPageCount } from "../src/pagination/index";

describe("getPageCount", () => {
  it("computes the ceiling page count for evenly divisible input", () => {
    expect(getPageCount(100, 10)).toBe(10);
  });

  it("computes the ceiling page count for non-evenly-divisible input", () => {
    expect(getPageCount(101, 10)).toBe(11);
  });

  it("returns 0 when totalRecords is 0", () => {
    expect(getPageCount(0, 10)).toBe(0);
  });

  it("returns 0 when rows is 0 (zero-guard, Prime's own inline calculation lacks this)", () => {
    expect(getPageCount(100, 0)).toBe(0);
  });
});
```

```typescript
// packages/uix-data/test/pagination.test-d.ts
import { assertType, describe, it } from "vitest";
import type { PaginationState } from "../src/pagination/index";

describe("PaginationState", () => {
  it("accepts the full shape including optional rowsPerPageOptions", () => {
    assertType<PaginationState>({ first: 0, rows: 10, totalRecords: 100 });
    assertType<PaginationState>({
      first: 0,
      rows: 10,
      totalRecords: 100,
      rowsPerPageOptions: [10, 25, 50],
    });
  });

  it("rejects a missing required field", () => {
    // @ts-expect-error totalRecords is required
    assertType<PaginationState>({ first: 0, rows: 10 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/uix-data test && pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: FAIL — `src/pagination/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/pagination/index.ts
/**
 * Pagination state shape, verified against PrimeNG's real Paginator
 * fields (first, rows, totalRecords, rowsPerPageOptions). rowsPerPageOptions
 * is carried as pass-through configuration for framework-native rendering
 * (the page-size dropdown) — no function in this package reads it.
 */
export interface PaginationState {
  first: number;
  rows: number;
  totalRecords: number;
  rowsPerPageOptions?: number[];
}

/**
 * Total page count for a given record count and page size. Verified as a
 * real one-line calculation in PrimeNG's paginator.ts (never itself
 * exported even by Prime), with a zero-guard added — Prime's own inline
 * version does not guard against rows === 0, which would otherwise
 * produce Infinity/NaN once centralized as a standalone function.
 */
export function getPageCount(totalRecords: number, rows: number): number {
  return rows > 0 ? Math.ceil(totalRecords / rows) : 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/uix-data test && pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — 4 unit tests and 2 type tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/pagination packages/uix-data/test/pagination.test.ts packages/uix-data/test/pagination.test-d.ts
git commit -m "feat(uix-data): add PaginationState type and getPageCount function"
```

---

### Task 7: Virtualization module — `calculateNumItemsInViewport`, `calculateLast`

**Files:**
- Create: `packages/uix-data/src/virtualization/index.ts`
- Test: `packages/uix-data/test/virtualization.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `calculateNumItemsInViewport(contentSize: number, itemSize: number): number`, `calculateLast(first: number, numItemsInViewport: number, numToleratedItems: number, isColumns?: boolean): number`, consumed by Task 8's barrel.

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/uix-data/test/virtualization.test.ts
import { describe, expect, it } from "vitest";
import { calculateLast, calculateNumItemsInViewport } from "../src/virtualization/index";

describe("calculateNumItemsInViewport", () => {
  it("computes the ceiling item count for normal input", () => {
    expect(calculateNumItemsInViewport(500, 50)).toBe(10);
  });

  it("computes the ceiling item count when itemSize does not evenly divide contentSize", () => {
    expect(calculateNumItemsInViewport(505, 50)).toBe(11);
  });

  it("falls back to a single item when itemSize is 0 but contentSize is nonzero", () => {
    expect(calculateNumItemsInViewport(500, 0)).toBe(1);
  });

  it("returns 0 when both contentSize and itemSize are 0 (Angular's safer zero-guard; React/Vue's real source would produce NaN here)", () => {
    expect(calculateNumItemsInViewport(0, 0)).toBe(0);
  });
});

describe("calculateLast", () => {
  it("uses a 2x tolerance buffer when first is below numToleratedItems", () => {
    // first=1, numItemsInViewport=10, numToleratedItems=5 -> 1 + 10 + 2*5 = 21
    expect(calculateLast(1, 10, 5)).toBe(21);
  });

  it("uses a 3x tolerance buffer when first is at or above numToleratedItems", () => {
    // first=5, numItemsInViewport=10, numToleratedItems=5 -> 5 + 10 + 3*5 = 30
    expect(calculateLast(5, 10, 5)).toBe(30);
  });

  it("accepts the isColumns parameter without affecting the pure offset math (no array-bounds clamping is performed here)", () => {
    expect(calculateLast(1, 10, 5, true)).toBe(21);
    expect(calculateLast(1, 10, 5, false)).toBe(21);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: FAIL — `src/virtualization/index.ts` does not exist (module not found).

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/uix-data/src/virtualization/index.ts
/**
 * Number of items that fit in a viewport of the given size. Verified as
 * shared tolerance-buffered windowing math across PrimeNG, PrimeReact,
 * and PrimeVue's real Scroller/VirtualScroller source, with one
 * correction: this adopts Angular's real zero-guard
 * (`itemSize || contentSize`), which PrimeReact's and PrimeVue's real
 * implementations lack — their unguarded form would divide 0/0 and
 * return NaN when both arguments are 0.
 */
export function calculateNumItemsInViewport(contentSize: number, itemSize: number): number {
  return itemSize || contentSize ? Math.ceil(contentSize / (itemSize || contentSize)) : 0;
}

/**
 * Tolerance-buffered last-index offset for virtualized scrolling. Verified
 * as pure math (no array access, no DOM) at real Prime Scroller call
 * sites; callers must separately clamp the result against their own live
 * collection length — that clamp requires live state and is intentionally
 * excluded from this function.
 */
export function calculateLast(
  first: number,
  numItemsInViewport: number,
  numToleratedItems: number,
  isColumns?: boolean
): number {
  void isColumns;
  return first + numItemsInViewport + (first < numToleratedItems ? 2 : 3) * numToleratedItems;
}
```

Note: `isColumns` is accepted (matching the verified real upstream signature callers will expect) but intentionally unused by this pure function's own math — `void isColumns;` documents that it is accepted for signature parity, not silently dropped by accident, without triggering a `noUnusedParameters` lint/typecheck failure.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: PASS — 4 + 3 = 7 unit tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/uix-data/src/virtualization packages/uix-data/test/virtualization.test.ts
git commit -m "feat(uix-data): add calculateNumItemsInViewport and calculateLast functions"
```

---

### Task 8: Public barrel, package export test, and typecheck/build verification

**Files:**
- Create: `packages/uix-data/src/index.ts`
- Test: `packages/uix-data/test/package-exports.test.ts`

**Interfaces:**
- Consumes: `equals` (Task 2), `SelectionMode` (Task 3), `SortMeta`/`SortMode` (Task 4), `FilterMatchMode`/`FilterMetadata` (Task 5), `PaginationState`/`getPageCount` (Task 6), `calculateNumItemsInViewport`/`calculateLast` (Task 7).
- Produces: the complete public API of `@ultimate/uix-data`, re-exported from one flat barrel — this is what `ng-core`/`react-core`/`vue-core` will import from in future work (not part of this plan).

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-data/test/package-exports.test.ts
import { describe, expect, it } from "vitest";
import * as uixData from "../src/index";

describe("public barrel", () => {
  it("exports equals", () => {
    expect(typeof uixData.equals).toBe("function");
  });

  it("exports getPageCount", () => {
    expect(typeof uixData.getPageCount).toBe("function");
  });

  it("exports calculateNumItemsInViewport", () => {
    expect(typeof uixData.calculateNumItemsInViewport).toBe("function");
  });

  it("exports calculateLast", () => {
    expect(typeof uixData.calculateLast).toBe("function");
  });

  it("exports exactly the approved runtime surface (no accidental extra exports)", () => {
    const runtimeExportNames = Object.keys(uixData).sort();
    expect(runtimeExportNames).toEqual(
      ["calculateLast", "calculateNumItemsInViewport", "equals", "getPageCount"].sort()
    );
  });
});
```

Note: `SelectionMode`, `SortMeta`, `SortMode`, `FilterMatchMode`, `FilterMetadata`, `PaginationState` are type-only exports and do not appear in `Object.keys()` at runtime — the last assertion intentionally lists only the four runtime (function) exports, so it fails loudly if a future edit accidentally adds an unapproved runtime export to the barrel.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: FAIL — `src/index.ts` does not exist (module not found).

- [ ] **Step 3: Write the barrel**

```typescript
// packages/uix-data/src/index.ts
export { equals } from "./identity/index";
export type { SelectionMode } from "./selection/index";
export type { SortMeta, SortMode } from "./sort/index";
export type { FilterMatchMode, FilterMetadata } from "./filter/index";
export { getPageCount } from "./pagination/index";
export type { PaginationState } from "./pagination/index";
export { calculateLast, calculateNumItemsInViewport } from "./virtualization/index";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-data test`
Expected: PASS — all 5 assertions in `package-exports.test.ts` green, plus every prior task's test file still green (run the full suite: `pnpm --filter @ultimate/uix-data test` runs all `test/**/*.test.ts` files).

- [ ] **Step 5: Run the full test suite including type tests**

Run: `pnpm --filter @ultimate/uix-data test && pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — every unit test (identity, pagination, virtualization, package-exports: 4+4+7+5 = 20 tests) and every type test (selection, sort, filter, pagination: 2+4+4+2 = 12 type assertions) green.

- [ ] **Step 6: Run typecheck**

Run: `pnpm --filter @ultimate/uix-data run typecheck`
Expected: PASS — `tsc --noEmit` succeeds with zero errors.

- [ ] **Step 7: Run the build**

Run: `pnpm --filter @ultimate/uix-data run build`
Expected: PASS — `dist/index.mjs`, `dist/index.d.mts`, `dist/index.mjs.map`, `dist/index.d.mts.map` are produced; `rename-dts.mjs` runs with no error (confirm no leftover `dist/index.d.ts` file).

Run: `ls packages/uix-data/dist/`
Expected: exactly `index.mjs`, `index.mjs.map`, `index.d.mts`, `index.d.mts.map` (no `.d.ts` file).

- [ ] **Step 8: Commit**

```bash
git add packages/uix-data/src/index.ts packages/uix-data/test/package-exports.test.ts
git commit -m "feat(uix-data): add public barrel exporting the approved six-concept API"
```

---

### Task 9: Repo-wide validator checks (boundary, ceiling, provenance gate)

**Files:**
- No new files — this task runs existing repo-wide validators against the new package and fixes anything they flag.

**Interfaces:**
- Consumes: the complete `packages/uix-data/src/` tree from Tasks 1–8.
- Produces: confirmation that `packages/uix-data` passes every existing CI validator with zero script changes, as the spec claims.

- [ ] **Step 1: Run the boundary validator**

Run: `node scripts/provenance/validate-boundaries.mjs`
Expected: PASS — output includes a line confirming `packages/uix-data` (or all `packages/uix*`) scanned with zero framework imports found. If it fails, inspect the reported file — `uix-data` must never import `@angular/*`, `react`, `react-dom`, or `vue`; nothing in Tasks 1–8 does, so this should pass without changes.

- [ ] **Step 2: Run the dependency-ceiling validator**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: PASS — `packages/uix-data/package.json` is scanned automatically (its name starts with `uix`, already in `WATCHED_PREFIXES`) and found to declare no `@primeuix/*`/Prime runtime dependency (only `@ultimate/uix-utils`, which is not watched as a ceiling violation).

- [ ] **Step 3: Attempt the provenance validator (expected to fail until Task 10)**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected: FAIL — `packages/uix-data has source files but no manifest at docs/architecture/provenance/uix-data.json` (per the validator's `MANIFEST_WATCHED_PREFIXES` including `uix`, and `packages/uix-data/src` now containing `.ts` files from Tasks 1–8). This confirms the validator correctly detects the new package; Task 10 resolves it.

- [ ] **Step 4: No commit for this task** — it is a verification checkpoint only; proceed directly to Task 10, which produces the fix.

---

### Task 10: Provenance manifest and `PROVENANCE.md` entry

**Files:**
- Create: `docs/architecture/provenance/uix-data.json`
- Modify: `docs/architecture/PROVENANCE.md`

**Interfaces:**
- Consumes: the file list from `packages/uix-data/src/` (7 files: `identity/index.ts`, `selection/index.ts`, `sort/index.ts`, `filter/index.ts`, `pagination/index.ts`, `virtualization/index.ts`, `index.ts`).
- Produces: a manifest satisfying `validate-provenance.mjs`'s real requirement — every entry must have an `ultimateDestination` field whose value exactly matches a real `packages/uix-data/src/**/*.ts` file path (verified by reading the validator's source directly: `manifest.map((entry) => entry.ultimateDestination)` against `walkTsFiles(...)`'s output).

- [ ] **Step 1: List the exact files that need manifest entries**

Run: `find packages/uix-data/src -name "*.ts"`
Expected output (7 lines, exact paths will be used verbatim in Step 2):
```text
packages/uix-data/src/identity/index.ts
packages/uix-data/src/selection/index.ts
packages/uix-data/src/sort/index.ts
packages/uix-data/src/filter/index.ts
packages/uix-data/src/pagination/index.ts
packages/uix-data/src/virtualization/index.ts
packages/uix-data/src/index.ts
```

- [ ] **Step 2: Create the manifest**

Per the spec's Provenance Requirements, this package has mixed provenance (one re-export of already-attributed `uix-utils` code, five Ultimate-authored-but-evidence-verified modules) — each entry includes the required `ultimateDestination` field (for `validate-provenance.mjs`) plus a `verifiedAgainst` field documenting which real, pinned-version Prime source established the cross-framework equivalence (per the six approved research passes), since no single Prime file is the direct copy-source for any of these five modules.

```json
[
  {
    "ultimateDestination": "packages/uix-data/src/identity/index.ts",
    "modificationStatus": "re-export",
    "modificationDescription": "Re-exports @ultimate/uix-utils/object's existing equals function unchanged. No new implementation. Provenance for equals itself is tracked in docs/architecture/provenance/uix-utils.json.",
    "verifiedAgainst": []
  },
  {
    "ultimateDestination": "packages/uix-data/src/selection/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "SelectionMode union type, authored by Ultimate, informed by verified cross-framework equivalence of Table's selectionMode prop.",
    "verifiedAgainst": [
      "PrimeNG 21.1.9 (commit c493b1c6d9f7cdffbe1c4dc195493dd73d733593): ng-table/table.ts, selectionMode input",
      "PrimeReact 10.9.9 (commit d0f574e39122668292fc7a740f081bae1b93b1e9): react-datatable/datatable.d.ts, selectionMode field",
      "PrimeVue 4.5.5 (commit 66dde6788220fc9e6822342919d1ceb0e3460ece): DataTable selectionMode prop"
    ]
  },
  {
    "ultimateDestination": "packages/uix-data/src/sort/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "SortMeta and SortMode types, authored by Ultimate, informed by verified identical field names/types across PrimeNG's SortMeta[] and PrimeReact's DataTableSortMeta. No comparator function included (verified not genuinely shared standalone in real source).",
    "verifiedAgainst": [
      "PrimeNG 21.1.9: ng-table/table.ts:810, multiSortMeta: SortMeta[] input",
      "PrimeReact 10.9.9: react-datatable/datatable.d.ts:72, DataTableSortMeta interface"
    ]
  },
  {
    "ultimateDestination": "packages/uix-data/src/filter/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "FilterMatchMode and FilterMetadata (simple, non-operator shape only) types, authored by Ultimate, informed by the verified common subset of PrimeReact's DataTableFilterMetaData and PrimeNG's FilterMetadata. Operator/constraints variant explicitly deferred, not included.",
    "verifiedAgainst": [
      "PrimeNG 21.1.9: ng-table/table.ts:553, filters input",
      "PrimeReact 10.9.9: react-datatable/datatable.d.ts:86-108, DataTableFilterMetaData/DataTableOperatorFilterMetaData/DataTableFilterMeta interfaces"
    ]
  },
  {
    "ultimateDestination": "packages/uix-data/src/pagination/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "PaginationState type and getPageCount function, authored by Ultimate. PaginationState field shape verified against PrimeNG's real Paginator fields. getPageCount's formula verified as a real (Prime-internal-only, never previously exported) one-line calculation in PrimeNG's paginator.ts, with a zero-guard added that Prime's own inline version lacks.",
    "verifiedAgainst": [
      "PrimeNG 21.1.9: ng-paginator/paginator.ts:460-461, totalRecords/rows/rowsPerPageOptions fields and inline page-count calculation"
    ]
  },
  {
    "ultimateDestination": "packages/uix-data/src/virtualization/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "calculateNumItemsInViewport and calculateLast functions, authored by Ultimate, informed by verified tolerance-buffered windowing math present with the same formula across all three frameworks' real Scroller/VirtualScroller source. calculateNumItemsInViewport adopts Angular's real zero-guard, which PrimeReact's and PrimeVue's real implementations verifiably lack. calculateLast omits the separate array-bounds-clamping step performed at real Prime call sites, since that step requires live component state.",
    "verifiedAgainst": [
      "PrimeNG 21.1.9: ng-scroller (Scroller component), calculateNumItemsInViewport and calculateLast",
      "PrimeReact 10.9.9: VirtualScroller.js, calculateNumItemsInViewport (unguarded 0/0 case)",
      "PrimeVue 4.5.5: VirtualScroller.vue, calculateNumItemsInViewport (unguarded 0/0 case)"
    ]
  },
  {
    "ultimateDestination": "packages/uix-data/src/index.ts",
    "modificationStatus": "ultimate-authored",
    "modificationDescription": "Public barrel re-exporting the six approved concepts from their per-concept modules. No independent logic.",
    "verifiedAgainst": []
  }
]
```

- [ ] **Step 2: Add the `@ultimate/uix-data` entry to `PROVENANCE.md`**

Add a new top-level section (after the existing `@primeuix/themes` section, before the closing `---` divider and the "Excluded from Phase 0 core" note) in `docs/architecture/PROVENANCE.md`:

```markdown
## @ultimate/uix-data

- **Source repository:** none — no single upstream package. Mixed provenance: one function re-exported from an existing Ultimate package, five modules authored by Ultimate and verified against real pinned Prime source.
- **Source package:** n/a
- **Source version:** n/a
- **Ultimate destination:** `packages/uix-data`
- **Modification status:** incorporated — `equals` is re-exported unchanged from `@ultimate/uix-utils/object` (see that package's own `PROVENANCE.md` entry and `docs/architecture/provenance/uix-utils.json` for its provenance). The remaining five modules (`SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`) are Ultimate-authored, each verified against real pinned PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5 source per the approved architecture research (six research passes; see `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md` Context section for the full research trail). File-level verification basis: `docs/architecture/provenance/uix-data.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-data.json` for the specific real-source evidence backing each module.
- **Date incorporated:** 2026-09-01
```

- [ ] **Step 3: Run the provenance validator to verify it now passes**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected: PASS — output includes `uix-data: all 7 source file(s) have manifest entries`, and the required-headings check still passes (the new `@ultimate/uix-data` heading is additive; `REQUIRED_HEADINGS` does not require it, it does not need to be in that list).

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/provenance/uix-data.json docs/architecture/PROVENANCE.md
git commit -m "docs(provenance): add uix-data manifest and PROVENANCE.md entry"
```

---

### Task 11: ADR-043 and README

**Files:**
- Modify: `docs/architecture/DECISIONS.md`
- Create: `packages/uix-data/README.md`

**Interfaces:**
- Consumes: nothing new — this task documents Tasks 1–10's completed work.
- Produces: a recorded architecture decision and a package README, both required by the spec's Acceptance Criteria.

- [ ] **Step 1: Add ADR-043 to `docs/architecture/DECISIONS.md`**

Append after ADR-042 (matching the existing `## ADR-NNN — Title` heading format and single-paragraph "Status: Accepted..." body style used by every entry from ADR-033 onward):

```markdown
## ADR-043 — `@ultimate/uix-data` introduced as a narrow, evidence-verified shared Data foundation

Status: Accepted (uix-data spec, confirmed by implementation). Six sequential architecture research passes, each verified against real pinned PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5 source, established that a shared framework-neutral Data contract is supported by evidence only for a narrow set of concepts — not a universal Data-component abstraction. `@ultimate/uix-data` (package name provisional) was created as a new dedicated package, sibling to `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`, exposing exactly six items: `equals` (re-exported unchanged from `@ultimate/uix-utils/object`, per the same "verify zero load-bearing framework coupling, then centralize" pattern established by ADR-036), `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata` (simple non-operator shape only — the operator/constraints variant is verifiably real but differently normalized between PrimeReact and PrimeNG, and is deferred until real `Table` implementation evidence justifies it), `PaginationState`/`getPageCount`, and `calculateNumItemsInViewport`/`calculateLast` (the latter adopting Angular's verified real zero-guard, which PrimeReact's and PrimeVue's real implementations lack and would otherwise divide `0/0` into `NaN`). Hierarchical (Tree-family: Tree/TreeTable/TreeSelect/OrganizationChart) identity/selection/expansion was verified structurally incompatible across frameworks — PrimeNG mutates `TreeNode` object references in place, while PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps — and is explicitly excluded from any shared contract, remaining framework-native unless future evidence establishes genuine shared semantics. A final consumption-readiness pass, simulating real usage against actual Prime call sites, confirmed no additional primitive was needed: candidates including a sort-toggle cycle (verified present in React/Vue's real source but entirely absent from Angular's), page-link display math (verified identical across all three but classified as a rendering concern), and live-state-coupled virtualization helpers (`calculateFirst` family, called with 5-7 mutable instance fields in real source) were each investigated and rejected as either failing the cross-framework-identity bar or smuggling framework-owned state into a package that must remain pure.
```

- [ ] **Step 2: Create `packages/uix-data/README.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/DECISIONS.md packages/uix-data/README.md
git commit -m "docs(uix-data): record ADR-043 and add package README"
```

---

### Task 12: Performance baseline

**Files:**
- Modify: `docs/architecture/PERFORMANCE.md`

**Interfaces:**
- Consumes: the built `packages/uix-data/dist/` output from Task 8.
- Produces: recorded size numbers, satisfying the spec's Performance Requirements and Acceptance Criteria.

- [ ] **Step 1: Run the existing measurement script**

`scripts/provenance/measure-package-size.mjs` already discovers every package under `packages/` whose name starts with `uix` or `ng` (its `PACKAGE_PREFIXES = ["uix", "ng"]` constant) and reports dist size, gzip size, and file count for each — `packages/uix-data` is picked up automatically, no script change needed.

Run: `node scripts/provenance/measure-package-size.mjs`
Expected: output includes a `packages/uix-data` row alongside the existing `uix-motion`/`uix-styled`/`uix-styles`/`uix-utils`/`ng`/`ng-core` rows, with a real dist size, file count, and gzip size for `index.mjs` (record the exact numbers returned — do not fabricate them).

- [ ] **Step 2: Add the `uix-data` row to `docs/architecture/PERFORMANCE.md`**

Read the existing file's "Package size" table under the "Phase 1" heading (the four existing `uix-*` rows use the format `| packages/<name> | <dist size> | <file count> | <gzip size> |`) and add a `packages/uix-data` row to that same table using the same format and the real numbers from Step 1. If the maintainers prefer `uix-data` under its own heading (since it postdates Phase 1) rather than appended to the Phase 1 table, add a new `## uix-data` section immediately after the existing `## Phase 2 — UltimateNG` section (or after whichever section is currently last in the file — check with `grep -n "^## " docs/architecture/PERFORMANCE.md` first), following the same table format and including the same "Measured with `node scripts/provenance/measure-package-size.mjs` against a fresh `pnpm run build` (Node `<version>`, pnpm `<version>`)" attribution line as the existing sections (get the real Node/pnpm versions via `node --version` and `pnpm --version`).

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/PERFORMANCE.md
git commit -m "docs(uix-data): record performance baseline"
```

---

### Task 13: Full verification pass and manual boundary spot-check

**Files:**
- No new files — this is the plan's final verification gate.

**Interfaces:**
- Consumes: everything from Tasks 1–12.
- Produces: confirmation that every Acceptance Criterion in the spec is met.

- [ ] **Step 1: Clean install and build from scratch**

Run: `rm -rf packages/uix-data/node_modules packages/uix-data/dist && pnpm install --frozen-lockfile && pnpm --filter @ultimate/uix-data run build`
Expected: PASS — clean build succeeds with no error.

- [ ] **Step 2: Run the full test suite**

Run: `pnpm --filter @ultimate/uix-data test && pnpm --filter @ultimate/uix-data exec vitest run --typecheck`
Expected: PASS — 20 unit tests, 12 type-test assertions, all green.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @ultimate/uix-data run typecheck`
Expected: PASS — zero errors.

- [ ] **Step 4: Run all three provenance/boundary validators**

Run: `node scripts/provenance/validate-boundaries.mjs && node scripts/provenance/validate-dependency-ceiling.mjs && node scripts/provenance/validate-provenance.mjs`
Expected: PASS — all three exit 0.

- [ ] **Step 5: Manual boundary spot-check**

Run: `grep -rE "from [\"']@?(angular|react|vue)" packages/uix-data/src/ ; grep -rE "packages/(ng|react|vue)" packages/uix-data/src/`
Expected: no output (zero matches) — confirms zero framework imports and zero reverse-dependency reference anywhere in `uix-data`'s source.

Run: `grep -n "uix-data" packages/ng-core/package.json packages/react-core/package.json packages/vue-core/package.json 2>/dev/null`
Expected: no output — confirms `uix-data` has no consumer yet (correct: this plan builds the package only, framework-core consumption is future work, explicitly out of this plan's scope per the spec's Non-Goals).

- [ ] **Step 6: Confirm every spec Acceptance Criterion**

Walk `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`'s Acceptance Criteria list top to bottom and confirm each is satisfied by Tasks 1-12's output (build passes: Task 1/8/13; export resolves: Task 8; boundary/ceiling/provenance validators pass: Task 9/10/13; Vitest suites pass: Task 13 Step 2; `equals` reference-identity: Task 2; `calculateNumItemsInViewport` zero-guard test: Task 7; README exists: Task 11; ADR-043 recorded: Task 11; no reverse-dependency import: Task 13 Step 5).

- [ ] **Step 7: No commit for this task** — it is a verification-only gate. If any step fails, return to the relevant earlier task, fix, and re-run this task's steps from the top.

---

## Self-Review Notes

- **Spec coverage:** every section of the spec (Package Scope, Ownership Boundaries, Dependency Rules, Export Structure, Function/Type Semantics, Naming Conventions, Testing Requirements, Provenance Requirements, Documentation Requirements, Security/Performance Requirements, Deliverables, Acceptance Criteria) maps to a task above (Tasks 1, 2-7, 9, 8, 2-7, 11, 8/13, 9-10, 11, 12, Deliverables list matches Tasks 1/8/10/11/12 outputs, Acceptance Criteria walked explicitly in Task 13 Step 6).
- **Placeholder scan:** no "TBD"/"handle edge cases"/"similar to Task N" patterns — every step has literal code, exact commands, and exact expected output. Task 12's exact byte counts are intentionally left to be filled with real measured numbers at execution time (the spec's Performance Requirements explicitly forbid fabricating numbers ahead of measurement), not a plan placeholder.
- **Type consistency:** `equals(obj1: any, obj2: any, field?: string): boolean` (Task 2), `SelectionMode = "single" | "multiple"` (Task 3), `SortMeta{field: string; order: 1|0|-1}`/`SortMode` (Task 4), `FilterMatchMode`/`FilterMetadata{value: unknown; matchMode: FilterMatchMode}` (Task 5), `PaginationState{first,rows,totalRecords,rowsPerPageOptions?}`/`getPageCount(totalRecords: number, rows: number): number` (Task 6), `calculateNumItemsInViewport(contentSize: number, itemSize: number): number`/`calculateLast(first: number, numItemsInViewport: number, numToleratedItems: number, isColumns?: boolean): number` (Task 7) are used identically in Task 8's barrel and Task 9-13's verification steps — no drift.
