import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UDataView } from "./data-view";

type Item = { name: string; score: number };
const items: Item[] = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];

function setup() {
  const fixture = TestBed.createComponent(UDataView<Item>);
  fixture.componentRef.setInput("value", items);
  fixture.componentRef.setInput(
    "itemTemplate",
    (item: Item, layout: string) => layout + ":" + item.name
  );
  fixture.detectChanges();
  return fixture;
}

function names(fixture: ReturnType<typeof setup>): string[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll(".u-data-view-list > li"),
    (node: Element) => node.textContent?.replace("list:", "") ?? ""
  );
}

describe("UDataView", () => {
  it("switches between real list and grid branches", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain(
      "list:Apple"
    );
    fixture.componentRef.setInput("layout", "grid");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list")).toBeNull();
    expect(fixture.nativeElement.querySelector(".u-data-view-grid").textContent).toContain(
      "grid:Apple"
    );
  });

  it("updates the rendered window through real UPaginator events and later first changes", () => {
    const fixture = setup();
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 2);
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple", "Banana"]);
    fixture.nativeElement.querySelector("[data-u-paginator-next]").click();
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Cherry"]);
    fixture.componentRef.setInput("first", 0);
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple", "Banana"]);
  });

  it("sorts a copied array before paging", () => {
    const fixture = setup();
    fixture.componentRef.setInput("sortField", "score");
    fixture.componentRef.setInput("sortOrder", -1);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 2);
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple", "Cherry"]);
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });

  it.each([
    ["contains", "name", "pp", ["Apple"]],
    ["startsWith", "name", "Ba", ["Banana"]],
    ["endsWith", "name", "rry", ["Cherry"]],
    ["equals", "name", "apple", ["Apple"]],
    ["notEquals", "name", "apple", ["Banana", "Cherry"]],
    ["in", "name", ["Apple", "Cherry"], ["Apple", "Cherry"]],
    ["lt", "score", 2, ["Banana"]],
    ["lte", "score", 2, ["Banana", "Cherry"]],
    ["gt", "score", 2, ["Apple"]],
    ["gte", "score", 2, ["Apple", "Cherry"]],
  ] as const)("filters with %s", (mode, field, query, expected) => {
    const fixture = setup();
    fixture.componentRef.setInput("filterBy", field);
    fixture.componentInstance.filter(query, mode);
    fixture.detectChanges();
    expect(names(fixture)).toEqual(expected);
  });

  it("filters multiple fields, resets paging, and derives the filtered count", () => {
    const fixture = setup();
    fixture.componentRef.setInput("filterBy", "name,score");
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 1);
    fixture.componentRef.setInput("first", 2);
    fixture.detectChanges();
    fixture.componentInstance.filter("Apple");
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple"]);
    expect(fixture.nativeElement.querySelector("u-paginator").getAttribute("data-page-count")).toBe(
      "1"
    );
  });

  it("uses the requested locale for case-insensitive filtering", () => {
    const fixture = setup();
    fixture.componentRef.setInput("value", [{ name: "Istanbul", score: 1 }]);
    fixture.componentRef.setInput("filterBy", "name");
    fixture.componentRef.setInput("filterLocale", "tr");
    fixture.componentInstance.filter("ıst");
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Istanbul"]);
  });

  it("renders a lazy server page without slicing again and emits requests", () => {
    const fixture = setup();
    const request = vi.fn();
    fixture.componentInstance.onLazyLoad.subscribe(request);
    fixture.componentRef.setInput("lazy", true);
    fixture.componentRef.setInput("first", 20);
    fixture.componentRef.setInput("rows", 2);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("totalRecords", 100);
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple", "Banana", "Cherry"]);
    expect(request).toHaveBeenCalledWith({ first: 20, rows: 2, sortField: "", sortOrder: 1 });
  });

  it("owns paginator placement, page-size control, and report", () => {
    const fixture = setup();
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("paginatorPosition", "both");
    fixture.componentRef.setInput("rows", 2);
    fixture.componentRef.setInput("rowsPerPageOptions", [1, 2]);
    fixture.componentRef.setInput("currentPageReportTemplate", "{first}-{last}/{totalRecords}");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("u-paginator")).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('[aria-live="polite"]').textContent).toBe("1-2/3");
    const pageChange = vi.fn();
    fixture.componentInstance.pageChange.subscribe(pageChange);
    const select = fixture.nativeElement.querySelector("select") as HTMLSelectElement;
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(names(fixture)).toEqual(["Apple"]);
    expect(pageChange).toHaveBeenCalledWith({ first: 0, rows: 1, page: 0, pageCount: 3 });
  });

  it("renders loading and empty state", () => {
    const fixture = setup();
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("No results found");
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
