import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UTable } from "./table";
import { UTable as RootExport } from "../index";

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

describe("package export", () => {
  it("is exported from the package root barrel", () => {
    // import added at top of file: import { UTable as RootExport } from "../index";
    expect(RootExport).toBe(UTable);
  });
});
