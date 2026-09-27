import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UTable } from "./table";
import { UTable as RootExport } from "../index";
import { UPaginator } from "../paginator/paginator";
import { UScroller } from "../scroller/scroller";

interface Row {
  id: number;
  name: string;
}

describe("UTable", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("renders one row per value entry with role=row", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.detectChanges();
    // Scoped to tbody explicitly (not a bare [role="row"] query) so this
    // assertion stays correct once Task 3 adds a header role="row" — this
    // task has no header row yet, but the selector is written defensively
    // from the start rather than fixed reactively in a later task.
    const rows = fixture.nativeElement.querySelectorAll('tbody [role="row"]');
    expect(rows.length).toBe(2);
  });

  it("root element has role=table", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="table"]')).not.toBeNull();
  });

  it("renders a columnheader per column definition and a data cell per row/column pair", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
    ]);
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
    expect(headers.length).toBe(2);
    expect(headers[1].textContent?.trim()).toBe("Name");
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(2);
    expect(cells[1].textContent?.trim()).toBe("Alice");
  });
});

describe("column body renderer (Spec: 2026-09-26-prime-parity-table-design.md §5.1)", () => {
  interface Row { id: number; name: string; price: number }

  it("renders a column's body function output instead of the raw field value", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Widget", price: 9.5 }]);
    fixture.componentRef.setInput("columns", [
      { field: "name", header: "Name" },
      { field: "price", header: "Price", body: (row: Row) => `$${row.price.toFixed(2)}` },
    ]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Widget");
    expect(cells[1].textContent?.trim()).toBe("$9.50");
  });

  it("passes { field, rowIndex } as the body function's second argument", () => {
    const seen: { field: string; rowIndex: number }[] = [];
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "A", price: 1 },
      { id: 2, name: "B", price: 2 },
    ]);
    fixture.componentRef.setInput("columns", [
      { field: "name", header: "Name", body: (row: Row, options: { field: string; rowIndex: number }) => { seen.push(options); return row.name; } },
    ]);
    fixture.detectChanges();
    expect(seen).toEqual([
      { field: "name", rowIndex: 0 },
      { field: "name", rowIndex: 1 },
    ]);
  });

  it("falls back to the raw field value when no body function is supplied", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Widget", price: 9.5 }]);
    fixture.componentRef.setInput("columns", [{ field: "price", header: "Price" }]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("9.5");
  });

  it("calls the body function with undefined row[field] for a sparse row without throwing", () => {
    interface SparseRow { id: number; name?: string }
    const fixture = TestBed.createComponent(UTable<SparseRow>);
    fixture.componentRef.setInput("value", [{ id: 1 }]);
    fixture.componentRef.setInput("columns", [
      { field: "name", header: "Name", body: (row: SparseRow) => row.name ?? "—" },
    ]);
    expect(() => fixture.detectChanges()).not.toThrow();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("—");
  });
});

describe("sorting", () => {
  it("sorts by sortField/sortOrder (single-sort) without mutating the input array", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    fixture.componentRef.setInput("value", original);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortField", "name");
    fixture.componentRef.setInput("sortOrder", 1);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Alice");
    expect(original[0].name).toBe("Bob"); // original array untouched
  });

  it("sets aria-sort on the active sortField's columnheader", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortField", "name");
    fixture.componentRef.setInput("sortOrder", -1);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('[role="columnheader"]');
    expect(header.getAttribute("aria-sort")).toBe("descending");
  });

  it("exposes sortedValue as a directly accessible, sorted-but-unfiltered getter", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    fixture.componentRef.setInput("value", original);
    fixture.componentRef.setInput("sortField", "name");
    fixture.componentRef.setInput("sortOrder", 1);
    // A filter that would exclude "Bob" if sortedValue were derived from
    // filteredValue instead of value() directly.
    fixture.componentRef.setInput("filters", { name: { value: "ali", matchMode: "contains" } });
    fixture.detectChanges();

    const instance = fixture.componentInstance as unknown as { sortedValue: Row[] };
    expect(instance.sortedValue.map((r) => r.name)).toEqual(["Alice", "Bob"]);
    expect(original[0].name).toBe("Bob"); // original array untouched
  });

  it("multi-sort applies multiSortMeta entries in order", () => {
    const fixture = TestBed.createComponent(UTable<{ group: string; name: string }>);
    fixture.componentRef.setInput("value", [
      { group: "b", name: "z" },
      { group: "a", name: "y" },
      { group: "a", name: "x" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortMode", "multiple");
    fixture.componentRef.setInput("multiSortMeta", [
      { field: "group", order: 1 },
      { field: "name", order: 1 },
    ]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect([cells[0].textContent?.trim(), cells[1].textContent?.trim(), cells[2].textContent?.trim()]).toEqual([
      "x",
      "y",
      "z",
    ]);
  });
});

describe("filtering (Angular array-of-alternatives operator shape, spec §9 — string match modes only)", () => {
  it("applies a simple FilterMetadata filter (matchMode: contains)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "ali", matchMode: "contains" } });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("applies matchMode: startsWith", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Alison" },
      { id: 3, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "Ali", matchMode: "startsWith" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: equals", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Alison" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "Alice", matchMode: "equals" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies an array-of-alternatives filter (FilterMetadata[]) with OR semantics per element", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Carol" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", {
      name: [
        { value: "ali", matchMode: "contains" },
        { value: "car", matchMode: "contains" },
      ],
    });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(2);
  });
});

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

  it("matchMode: notContains passes through (matches everything) when the filter value is absent or empty", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: undefined, matchMode: "notContains" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);

    fixture.componentRef.setInput("filters", { name: { value: "", matchMode: "notContains" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
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

  it("applies matchMode: notEquals with a whitespace-only filter value (treats as absent)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "   ", matchMode: "notEquals" } });
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

describe("selection", () => {
  it("emits selectionChange with the clicked row in single mode", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.selectionChange.subscribe((e: unknown) => (emitted = e));
    // tbody-scoped: by this task, Task 3's header row already exists in the
    // template, so a bare [role="row"] query would resolve the header row
    // (which has no click-to-select behavior) instead of the data row.
    fixture.nativeElement.querySelector('tbody [role="row"]').click();
    expect(emitted).toEqual({ id: 1, name: "Alice" });
  });

  it("marks the selected row aria-selected=true using dataKey identity (equals)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.componentRef.setInput("selection", { id: 1, name: "Alice" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody [role="row"]').getAttribute("aria-selected")).toBe("true");
  });
});

describe("selection-column UI (Spec §5.2, GAP-042)", () => {
  interface Row { id: number; name: string }

  it("renders a checkbox per row and a header select-all checkbox when selectionMode is multiple and selectionColumn is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }, { id: 2, name: "B" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    const rowCheckboxes = fixture.nativeElement.querySelectorAll("tbody input[type=checkbox]");
    expect(headerCheckbox).toBeTruthy();
    expect(rowCheckboxes.length).toBe(2);
  });

  it("renders a radio button per row and no header control when selectionMode is single and selectionColumn is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("tbody input[type=radio]")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("thead input")).toBeFalsy();
  });

  it("does not render a selection column when selectionColumn is false (default)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("input[type=checkbox]")).toBeFalsy();
  });

  it("header checkbox is unchecked and enabled when value is empty", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);
  });

  it("clicking a row checkbox toggles that row into the selection and emits selectionChange", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("tbody input[type=checkbox]").click();
    expect(emitted).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("clicking the header checkbox selects all rows; clicking again deselects all", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    headerCheckbox.click();
    expect(emitted[0]).toEqual(rows);
  });
});

describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.detectChanges();
    // tbody-scoped: by this task, Task 3's header row exists, so a bare
    // [role="row"] query would include it — this test must exercise
    // data-row-to-data-row navigation, not header-to-data-row.
    const rows = fixture.nativeElement.querySelectorAll('tbody [role="row"]');
    rows[0].focus();
    rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(rows[1]);
  });
});

describe("keyboard selection (Spec §5.7, GAP-047)", () => {
  it("Space toggles the focused row's selection when selectionMode is set", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector("tbody [role=row]");
    row.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(emitted).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("Enter toggles the focused row's selection when selectionMode is set", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "single");
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
    expect(emitted).toEqual([{ id: 1, name: "A" }]);
  });

  it("Ctrl+A selects all rows when selectionMode is multiple", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA", ctrlKey: true }));
    expect(emitted).toEqual([rows]);
  });

  it("Ctrl+A does nothing when selectionMode is unset", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA", ctrlKey: true }));
    expect(emitted).toEqual([]);
  });

  it("existing Arrow/Home/End keyboard navigation is unaffected by the new Space/Enter/Ctrl+A handling", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody [role="row"]');
    rows[0].focus();
    rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(rows[1]);
  });
});

describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real u-paginator child when paginator=true and slices rows to the current page", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("first", 0);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("totalRecords", 25);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-paginator")).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(10);
  });

  it("advancing the real UPaginator's page updates the visible row slice", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("first", 0);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("totalRecords", 25);
    fixture.detectChanges();
    const nextButton = fixture.nativeElement.querySelector("[data-u-paginator-next]");
    nextButton.click();
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Row 10");
  });
});

describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  // UScroller's ngAfterViewInit constructs a ResizeObserver unconditionally
  // and jsdom does not implement one; this mirrors the established
  // ResizeObserver-callback-capture / mockViewportHeight convention from
  // packages/ng/src/scroller/scroller.spec.ts exactly, needed here because
  // the real windowed (non-disabled) path renders zero rows at the default
  // zero-height jsdom viewport.
  let resizeObserverCallback: ResizeObserverCallback | undefined;

  beforeEach(() => {
    resizeObserverCallback = undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          resizeObserverCallback = cb;
        }
        observe(target: Element) {
          resizeObserverCallback?.([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
        }
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockViewportHeight(element: HTMLElement, height: number): void {
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
  }

  it("renders a real u-scroller child with real table/tbody/tr/td markup via its #content template when virtualScroll=true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    // Real windowing requires a measured viewport: mock ResizeObserver's
    // captured callback (never construct a second observer) and offsetHeight,
    // matching the established convention from the Scroller/Paginator plans.
    fixture.detectChanges();
    const scrollerRoot = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.(
      [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
      {} as unknown as ResizeObserver
    );
    fixture.detectChanges();
    const scrollerEl = fixture.nativeElement.querySelector("u-scroller");
    expect(scrollerEl).not.toBeNull();
    // Real table structure through the content template, not <div> soup:
    const table = scrollerEl.querySelector("table[data-u-table-virtual-body]");
    expect(table).not.toBeNull();
    const tbody = table.querySelector("tbody");
    expect(tbody?.parentElement).toBe(table);
    const trs = tbody.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200); // genuinely windowed, not the full list
    trs.forEach((tr: Element) => expect(tr.querySelector(":scope > td")).not.toBeNull());
  });

  it("does not render the built-in u-scroller-item divs when virtualScroll=true (content template fully replaces them)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` })));
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
  });

  it("clicking a virtualized row emits selectionChange with the clicked row (single mode)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    fixture.detectChanges();
    const scrollerRoot = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.(
      [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
      {} as unknown as ResizeObserver
    );
    fixture.detectChanges();

    let emitted: unknown;
    fixture.componentInstance.selectionChange.subscribe((e: unknown) => (emitted = e));
    const firstRow = fixture.nativeElement.querySelector('table[data-u-table-virtual-body] tbody [role="row"]');
    firstRow.click();
    expect(emitted).toEqual(rows[0]);
  });

  it("ArrowDown on a virtualized row moves focus to the next row within the rendered window", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    fixture.detectChanges();
    const scrollerRoot = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.(
      [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
      {} as unknown as ResizeObserver
    );
    fixture.detectChanges();

    const renderedRows = fixture.nativeElement.querySelectorAll('table[data-u-table-virtual-body] tbody [role="row"]');
    expect(renderedRows.length).toBeGreaterThan(1);
    renderedRows[0].focus();
    renderedRows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(renderedRows[1]);
  });
});

describe("row editing (key-map, spec §11.1)", () => {
  it("emits editingRowKeysChange with the row's dataKey value added when row edit is initiated", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("editMode", "row");
    fixture.detectChanges();
    let emitted: Record<string, boolean> | undefined;
    fixture.componentInstance.editingRowKeysChange.subscribe((e: Record<string, boolean>) => (emitted = e));
    fixture.componentInstance.initRowEdit({ id: 1, name: "Alice" });
    expect(emitted).toEqual({ "1": true });
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const fixture = TestBed.createComponent(UTable<{ group: string; name: string }>);
    fixture.componentRef.setInput("value", [
      { group: "a", name: "Alice" },
      { group: "a", name: "Amy" },
      { group: "b", name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("rowGroupMode", "subheader");
    fixture.componentRef.setInput("groupRowsBy", "group");
    fixture.detectChanges();
    const groupHeaders = fixture.nativeElement.querySelectorAll("[data-u-table-group-header]");
    expect(groupHeaders.length).toBe(2); // one per distinct group boundary
    for (const header of groupHeaders) {
      expect(header.classList.contains("u-table-row-group-header")).toBe(true);
    }
  });
});

describe("rowGroupMode rowspan (Spec §5.5, GAP-045)", () => {
  interface Row2 { id: number; category: string; name: string }

  it("spans consecutive rows sharing the same groupRowsBy value under one cell", () => {
    const fixture = TestBed.createComponent(UTable<Row2>);
    fixture.componentRef.setInput("value", [
      { id: 1, category: "Fruit", name: "Apple" },
      { id: 2, category: "Fruit", name: "Banana" },
      { id: 3, category: "Veg", name: "Carrot" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "category", header: "Category" }, { field: "name", header: "Name" }]);
    fixture.componentRef.setInput("rowGroupMode", "rowspan");
    fixture.componentRef.setInput("groupRowsBy", "category");
    fixture.detectChanges();
    const categoryCells = fixture.nativeElement.querySelectorAll("td[data-u-table-group-cell]");
    expect(categoryCells.length).toBe(2); // one spanned cell per group, not per row
    expect(categoryCells[0].getAttribute("rowspan")).toBe("2");
    expect(categoryCells[1].getAttribute("rowspan")).toBe("1");
  });

  it("renders ungrouped when groupRowsBy is unset, matching subheader mode's own fallback", () => {
    const fixture = TestBed.createComponent(UTable<Row2>);
    fixture.componentRef.setInput("value", [{ id: 1, category: "Fruit", name: "Apple" }]);
    fixture.componentRef.setInput("columns", [{ field: "category", header: "Category" }]);
    fixture.componentRef.setInput("rowGroupMode", "rowspan");
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector("[data-u-table-group-header]")).toBeFalsy();
  });
});

describe("package export", () => {
  it("is exported from the package root barrel", () => {
    // import added at top of file: import { UTable as RootExport } from "../index";
    expect(RootExport).toBe(UTable);
  });
});

describe("theme token consistency", () => {
  it("resolves the same datatable.header.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
    // Part of the Blueprint Phase 5 exit criterion (spec §10, "validate
    // cross-framework theme consistency"). React's and Vue's halves of this
    // guarantee are asserted together in packages/themes/test/
    // cross-framework-consistency.test.ts (Angular's UTable can't run in
    // that file — it requires TestBed/ng test's own environment, a
    // different vitest major version and CLI entry point than the plain
    // `vitest run` the other two frameworks and @ultimate/themes use). This
    // test proves the Angular third: applyUltimateTheme() (called once in
    // this file's beforeAll, above) configures the same uix-styled Theme
    // singleton every *-core package's StyleSheet reads from, so ng-core's
    // registered CSS for the real UTable must resolve
    // datatable.header.background to the identical var(...) text.
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.detectChanges();

    // ngCoreStyleSheet's <style> elements carry no identifying attribute
    // (its StyleSheet instance is constructed with no `attrs` option), so
    // the registered element is located by its known, unique `.u-table-table`
    // selector — matching the DOM-lookup approach used on the React/Vue
    // side of this same assertion (packages/themes/test/
    // cross-framework-consistency.test.ts uses the same nested
    // `.u-table-table {` selector to disambiguate from the outer `.u-table`
    // class, which also appears on Vue's root div).
    const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
      (el.textContent ?? "").includes(".u-table-table {")
    );
    expect(styleEl).not.toBeUndefined();
    const ngCss = styleEl!.textContent ?? "";

    expect(ngCss).toContain("var(--u-datatable-header-background");
    expect(ngCss).not.toContain("dt(");
  });
});

describe("real child-component composition (regression guard, Task 24)", () => {
  it("composes the real UPaginator class (debugElement query, not a DOM-only check)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("totalRecords", 1);
    fixture.detectChanges();
    const paginatorDebugEl = fixture.debugElement.query((de) => de.componentInstance instanceof UPaginator);
    expect(paginatorDebugEl).not.toBeNull();
  });

  it("composes the real UScroller class (debugElement query, not a DOM-only check)", () => {
    // UScroller's ngAfterViewInit constructs a ResizeObserver unconditionally
    // and jsdom does not implement one; stub it exactly like the established
    // Scroller-composition describe block above in this same file, since
    // this test also mounts the real (non-mocked) UScroller.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      }
    );
    try {
      const fixture = TestBed.createComponent(UTable<Row>);
      fixture.componentRef.setInput("value", Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` })));
      fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
      fixture.componentRef.setInput("virtualScroll", true);
      fixture.componentRef.setInput("virtualScrollItemSize", 30);
      fixture.detectChanges();
      const scrollerDebugEl = fixture.debugElement.query((de) => de.componentInstance instanceof UScroller);
      expect(scrollerDebugEl).not.toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

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

  it("registering a predicate AFTER the first change-detection pass still triggers reactivity under OnPush (no stale render)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Al" },
      { id: 2, name: "Alice" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: null, matchMode: "custom" } });
    fixture.detectChanges();

    // Before registration: 'custom' is unregistered, so no rows match.
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(0);

    // Register only now, after the component's first render — the realistic
    // case, since a component reference is only obtainable via
    // viewChild/@ViewChild, which resolves after first render.
    fixture.componentInstance.registerCustomFilter(
      (value) => typeof value === "string" && value.length > 3,
    );
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });
});

describe("loading/empty states (Spec §5.6, GAP-046)", () => {
  it("shows a loading indicator when loading is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-table-loading]")).toBeTruthy();
  });

  it("shows a default empty-state message when value is empty and loading is false", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("No results found");
  });

  it("does not show the empty-state message when value has rows", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("No results found");
  });

  it("does not show the empty-state message while loading is true, even with an empty value", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("No results found");
  });

  it("preserves existing selection when loading toggles to true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selection", [{ id: 1, name: "A" }]);
    fixture.detectChanges();
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual([{ id: 1, name: "A" }]);
  });
});

describe("row expansion (Spec §5.4, GAP-044)", () => {
  interface Row { id: number; name: string }

  it("toggles a row's expanded state and renders expanded content via the expandedRowTemplate", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("expandedRowKeys", {});
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-table-row-toggle]").click();
    expect(fixture.componentInstance.expandedRowKeysChange).toBeTruthy();
  });

  it("emits onRowExpand when a row is expanded and onRowCollapse when collapsed", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    const expandEvents: unknown[] = [];
    fixture.componentInstance.onRowExpand.subscribe((e: unknown) => expandEvents.push(e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-table-row-toggle]").click();
    expect(expandEvents.length).toBe(1);
  });

  it("does not throw when dataKey maps to a duplicate value across two rows", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }, { id: 1, name: "B" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
