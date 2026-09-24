# Table Filter Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (execution approach fixed by Plan Review — see below). Steps use checkbox (`- [ ]`) syntax for tracking.

**Execution approach:** Subagent-driven development. A fresh implementer/reviewer cycle runs per task, followed by the existing whole-branch review and Final Review/Closeout. Chosen because the code additions are mechanically simple but the primary risk is semantic drift across three independently implemented filter dispatches — a fresh reviewer per task catches a wrong boolean or an accidentally-harmonized edge case before it compounds across tasks.

**Goal:** Add the 14 remaining `FilterMatchMode` comparator cases (`notContains`, `endsWith`, `notEquals`, `lt`, `lte`, `gt`, `gte`, `between`, `in`, `notIn`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`) plus the `custom` extension mode to each framework's existing Table `matchesFilter` dispatch — Angular, React, and Vue — closing DECISION-C's last live remainder.

**Architecture:** Ordinary framework-local extension of an existing `switch` statement in each of the 3 already-shipped `matchesFilter` functions. No new files, no new shared package, no change to `@ultimate/uix-data`. Angular additionally gains a Table-scoped `custom`-predicate registration surface satisfying the Spec's binding consumer-facing contract (§3.4.1); React and Vue's `custom` mode is proven to have no executable registration path.

**Tech Stack:** TypeScript, Angular (signals, standalone components), React (hooks), Vue 3 (Options API via `createBaseTable`), Vitest for all 3 frameworks' unit tests, `@testing-library/react` for React DOM assertions, `@vue/test-utils` for Vue.

**Spec:** `docs/superpowers/specs/2026-09-23-table-filter-vocabulary-design.md` (evidence-corrected 2026-09-23: Vue's real `notEquals` absent/empty-filter default is `false`, matching Angular, not `true` as an earlier draft misreported — see Spec §3.3's own correction note).

## Global Constraints

- No change to `packages/uix-data/src/filter/index.ts` — `FilterMatchMode`/`FilterMetadata` are already correct and complete (Spec §1, §5 item 2). `FilterMetadata` has exactly two fields, `value` and `matchMode` — it carries no `filterLocale` field, and no task in this plan adds one.
- No new shared comparator service, match-mode registry, or file — every task modifies one of the 3 existing `matchesFilter` locations only (Spec §5 item 1).
- No forced API-shape parity across frameworks — `notEquals`'s absent/empty-filter default (Angular `false`; Vue `false`; React `true` — re-verified directly against pinned Prime source this Plan Review) and `custom`'s Angular-only support are real, verified divergences and must not be harmonized (Spec §3.3, §3.4, §5 item 3, §7).
- `notEquals`'s "absent" condition covers `undefined`, `null`, **and an empty or whitespace-only string** — this is the real, verified Prime-source condition in all 3 frameworks (Angular/React trim before checking emptiness; Vue checks literal `''` without trimming), not an invented broadening. No task may narrow this to only `undefined`/`null`.
- Date comparators: Vue coerces string-typed operands via `new Date(...)`; Angular/React assume `Date` instances only and must not add coercion (Spec §3.3, §7).
- `in`/`notIn` membership must use `equals` (2-arg form) re-exported from `@ultimate/uix-utils/object` via `@ultimate/uix-data` — already imported in all 3 Table files for other purposes, not `===` (Spec §3.1, §3.3, §6).
- Angular's `custom` registration surface must be Table-scoped (per-`UTable`-instance), not a global/application-wide singleton registry (Spec §3.4.1).
- Angular's `custom` predicate callback signature is exactly `(value: unknown, filter: unknown, filterLocale?: string) => boolean` (Spec §3.4.1). Because `FilterMetadata` has no `filterLocale` field (see above) and Table has no `filterLocale` input of its own, no real locale value exists anywhere in Table's current data flow to thread through — the predicate is invoked with `filterLocale` explicitly `undefined`, not omitted (the call site passes three arguments; the third is `undefined`). This is a genuine implementation-time finding, not an invented value — Task 4 records it as a `NEEDS IMPLEMENTATION-TIME VERIFICATION` note for a future task that introduces a real Table-level locale input, matching this codebase's own established convention for recording scope gaps discovered during implementation.
- An unregistered Angular `custom` mode must resolve to `false` (matches nothing) — not the `default: return true` pass-through used for genuinely unhandled mode names (Spec §3.4.1).
- Duplicate Angular `custom` registration (same key, same Table instance) replaces the previous predicate — no error, no warning (Spec §3.4.1).
- React and Vue must introduce zero new public surface (no new prop, no new exported function, no new module-level mutable object) for `custom` (Spec §3.4.2). No task may add a structural/reflection-based test asserting this absence over an unrelated local object — the behavioral test (a `custom` filter never matches) is the sole binding proof; a genuine compile-time type check is acceptable only if it inspects `UTableProps`/the component's own real prop type directly, never a hand-written stand-in object.
- All 14 comparator modes named in Spec §1 must each receive at least one direct assertion using that literal `matchMode` string, in each framework's own test file — grouped/representative tests are acceptable in structure, but no mode name may be exercised only incidentally or omitted (Spec §9).
- Full existing Table test suite (all pre-existing tests in each framework's `table.spec.ts`/`table.spec.tsx`) must stay green after every task — this plan adds tests, it does not modify any pre-existing test's assertions (Spec §9 item 4).
- Full monorepo test suite (`pnpm test`) must stay green after every implementation task (Tasks 1-6), each verified by its own explicit step — not deferred to Task 7 alone (Spec §9 item 5).
- `validate-dependency-ceiling.mjs` must pass after every task, run and reported, not assumed (Spec §9 item 6) — this is a regression check since no new dependency is introduced.
- TreeTable's status is unaffected by this plan — no task reads, tests, or reasons about Tree/TreeTable/TreeSelect/Angular OrganizationChart source (Spec §1, §5 item 6, DECISION-D).

## Review Focus

- **A row whose field value is `undefined`/missing entirely** (not merely `null`) filtered with `lt`/`lte`/`gt`/`gte`/`between` — the Spec's edge-case table (§3.3) states a `null`/`undefined` row value fails the comparison once a real filter value is present; a reasonable person filtering a sparse dataset expects rows missing the filtered field to be excluded, not to throw or to silently match.
- **`in`/`notIn` with a filter array containing `null`/`undefined` entries mixed with real values** — the Spec's `equals`-based membership requirement (§3.1, §3.3) says nothing about a filter array itself containing null members; a reasonable person expects `equals(rowValue, null)` to behave the same deterministic way `equals` behaves anywhere else in this codebase (matching only if the row value is also nullish), not a special-cased skip that silently drops that array entry from consideration.
- **`between` with `filter[0] > filter[1]` (an inverted/malformed range)** — the Spec documents the inclusive-bounds check (`low <= value && value <= high`) but not what happens when the caller supplies `low > high`; a reasonable person supplying a malformed range expects a well-defined outcome (here: the comparison is simply never satisfiable, since no value can be both `>= low` and `<= high` when `low > high`) rather than an exception or an accidental "matches everything" default.
- **Angular `custom` predicate that throws** — the Spec's callback contract (§3.4.1) specifies the predicate's input/output shape but not what happens if a registered predicate itself throws during filtering; a reasonable person registering a buggy predicate expects the error to surface clearly (propagate, so it's visible during development) rather than being silently swallowed and treated as `false`/`true` — the Plan does not add try/catch around predicate invocation, and Task 4's own tests should confirm a throwing predicate's error is not silently absorbed.
- **Case sensitivity of `notContains`/`endsWith` relative to the already-shipped `contains`/`startsWith`** — the Spec's edge-case section documents `equals`/`notEquals`'s locale-lowercasing precedent inherited from the already-shipped string modes but does not restate it explicitly for `notContains`/`endsWith`; a reasonable person filtering with `notContains`/`endsWith` after already relying on `contains`/`startsWith`'s case-insensitive behavior (Spec §3.1: cell/filter values are lowercased before comparison in the existing string cases) expects the same case-insensitivity, not a silent case-sensitive regression for exactly these two new string modes.

---

## File Structure

No new files. Every task modifies one of these 3 existing files (plus its co-located `.spec` file):

- `packages/ng/src/table/table.ts` — Angular `UTable`, private `matchesFilter` method (currently `table.ts:195-210`).
- `packages/ng/src/table/table.spec.ts` — Angular test file, existing `describe("filtering ...")` block at line 127.
- `packages/react/src/table/table.tsx` — React `UTable`, module-level `matchesFilter` function (currently `table.tsx:97-108`).
- `packages/react/src/table/table.spec.tsx` — React test file.
- `packages/vue/src/table/Table.vue` — Vue `UTable`, module-level `matchesFilter` function inside the `<script>` block (currently `Table.vue:126-137`).
- `packages/vue/src/table/table.spec.ts` — Vue test file.

Each task's deliverable is self-contained per framework: Task 1 (Angular comparators), Task 2 (React comparators), Task 3 (Vue comparators) have no dependency on each other and may run in any order. Task 4 (Angular `custom`) depends on Task 1 only insofar as it edits the same file afterward — it does not consume any interface Task 1 produces. Tasks 5 (React `custom`) and 6 (Vue `custom`) are independent of every other task.

---

### Task 1: Angular — 14 comparator modes

**Files:**
- Modify: `packages/ng/src/table/table.ts:195-210` (the `matchesFilter` method)
- Test: `packages/ng/src/table/table.spec.ts` (append to the existing `describe("filtering (Angular array-of-alternatives operator shape, spec §9 — string match modes only)", ...)` block, or add a new adjacent `describe` — either is acceptable, this task adds a new one for clarity)

**Interfaces:**
- Consumes: `equals` from `@ultimate/uix-data` (already imported at `table.ts:12`), `FilterMetadata` type (already imported at `table.ts:13`).
- Produces: nothing consumed by a later task — Task 4 edits the same file's `matchesFilter` method afterward but does not call anything this task adds.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to `packages/ng/src/table/table.spec.ts`, after the existing filtering `describe` block (after line 210 or wherever that block's closing `});` currently is):

```typescript
describe("filtering — remaining comparator modes (Spec: 2026-09-23-table-filter-vocabulary-design.md)", () => {
  // Explicit mode-coverage checklist for this framework — each of the 14
  // comparator modes must appear as a literal matchMode string in at least
  // one assertion below: notContains, endsWith, notEquals, lt, lte, gt,
  // gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter.
  interface NumRow {
    id: number;
    score: number;
  }
  interface DateRow {
    id: number;
    when: Date;
  }

  it("applies matchMode: notContains", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "ali", matchMode: "notContains" } });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Bob");
  });

  it("applies matchMode: notContains case-insensitively, matching contains' precedent", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "ALI", matchMode: "notContains" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("applies matchMode: endsWith", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "ce", matchMode: "endsWith" } });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("applies matchMode: endsWith case-insensitively, matching startsWith's precedent", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "CE", matchMode: "endsWith" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies matchMode: notEquals, and an absent OR empty-string filter value does not match (Angular's verified real default)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "Alice", matchMode: "notEquals" } });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Bob");

    // Real PrimeNG filterservice.ts's own notEquals: filter === undefined ||
    // filter === null || (typeof filter === 'string' && filter.trim() === '')
    // => false (does not match). Both undefined and '' hit this branch.
    fixture.componentRef.setInput("filters", { name: { value: undefined, matchMode: "notEquals" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);

    fixture.componentRef.setInput("filters", { name: { value: "", matchMode: "notEquals" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("applies matchMode: lt", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: 20, matchMode: "lt" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies matchMode: lte", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: 20, matchMode: "lte" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: gt", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: 20, matchMode: "gt" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies matchMode: gte", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: 20, matchMode: "gte" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("lt/lte/gt/gte pass through (match everything) when the filter value itself is absent", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: undefined, matchMode: "lt" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: between, inclusive on both bounds", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [10, 20], matchMode: "between" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("matchMode: between with an inverted range (low > high) matches nothing, not a throw", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [30, 10], matchMode: "between" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("matchMode: between with a null bound passes through (matches everything)", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [null, null], matchMode: "between" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: in, using equals-based membership, including a null filter-array entry", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [10, 30, null], matchMode: "in" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: notIn, using equals-based membership, including a null filter-array entry", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [10, 30, null], matchMode: "notIn" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("in/notIn pass through (match everything) when the filter array is empty", () => {
    const fixture = TestBed.createComponent(UTable<NumRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: [], matchMode: "in" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: dateIs (day-level), no string coercion", () => {
    const fixture = TestBed.createComponent(UTable<DateRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "when", header: "When" }]);
    fixture.componentRef.setInput("filters", {
      when: { value: new Date(2026, 0, 1), matchMode: "dateIs" },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: dateIsNot (day-level)", () => {
    const fixture = TestBed.createComponent(UTable<DateRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "when", header: "When" }]);
    fixture.componentRef.setInput("filters", {
      when: { value: new Date(2026, 0, 1), matchMode: "dateIsNot" },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies matchMode: dateBefore (time-precise)", () => {
    const fixture = TestBed.createComponent(UTable<DateRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "when", header: "When" }]);
    fixture.componentRef.setInput("filters", {
      when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateBefore" },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies matchMode: dateAfter (time-precise)", () => {
    const fixture = TestBed.createComponent(UTable<DateRow>);
    fixture.componentRef.setInput("value", [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "when", header: "When" }]);
    fixture.componentRef.setInput("filters", {
      when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateAfter" },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("a row with an undefined field value fails lt/lte/gt/gte/between once a real filter value is present", () => {
    const fixture = TestBed.createComponent(UTable<Partial<NumRow> & { id: number }>);
    fixture.componentRef.setInput("value", [{ id: 1 }, { id: 2, score: 20 }]);
    fixture.componentRef.setInput("columns", [{ field: "score", header: "Score" }]);
    fixture.componentRef.setInput("filters", { score: { value: 10, matchMode: "gt" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — every new `it` in this block fails, since `matchesFilter` currently falls through to `default: return true` for every mode tested here (each assertion expects a filtered count smaller than the full dataset, but the unfiltered `default: true` pass-through returns all rows).

- [ ] **Step 3: Write minimal implementation**

Replace `packages/ng/src/table/table.ts:195-210`'s `matchesFilter` method body with:

```typescript
  private matchesFilter(row: T, field: string, filter: FilterMetadata): boolean {
    const rawCellValue = this.resolveCell(row, field);
    const rawFilterValue = filter.value;
    const cellValue = String(rawCellValue ?? "").toLowerCase();
    const filterValue = String(rawFilterValue ?? "").toLowerCase();

    switch (filter.matchMode) {
      case "contains":
        return cellValue.includes(filterValue);
      case "startsWith":
        return cellValue.startsWith(filterValue);
      case "notContains":
        return !cellValue.includes(filterValue);
      case "endsWith":
        return cellValue.endsWith(filterValue);
      case "equals":
        return cellValue === filterValue;
      case "notEquals":
        // Real PrimeNG filterservice.ts: absent (undefined/null) OR an
        // empty/whitespace-only string filter value => false (no match).
        // filterValue is already lowercased/trimmed-by-String-coercion here,
        // so filterValue === "" also catches the whitespace-only case once
        // combined with the raw-value undefined/null check.
        if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return false;
        return cellValue !== filterValue;
      case "lt":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) < (rawFilterValue as number | Date);
      case "lte":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) <= (rawFilterValue as number | Date);
      case "gt":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) > (rawFilterValue as number | Date);
      case "gte":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) >= (rawFilterValue as number | Date);
      case "between": {
        const range = rawFilterValue as [unknown, unknown] | null | undefined;
        if (range == null || range[0] == null || range[1] == null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        const low = range[0] as number | Date;
        const high = range[1] as number | Date;
        return low <= (rawCellValue as number | Date) && (rawCellValue as number | Date) <= high;
      }
      case "in": {
        const options = rawFilterValue as unknown[] | null | undefined;
        if (options == null || options.length === 0) return true;
        return options.some((option) => equals(rawCellValue, option));
      }
      case "notIn": {
        const options = rawFilterValue as unknown[] | null | undefined;
        if (options == null || options.length === 0) return true;
        return !options.some((option) => equals(rawCellValue, option));
      }
      case "dateIs":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).toDateString() === (rawFilterValue as Date).toDateString();
      case "dateIsNot":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).toDateString() !== (rawFilterValue as Date).toDateString();
      case "dateBefore":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).getTime() < (rawFilterValue as Date).getTime();
      case "dateAfter":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).getTime() > (rawFilterValue as Date).getTime();
      // NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 4)
      default:
        return true;
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS — all new tests pass, all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0 (no new dependency introduced).

- [ ] **Step 7: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add remaining Table filter comparator modes"
```

---

### Task 2: React — 14 comparator modes

**Files:**
- Modify: `packages/react/src/table/table.tsx:97-108` (the `matchesFilter` function)
- Test: `packages/react/src/table/table.spec.tsx` (add a new `describe` block)

**Interfaces:**
- Consumes: `equals` from `@ultimate/uix-data` (already imported at `table.tsx:3`), `FilterMetadata` type (already imported at `table.tsx:4`), `resolveCell` (module-level function already defined at `table.tsx:80-82`).
- Produces: nothing consumed by a later task.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to `packages/react/src/table/table.spec.tsx` (following the file's existing `render`/`cleanup` convention — check the existing filtering tests in this file for the exact `render(<UTable ... />)` + `screen`/`container` query pattern already in use, and match it):

```tsx
describe("filtering — remaining comparator modes (Spec: 2026-09-23-table-filter-vocabulary-design.md)", () => {
  // Explicit mode-coverage checklist for this framework — each of the 14
  // comparator modes must appear as a literal matchMode string in at least
  // one assertion below: notContains, endsWith, notEquals, lt, lte, gt,
  // gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter.
  interface NumRow {
    id: number;
    score: number;
  }
  interface DateRow {
    id: number;
    when: Date;
  }

  afterEach(cleanup);

  it("applies matchMode: notContains, case-insensitively", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "ALI", matchMode: "notContains" } }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Bob");
  });

  it("applies matchMode: endsWith, case-insensitively", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "CE", matchMode: "endsWith" } }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("applies matchMode: notEquals, and an absent OR empty-string filter value matches (React's verified real default — the opposite of Angular/Vue)", () => {
    const { container, rerender } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "Alice", matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    // Real PrimeReact FilterService.js's own notEquals: filter === undefined
    // || filter === null || (typeof filter === 'string' && filter.trim() ===
    // '') => true (matches everything). Both undefined and '' hit this branch.
    rerender(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: undefined, matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "", matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: lt/lte/gt/gte", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "lt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "lte" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "gt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "gte" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("lt passes through (matches everything) when the filter value itself is absent", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, score: 10 },
          { id: 2, score: 20 },
          { id: 3, score: 30 },
        ]}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: undefined, matchMode: "lt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: between, inclusive bounds, inverted range matches nothing, null bound passes through", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 20], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [30, 10], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(0);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [null, null], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: in/notIn using equals-based membership, including a null filter-array entry; empty array passes through", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 30, null], matchMode: "in" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 30, null], matchMode: "notIn" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [], matchMode: "in" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies date matchModes: dateIs/dateIsNot (day-level) and dateBefore/dateAfter (time-precise), no string coercion", () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1), matchMode: "dateIs" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1), matchMode: "dateIsNot" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateBefore" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateAfter" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("a row with an undefined field value fails gt once a real filter value is present", () => {
    const { container } = render(
      <UTable
        value={[{ id: 1 }, { id: 2, score: 20 }] as (Partial<NumRow> & { id: number })[]}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 10, matchMode: "gt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/react test -- --include='**/table.spec.tsx'`
Expected: FAIL — every new `it` fails, since `matchesFilter` currently falls through to `default: return true` for every mode tested here.

- [ ] **Step 3: Write minimal implementation**

Replace `packages/react/src/table/table.tsx:97-108`'s `matchesFilter` function body with:

```tsx
function matchesFilter<T>(row: T, field: string, filter: FilterMetadata): boolean {
  const rawCellValue = resolveCell(row, field);
  const rawFilterValue = filter.value;
  const cellValue = String(rawCellValue ?? "").toLowerCase();
  const filterValue = String(rawFilterValue ?? "").toLowerCase();

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    case "startsWith":
      return cellValue.startsWith(filterValue);
    case "notContains":
      return !cellValue.includes(filterValue);
    case "endsWith":
      return cellValue.endsWith(filterValue);
    case "equals":
      return cellValue === filterValue;
    case "notEquals":
      // Real PrimeReact FilterService.js: absent (undefined/null) OR an
      // empty/whitespace-only string filter value => true (matches
      // everything) — the opposite outcome from Angular's/Vue's real source
      // for the identical condition.
      if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return true;
      return cellValue !== filterValue;
    case "lt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) < (rawFilterValue as number | Date);
    case "lte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) <= (rawFilterValue as number | Date);
    case "gt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) > (rawFilterValue as number | Date);
    case "gte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) >= (rawFilterValue as number | Date);
    case "between": {
      const range = rawFilterValue as [unknown, unknown] | null | undefined;
      if (range == null || range[0] == null || range[1] == null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const low = range[0] as number | Date;
      const high = range[1] as number | Date;
      return low <= (rawCellValue as number | Date) && (rawCellValue as number | Date) <= high;
    }
    case "in": {
      const options = rawFilterValue as unknown[] | null | undefined;
      if (options == null || options.length === 0) return true;
      return options.some((option) => equals(rawCellValue, option));
    }
    case "notIn": {
      const options = rawFilterValue as unknown[] | null | undefined;
      if (options == null || options.length === 0) return true;
      return !options.some((option) => equals(rawCellValue, option));
    }
    case "dateIs":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).toDateString() === (rawFilterValue as Date).toDateString();
    case "dateIsNot":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).toDateString() !== (rawFilterValue as Date).toDateString();
    case "dateBefore":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).getTime() < (rawFilterValue as Date).getTime();
    case "dateAfter":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).getTime() > (rawFilterValue as Date).getTime();
    // NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 5)
    default:
      return true;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/react test -- --include='**/table.spec.tsx'`
Expected: PASS — all new tests pass, all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): add remaining Table filter comparator modes"
```

---

### Task 3: Vue — 14 comparator modes

**Files:**
- Modify: `packages/vue/src/table/Table.vue:126-137` (the `matchesFilter` function inside `<script>`)
- Test: `packages/vue/src/table/table.spec.ts` (add a new `describe` block)

**Interfaces:**
- Consumes: `equals` from `@ultimate/uix-data` (already imported at `Table.vue:96`), `resolveCell` (module-level function already defined at `Table.vue:108-110`).
- Produces: nothing consumed by a later task.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to `packages/vue/src/table/table.spec.ts` (matching the file's existing `mount(UTable, { props: {...} })` convention — check the existing filtering tests in this file for the exact prop-passing/`wrapper.findAll("td")` pattern already in use, and match it):

```typescript
describe("filtering — remaining comparator modes (Spec: 2026-09-23-table-filter-vocabulary-design.md)", () => {
  // Explicit mode-coverage checklist for this framework — each of the 14
  // comparator modes must appear as a literal matchMode string in at least
  // one assertion below: notContains, endsWith, notEquals, lt, lte, gt,
  // gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter.
  interface NumRow {
    id: number;
    score: number;
  }
  interface DateRow {
    id: number;
    when: Date;
  }

  it("applies matchMode: notContains, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "ALI", matchMode: "notContains" } },
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].text()).toBe("Bob");
  });

  it("applies matchMode: endsWith, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "CE", matchMode: "endsWith" } },
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].text()).toBe("Alice");
  });

  it("applies matchMode: notEquals, and an absent OR empty-string filter value does not match (Vue's verified real default, same as Angular — not React)", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "Alice", matchMode: "notEquals" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    // Real PrimeVue FilterService.js's own notEquals: filter === undefined ||
    // filter === null || filter === '' => false (does not match). Vue checks
    // the literal empty string (no .trim()), unlike Angular's/React's
    // whitespace-aware check, but the outcome for a plain '' is identical.
    await wrapper.setProps({ filters: { name: { value: undefined, matchMode: "notEquals" } } });
    expect(wrapper.findAll("td").length).toBe(0);

    await wrapper.setProps({ filters: { name: { value: "", matchMode: "notEquals" } } });
    expect(wrapper.findAll("td").length).toBe(0);
  });

  it("applies matchMode: lt/lte/gt/gte", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: 20, matchMode: "lt" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "lte" } } });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "gt" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "gte" } } });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("lt passes through (matches everything) when the filter value itself is absent", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, score: 10 },
          { id: 2, score: 20 },
          { id: 3, score: 30 },
        ],
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: undefined, matchMode: "lt" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies matchMode: between, inclusive bounds, inverted range matches nothing, null bound passes through", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: [10, 20], matchMode: "between" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: [30, 10], matchMode: "between" } } });
    expect(wrapper.findAll("td").length).toBe(0);

    await wrapper.setProps({ filters: { score: { value: [null, null], matchMode: "between" } } });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies matchMode: in/notIn using equals-based membership, including a null filter-array entry; empty array passes through", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: [10, 30, null], matchMode: "in" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: [10, 30, null], matchMode: "notIn" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: [], matchMode: "in" } } });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies date matchModes: dateIs/dateIsNot (day-level) and dateBefore/dateAfter (time-precise)", async () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "when", header: "When" }],
        filters: { when: { value: new Date(2026, 0, 1), matchMode: "dateIs" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { when: { value: new Date(2026, 0, 1), matchMode: "dateIsNot" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({
      filters: { when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateBefore" } },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({
      filters: { when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateAfter" } },
    });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("applies date matchModes with real string-date coercion, distinct from Angular/React", () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "when", header: "When" }],
        // A string-typed filter value — Vue's real FilterService coerces this
        // via new Date(...) before comparing; Angular/React do not support this.
        filters: { when: { value: "2026-01-01T00:00:00", matchMode: "dateIs" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);
  });

  it("a row with an undefined field value fails gt once a real filter value is present", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1 }, { id: 2, score: 20 }],
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: 10, matchMode: "gt" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test -- --include='**/table.spec.ts'`
Expected: FAIL — every new `it` fails, since `matchesFilter` currently falls through to `default: return true` for every mode tested here.

- [ ] **Step 3: Write minimal implementation**

Replace `packages/vue/src/table/Table.vue:126-137`'s `matchesFilter` function body with:

```javascript
function matchesFilter(row, field, filter) {
  const rawCellValue = resolveCell(row, field);
  const rawFilterValue = filter.value;
  const cellValue = String(rawCellValue ?? "").toLowerCase();
  const filterValue = String(rawFilterValue ?? "").toLowerCase();

  const toComparable = (v) => (typeof v === "string" ? new Date(v) : v);

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    case "startsWith":
      return cellValue.startsWith(filterValue);
    case "notContains":
      return !cellValue.includes(filterValue);
    case "endsWith":
      return cellValue.endsWith(filterValue);
    case "equals":
      return cellValue === filterValue;
    case "notEquals":
      // Real PrimeVue FilterService.js: absent (undefined/null) OR an empty
      // string filter value => false (does not match) — matching Angular's
      // real outcome, not React's.
      if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return false;
      return cellValue !== filterValue;
    case "lt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue < rawFilterValue;
    case "lte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue <= rawFilterValue;
    case "gt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue > rawFilterValue;
    case "gte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue >= rawFilterValue;
    case "between": {
      const range = rawFilterValue;
      if (range == null || range[0] == null || range[1] == null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return range[0] <= rawCellValue && rawCellValue <= range[1];
    }
    case "in": {
      const options = rawFilterValue;
      if (options == null || options.length === 0) return true;
      return options.some((option) => equals(rawCellValue, option));
    }
    case "notIn": {
      const options = rawFilterValue;
      if (options == null || options.length === 0) return true;
      return !options.some((option) => equals(rawCellValue, option));
    }
    case "dateIs": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.toDateString() === filterVal.toDateString();
    }
    case "dateIsNot": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.toDateString() !== filterVal.toDateString();
    }
    case "dateBefore": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.getTime() < filterVal.getTime();
    }
    case "dateAfter": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.getTime() > filterVal.getTime();
    }
    // NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 6)
    default:
      return true;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test -- --include='**/table.spec.ts'`
Expected: PASS — all new tests pass, all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): add remaining Table filter comparator modes"
```

---

### Task 4: Angular — `custom` registration surface (binding contract, Spec §3.4.1)

**Files:**
- Modify: `packages/ng/src/table/table.ts` (add the registration surface and wire `custom` dispatch into `matchesFilter`)
- Test: `packages/ng/src/table/table.spec.ts` (add a new `describe` block)

**Interfaces:**
- Consumes: nothing from Task 1 beyond the shared `matchesFilter` method it edits again.
- Produces: `UTable.registerCustomFilter(fn: (value: unknown, filter: unknown, filterLocale?: string) => boolean): void` — a public instance method, Table-scoped (per Spec §3.4.1's binding contract: ownership = the `UTable` instance; scope = that instance only; key = the reserved `'custom'` name, no arbitrary-key generalization; duplicate registration replaces). No later task in this plan consumes this method.

Implementation choice for this task (internal mechanism only, per Spec §3.4.1's own text: "The Plan may choose the concrete implementation... as long as it satisfies the approved Spec contract"): a private instance field holding at most one registered predicate, exposed via one public method. This satisfies every element of the binding contract with the smallest surface: Table-scoped (the field lives on the component instance, not a static/module-level singleton), single reserved key (`'custom'` is the only key this method supports, matching the contract's explicit non-requirement to generalize), replace-on-duplicate (a plain field assignment is inherently last-write-wins), and the exact callback signature the contract specifies.

**`filterLocale` finding (Global Constraints):** `FilterMetadata` carries only `{ value, matchMode }` — no `filterLocale` field exists anywhere in `@ultimate/uix-data`, and Table itself has no `filterLocale` input. There is no real locale value in Table's current data flow for this task to thread through. The call site below invokes the registered predicate with `filterLocale` as an explicit third argument whose value is `undefined` — satisfying the contract's `(value, filter, filterLocale?: string) => boolean` signature exactly as approved, without inventing a locale source that does not exist. A `NEEDS IMPLEMENTATION-TIME VERIFICATION` comment marks this for a future task that introduces a real Table-level locale input.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to `packages/ng/src/table/table.spec.ts`:

```typescript
describe("filtering — custom mode, Angular registration contract (Spec §3.4.1)", () => {
  it("dispatches a predicate registered under the reserved 'custom' key", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const instance = fixture.componentInstance;
    instance.registerCustomFilter((value) => typeof value === "string" && value.length > 3);

    fixture.componentRef.setInput("value", [
      { id: 1, name: "Al" },
      { id: 2, name: "Alice" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("passes all three callback arguments (value, filter, filterLocale) to the registered predicate, with filterLocale explicitly undefined (no real locale source exists in Table's current data flow)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const instance = fixture.componentInstance;
    const spy = vi.fn(() => true);
    instance.registerCustomFilter(spy);

    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "needle", matchMode: "custom" } });
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("Alice", "needle", undefined);
    expect(spy.mock.calls[0].length).toBe(3);
  });

  it("an unregistered custom mode matches no rows (false, not the unhandled-mode pass-through)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("a second registration under 'custom' replaces the first (duplicate-registration behavior)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const instance = fixture.componentInstance;
    instance.registerCustomFilter(() => true);
    instance.registerCustomFilter(() => false);

    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("a predicate registered on one UTable instance is not reachable from a second, unrelated instance", () => {
    const fixtureA = TestBed.createComponent(UTable<Row>);
    fixtureA.componentInstance.registerCustomFilter(() => true);

    const fixtureB = TestBed.createComponent(UTable<Row>);
    fixtureB.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixtureB.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixtureB.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });
    fixtureB.detectChanges();

    // Instance B never registered a predicate — its own 'custom' mode
    // must resolve to false, unaffected by instance A's registration.
    expect(fixtureB.nativeElement.querySelectorAll("td").length).toBe(0);
  });

  it("a throwing registered predicate's error is not silently swallowed", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentInstance.registerCustomFilter(() => {
      throw new Error("predicate boom");
    });

    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });

    expect(() => fixture.detectChanges()).toThrow("predicate boom");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — `registerCustomFilter` does not exist yet (`TypeError` / compile error), and `custom` currently falls through to `default: return true`.

- [ ] **Step 3: Write minimal implementation**

In `packages/ng/src/table/table.ts`, add a private field and a public method to the `UTable` class (place both near the top of the class body, after the existing `input`/`output` declarations and before `ngOnChanges`):

```typescript
  private customFilterPredicate?: (value: unknown, filter: unknown, filterLocale?: string) => boolean;

  /**
   * Registers the predicate the 'custom' FilterMatchMode dispatches to for
   * this UTable instance only (Spec §3.4.1's binding contract: Table-scoped,
   * reserved 'custom' key, replace-on-duplicate). No consuming application
   * code should assume this registration is visible to any other UTable
   * instance.
   */
  registerCustomFilter(fn: (value: unknown, filter: unknown, filterLocale?: string) => boolean): void {
    this.customFilterPredicate = fn;
  }
```

Then add the `custom` case to `matchesFilter`'s `switch` (replacing the `// NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 4)` comment added in Task 1, immediately before the `default:` branch):

```typescript
      case "custom":
        if (!this.customFilterPredicate) return false;
        // NEEDS IMPLEMENTATION-TIME VERIFICATION: filterLocale is passed as
        // undefined — FilterMetadata has no filterLocale field and Table has
        // no filterLocale input, so no real locale value exists in Table's
        // current data flow. Revisit once a Table-level locale input exists.
        return this.customFilterPredicate(rawCellValue, rawFilterValue, undefined);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS — all new tests pass (including the throwing-predicate test, which passes because the error propagates uncaught), all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add Table-scoped custom filter registration for Angular UTable"
```

---

### Task 5: React — `custom` mode, no executable registration path (Spec §3.4.2)

**Files:**
- Modify: `packages/react/src/table/table.tsx:97-108` (the `matchesFilter` function — one explicit `case` added, no new prop, no new export)
- Test: `packages/react/src/table/table.spec.tsx` (add a new `describe` block)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing — this task's entire point is that nothing new is produced (Spec §3.4.2: no new prop, no new exported function, no new module-level mutable object).

- [ ] **Step 1: Write the failing test**

Add this `describe` block to `packages/react/src/table/table.spec.tsx`. The prior draft of this task included a second test asserting API-surface absence against a hand-written local object (`{ value: [], columns: [] }`) — that object is not `UTableProps` and proves nothing about the real type, so it is removed here rather than kept as a decoy. The single behavioral test below is the entire binding proof for Spec §3.4.2, matching the Spec's own text ("no application-supplied custom predicate is executable... no React registration API is introduced"): both requirements reduce to "no rows ever match `custom`," which is exactly what this test asserts:

```tsx
describe("filtering — custom mode, React (Spec §3.4.2: no executable registration path)", () => {
  it("a custom matchMode matches no rows, with no public prop able to change that outcome", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "anything", matchMode: "custom" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- --include='**/table.spec.tsx'`
Expected: FAIL — `custom` currently falls through to `default: return true`, so all rows render (`container.querySelectorAll("td").length` is `2`, not `0`).

- [ ] **Step 3: Write minimal implementation**

In `packages/react/src/table/table.tsx`, add the `custom` case to `matchesFilter`'s `switch` (replacing the `// NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 5)` comment added in Task 2, immediately before the `default:` branch):

```tsx
    case "custom":
      // No executable registration path exists for React's UTable (Spec
      // §3.4.2) — 'custom' is a recognized but permanently inert mode name
      // here, matching no rows. This must never be changed to read from or
      // invoke an application-supplied function without a new specification
      // authorizing that surface.
      return false;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- --include='**/table.spec.tsx'`
Expected: PASS — the new test passes, all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): make Table custom filter mode a deterministic no-match, no registration surface"
```

---

### Task 6: Vue — `custom` mode, no executable registration path (Spec §3.4.2)

**Files:**
- Modify: `packages/vue/src/table/Table.vue:126-137` (the `matchesFilter` function — one explicit `case` added, no new prop, no new export)
- Test: `packages/vue/src/table/table.spec.ts` (add a new `describe` block)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing — same negative requirement as Task 5.

- [ ] **Step 1: Write the failing test**

Add this `describe` block to `packages/vue/src/table/table.spec.ts`:

```typescript
describe("filtering — custom mode, Vue (Spec §3.4.2: no executable registration path)", () => {
  it("a custom matchMode matches no rows, with no public prop able to change that outcome", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "anything", matchMode: "custom" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- --include='**/table.spec.ts'`
Expected: FAIL — `custom` currently falls through to `default: return true`, so both rows render (`wrapper.findAll("td").length` is `2`, not `0`).

- [ ] **Step 3: Write minimal implementation**

In `packages/vue/src/table/Table.vue`, add the `custom` case to `matchesFilter`'s `switch` (replacing the `// NEEDS IMPLEMENTATION-TIME VERIFICATION: custom (Task 6)` comment added in Task 3, immediately before the `default:` branch):

```javascript
    case "custom":
      // No executable registration path exists for Vue's UTable (Spec
      // §3.4.2) — 'custom' is a recognized but permanently inert mode name
      // here, matching no rows. This must never be changed to read from or
      // invoke an application-supplied function without a new specification
      // authorizing that surface.
      return false;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- --include='**/table.spec.ts'`
Expected: PASS — the new test passes, all pre-existing tests in the file still pass.

- [ ] **Step 5: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, no regressions in any package.

- [ ] **Step 6: Run the dependency-ceiling gate**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): make Table custom filter mode a deterministic no-match, no registration surface"
```

---

### Task 7: Documentation closeout (Spec §9 item 7, §11 item 7)

**Files:**
- Modify: `docs/architecture/COMPONENT_INVENTORY.md` (Table's row)
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (DECISION-C entry)

**Interfaces:**
- Consumes: nothing — this task only updates prose describing work already committed in Tasks 1-6.
- Produces: nothing consumed by another task.

- [ ] **Step 1: Update `COMPONENT_INVENTORY.md`'s Table row**

Read `docs/architecture/COMPONENT_INVENTORY.md`'s current Table row (grep for `| Table |` or the equivalent heading), and add a note that the filter-operator vocabulary is now complete (all 15 `FilterMatchMode` values dispatched — 14 comparators plus `custom`, Angular-only for `custom`), citing this plan's own filename. Match the file's existing row-annotation style (read 2-3 neighboring rows first to match tone/format exactly — do not invent a new column or format).

- [ ] **Step 2: Update `BLUEPRINT_GAPS.md`'s DECISION-C entry**

In `docs/architecture/BLUEPRINT_GAPS.md`, find the DECISION-C entry (search for `### DECISION-C`). Append a new dated resolution paragraph (matching the existing "OrderList/PickList/DataView resolution (human-approved architectural decision, 2026-09-21)" paragraph's own style and structure) stating: the fuller filter-operator vocabulary remainder is now resolved — 14 comparator modes shipped identically in structure across all 3 frameworks with framework-verified edge-case divergences preserved (`notEquals`'s absent/empty-filter default: Angular `false`, Vue `false`, React `true`; Vue's date-string coercion), and `custom` is supported via a Table-scoped registration contract for Angular only, with React/Vue confirmed to have no executable registration path. Cite this plan's filename and the Spec's filename (`docs/superpowers/specs/2026-09-23-table-filter-vocabulary-design.md`). Do not alter DECISION-C's TreeTable-remains-separately-blocked-on-DECISION-D language — that scope is unaffected by this work and must remain exactly as currently written.

- [ ] **Step 3: Run the full monorepo test suite**

Run: `pnpm test`
Expected: exits 0, every package's Test Files/Tests line shows all passed (matching the pattern already established: no regressions from Tasks 1-6).

- [ ] **Step 4: Run the dependency-ceiling gate one final time**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/COMPONENT_INVENTORY.md docs/architecture/BLUEPRINT_GAPS.md
git commit -m "docs: close DECISION-C's Table filter-vocabulary remainder"
```

---

## Completion

After Task 7's commit, this plan's scope is fully implemented and documented. Proceed to a single Verification pass and single Final Review/Closeout for the whole of this scope (Spec §9 item 8), not per-task — matching Batch 3's own precedent. Final Review/Closeout itself, and any subsequent merge, remain separately gated per AGENTS.md §3/§7.5 — this plan's own completion does not authorize either.
