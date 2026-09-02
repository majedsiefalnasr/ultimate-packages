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
});
