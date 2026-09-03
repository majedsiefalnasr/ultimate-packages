import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UTable } from "./table";

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
