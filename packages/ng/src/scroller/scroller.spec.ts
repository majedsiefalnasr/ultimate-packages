import { Component, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { calculateNumItemsInViewport } from "@ultimate/uix-data";
import { UScroller } from "./scroller";
import { UScroller as RootExport } from "../index";

describe("UScroller", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  // Shared by every test below that needs a non-zero measured viewport
  // (Task 3's own tests, and Task 4/5's scrollTo/lazy-load tests).
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
          // Synchronously invoke once, matching a real ResizeObserver's
          // initial-observation callback, so tests don't need to await a
          // real resize event loop.
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

  it("computes numItemsInViewport via uix-data's calculateNumItemsInViewport, wired to the real shared function", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    // contentSize is a fixed 0 until Task 3's real DOM measurement lands, so
    // calculateNumItemsInViewport(0, 20) is a real, computable, deterministic
    // result — asserting the actual expected number, not merely that the
    // component's calculateNumItemsInViewport import was called at all, is
    // what proves genuine wiring to the shared uix-data function rather than
    // a hardcoded stand-in value.
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-num-items-in-viewport")).toBe(
      String(calculateNumItemsInViewport(0, 20))
    );
  });

  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 5 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.componentRef.setInput("numToleratedItems", 50); // deliberately large tolerance
    fixture.detectChanges();
    // calculateLast's raw output would exceed 5 with a tolerance this large;
    // getLast must clamp it down to the live items.length.
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", []);
    fixture.detectChanges();
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-last")).toBe("0");
  });

  it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeNG's measured element/property", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges(); // triggers ngAfterViewInit, but offsetHeight is still 0 pre-mock
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200); // a real, deterministic 200px viewport
    // This project is zoneless with signal-driven OnPush change detection
    // (see packages/ng-core/src/overlay/overlay.spec.ts): mutating
    // offsetHeight via Object.defineProperty is a plain DOM/property
    // mutation invisible to Angular's signal graph, so it does not by
    // itself cause a re-check. Re-invoking the mocked ResizeObserver
    // callback simulates the real browser firing it on an actual resize,
    // which is what drives UScroller's internal _contentSize signal.
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    // 200 / 20 = 10 whole items fit exactly — asserting the real computed
    // number, not just that some non-zero value exists.
    expect(root.getAttribute("data-num-items-in-viewport")).toBe("10");
  });

  it("renders only the windowed subset of items (first through last), not the full array, given a mocked 200px viewport", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    // See the zoneless/signal note in the previous test.
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    const renderedItems = fixture.nativeElement.querySelectorAll("[data-u-scroller-item]");
    // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
    // calculateLast(0, 10, 5) = 0 + 10 + 2*5 = 20 (first < numToleratedItems
    // branch), clamped to items.length (1000) -> 20.
    expect(renderedItems.length).toBe(20);
    expect(renderedItems.length).toBeLessThan(1000);
  });

  it("advances first/last on scroll, given a mocked 200px viewport", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    // See the zoneless/signal note above.
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    const initialFirst = root.getAttribute("data-first");
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    root.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    // scrollTop=2000, itemSize=20 -> first = floor(2000/20) = 100
    expect(root.getAttribute("data-first")).toBe("100");
    expect(root.getAttribute("data-first")).not.toBe(initialFirst);
  });

  it("renders loader markup with .u-scroller-loader when loading is true", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-scroller-loader")).not.toBeNull();
  });

  it("does not render loader markup when loading is false or unset", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-scroller-loader")).toBeNull();
  });

  it("scrollTo calls the native Element.scrollTo with the given options", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[data-u-scroller-content]").parentElement as HTMLElement;
    const scrollToSpy = vi.fn();
    root.scrollTo = scrollToSpy;
    fixture.componentInstance.scrollTo({ top: 100 });
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 100 });
  });

  it("scrollToIndex computes the target position from index * itemSize", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[data-u-scroller-content]").parentElement as HTMLElement;
    const scrollToSpy = vi.fn();
    root.scrollTo = scrollToSpy;
    fixture.componentInstance.scrollToIndex(10);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
  });

  it("disabled mode renders all items with zero virtualization", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 50 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    const renderedItems = fixture.nativeElement.querySelectorAll("[data-u-scroller-item]");
    expect(renderedItems.length).toBe(50);
  });

  it("fires onLazyLoad with {first, last} after a scroll-triggered window change, when lazy is true", async () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.componentRef.setInput("lazy", true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    // See the zoneless/signal note above: offsetHeight mutation alone is
    // invisible to Angular's signal graph, so the mocked ResizeObserver
    // callback must be re-invoked to actually update _contentSize (and thus
    // numItemsInViewportComputed, which last/onLazyLoad's payload depends on).
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.onLazyLoad.subscribe((e: unknown) => (emitted = e));
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    root.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    await Promise.resolve(); // matches the real Promise.resolve().then() deferral, spec §10
    // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
    // calculateLast(100, 10, 5) = 100+10+3*5=125 (first >= numToleratedItems
    // branch), clamped to items.length (1000) -> 125.
    expect(emitted).toEqual({ first: 100, last: 125 });
  });

  it("does not fire onLazyLoad when lazy is false", async () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.onLazyLoad.subscribe((e: unknown) => (emitted = e));
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    root.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    await Promise.resolve();
    expect(emitted).toBeUndefined();
  });

  it("sets aria-busy=true on the root while loading is true", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[class*=u-scroller]").getAttribute("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when loading is false or unset", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[class*=u-scroller]").hasAttribute("aria-busy")).toBe(false);
  });

  it("resolves the same virtualscroller.loader.mask.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
      (el.textContent ?? "").includes(".u-scroller-loader {")
    );
    expect(styleEl).not.toBeUndefined();
    const ngCss = styleEl!.textContent ?? "";

    expect(ngCss).toContain("var(--u-virtualscroller-loader-mask-background");
  });
});

describe("package exports", () => {
  it("is exported from the package root barrel", () => {
    expect(RootExport).toBe(UScroller);
  });
});

@Component({
  standalone: true,
  imports: [UScroller],
  template: `
    <u-scroller [items]="items" [itemSize]="30" [loading]="loading" [disabled]="disabled">
      <ng-template #content let-visibleItems let-options="options">
        <table data-test-content-template>
          <tbody>
            @for (item of visibleItems; track item.index) {
              <tr [attr.data-index]="item.index" [attr.data-first]="options.getItemOptions(item.index).first">
                <td>{{ item.value }}</td>
              </tr>
            }
          </tbody>
        </table>
      </ng-template>
    </u-scroller>
  `,
})
class ContentTemplateHostComponent {
  items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
  loading = false;
  disabled = false;
  @ViewChild(UScroller) scroller!: UScroller;
}

describe("UScroller content template (Task 1)", () => {
  // ResizeObserver is not implemented in jsdom; UScroller's ngAfterViewInit
  // constructs one unconditionally (see the top-level "UScroller" describe
  // block's identical stub above). This describe block is a sibling, not a
  // nested block, so it needs its own stub rather than inheriting that one.
  // The callback is captured (not auto-invoked on observe()) so tests can
  // mock a non-zero offsetHeight first, then re-invoke it — matching the
  // top-level describe block's own zoneless/signal-update pattern, needed
  // here because the non-disabled windowed path renders zero rows at the
  // default zero-height jsdom viewport.
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

  it("renders the consumer-supplied content template instead of the built-in item divs when #content is provided", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-test-content-template]")).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("renders the actual nested table > tbody > tr > td DOM structure, not just element presence (direct-child scoping, not flat selector counts)", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector("table[data-test-content-template]") as HTMLTableElement;
    expect(table).not.toBeNull();
    const tbody = table.querySelector("tbody");
    expect(tbody).not.toBeNull();
    expect(tbody?.parentElement).toBe(table);

    const rows = tbody!.querySelectorAll(":scope > tr");
    // numItemsInViewport=200/30=7 (rounded), numToleratedItems=ceil(7/2)=4,
    // calculateLast(0, 7, 4)=0+7+2*4=15, clamped to items.length (50) -> 15.
    expect(rows.length).toBe(15);
    expect(rows.length).toBeLessThan(50);
    rows.forEach((row) => {
      expect(row.querySelector(":scope > td")).not.toBeNull();
    });
  });

  it("still renders the built-in item divs when no #content template is supplied (existing behavior unchanged)", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", ["a", "b", "c"]);
    fixture.componentRef.setInput("itemSize", 30);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real options.getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeNG's getOptions() shape", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(root, 200);
    resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector("tr[data-index='0']");
    expect(firstRow.getAttribute("data-first")).toBe("true");
  });

  it("dispatches the content template with the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior (spec: no reduced/empty list)", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether a content template is supplied", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-scroller-loader")).not.toBeNull();
    // The content template itself still renders alongside the loader — this
    // plan does not suppress one for the other, matching real upstream's
    // structurally-independent loader/content-dispatch regions.
    expect(fixture.nativeElement.querySelector("[data-test-content-template]")).not.toBeNull();
  });
});
