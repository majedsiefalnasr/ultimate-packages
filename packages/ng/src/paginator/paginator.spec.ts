import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UPaginator } from "./paginator";

describe("UPaginator", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("computes pageCount via uix-data's getPageCount, not a re-inlined formula", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page-count")).toBe("10");
  });

  it("computes pageCount as 0 when rows is 0 (getPageCount's zero-guard)", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page-count")).toBe("0");
  });

  it("advances first/page when changePage is called with a valid offset", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    fixture.componentInstance.changePage(20);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page")).toBe("2");
  });

  it("emits onPageChange with {page, first, rows, pageCount} on changePage", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.onPageChange.subscribe((e: unknown) => (emitted = e));
    fixture.componentInstance.changePage(20);
    expect(emitted).toEqual({ page: 2, first: 20, rows: 10, pageCount: 10 });
  });

  it("internal first advances even before the parent updates its bound [first] input", () => {
    // Verifies the Angular-specific finding from spec §8: the component's own
    // _first is the source of truth for rendering between parent updates.
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("first", 0);
    fixture.detectChanges();
    fixture.componentInstance.changePage(20);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page")).toBe("2");
    // Parent has NOT re-bound [first] yet — internal state still reflects the click.
  });

  it("reconciles internal first from a new bound [first] input via ngOnChanges", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("first", 0);
    fixture.detectChanges();
    fixture.componentRef.setInput("first", 30);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page")).toBe("3");
  });
});
