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
