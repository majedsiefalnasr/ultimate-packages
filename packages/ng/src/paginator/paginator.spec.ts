import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UPaginator } from "./paginator";
import { UPaginator as RootExport } from "../index";

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

  describe("pageLinks (Global Constraints page-link algorithm)", () => {
    it("returns all pages when pageCount <= pageLinkSize", () => {
      const fixture = TestBed.createComponent(UPaginator);
      fixture.componentRef.setInput("totalRecords", 30);
      fixture.componentRef.setInput("rows", 10);
      fixture.componentRef.setInput("pageLinkSize", 5);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute("data-page-links")).toBe("1,2,3");
    });

    it("returns a pageLinkSize-wide centered window on a middle page", () => {
      const fixture = TestBed.createComponent(UPaginator);
      fixture.componentRef.setInput("totalRecords", 200);
      fixture.componentRef.setInput("rows", 10);
      fixture.componentRef.setInput("pageLinkSize", 5);
      fixture.componentRef.setInput("first", 90);
      fixture.detectChanges();
      fixture.componentInstance.changePage(90);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute("data-page-links")).toBe("8,9,10,11,12");
    });

    it("clamps the window at the last page without shrinking pageLinkSize", () => {
      const fixture = TestBed.createComponent(UPaginator);
      fixture.componentRef.setInput("totalRecords", 200);
      fixture.componentRef.setInput("rows", 10);
      fixture.componentRef.setInput("pageLinkSize", 5);
      fixture.detectChanges();
      fixture.componentInstance.changePage(190);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute("data-page-links")).toBe("16,17,18,19,20");
    });
  });

  it("renders one button per pageLinks entry, marking the current page aria-current=page", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
    // pageCount is 10 (95 records / 10 rows), but pageLinks (Task 4's approved
    // getter) windows the rendered links to pageLinkSize (default 5), not
    // pageCount — so 5 buttons render here, not 10. The plan document and
    // this task's original brief both asserted toBe(10), which contradicts
    // Task 4's already-approved windowing algorithm; corrected here per
    // human-controller decision (see task-5-report.md).
    expect(pageButtons.length).toBe(5);
    expect(pageButtons[0].getAttribute("aria-current")).toBe("page");
    expect(pageButtons[1].getAttribute("aria-current")).toBeNull();
  });

  it("clicking a page-link button navigates to that page", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
    pageButtons[2].click();
    fixture.detectChanges();
    const updatedPageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
    expect(updatedPageButtons[2].getAttribute("aria-current")).toBe("page");
  });

  it("root element is a semantic <nav>", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("nav")).not.toBeNull();
  });

  it("the <nav> is the outermost element carrying the root class, with content as a <div> nested inside it (not the reverse)", () => {
    // Regression test for the final-review finding: the template previously
    // bound the content slot's class directly onto <nav> (absorbing the
    // root slot's class onto the <u-paginator> host only), so <nav> ended
    // up wrapping the buttons without itself being the semantic root
    // matching React/Vue's shape (root <nav> wrapping a <div class="content">).
    const fixture = TestBed.createComponent(UPaginator);
    fixture.detectChanges();

    const navEls = fixture.nativeElement.querySelectorAll("nav");
    expect(navEls.length).toBe(1);
    const nav = navEls[0];

    // The content slot must live on a <div>, not on <nav> itself.
    const contentEl = fixture.nativeElement.querySelector(".u-paginator-content");
    expect(contentEl).not.toBeNull();
    expect(contentEl.tagName).toBe("DIV");
    expect(contentEl.classList.contains("u-paginator-content")).toBe(true);
    expect(nav.classList.contains("u-paginator-content")).toBe(false);

    // <nav> must be the ancestor of the content <div>, not a descendant of it.
    expect(nav.contains(contentEl)).toBe(true);
    expect(contentEl.contains(nav)).toBe(false);

    // <nav> itself carries the root slot's class, for DOM-shape parity with
    // React/Vue's root <nav class="u-paginator u-component">.
    expect(nav.classList.contains("u-paginator")).toBe(true);
  });

  it("first/prev/next/last controls have aria-label attributes", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-paginator-first]").hasAttribute("aria-label")).toBe(true);
    expect(fixture.nativeElement.querySelector("[data-u-paginator-prev]").hasAttribute("aria-label")).toBe(true);
    expect(fixture.nativeElement.querySelector("[data-u-paginator-next]").hasAttribute("aria-label")).toBe(true);
    expect(fixture.nativeElement.querySelector("[data-u-paginator-last]").hasAttribute("aria-label")).toBe(true);
  });

  it("is exported from the package root barrel", () => {
    expect(RootExport).toBe(UPaginator);
  });

  it("resolves the same paginator.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();

    // ngCoreStyleSheet's <style> elements carry no identifying attribute,
    // matching UButton's own Angular test — located by its known, unique
    // .u-paginator selector.
    const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
      (el.textContent ?? "").includes(".u-paginator {")
    );
    expect(styleEl).not.toBeUndefined();
    const ngCss = styleEl!.textContent ?? "";

    expect(ngCss).toContain("var(--u-paginator-background");
  });
});
