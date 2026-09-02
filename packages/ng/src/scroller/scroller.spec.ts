import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { calculateNumItemsInViewport } from "@ultimate/uix-data";
import { UScroller } from "./scroller";

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
});
