/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { UScroller } from "./scroller";

describe("UScroller", () => {
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
    cleanup();
  });

  function mockViewportHeight(element: HTMLElement, height: number): void {
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
  }

  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const { container } = render(
      <UScroller items={Array.from({ length: 5 }, (_, i) => i)} itemSize={20} numToleratedItems={50} />
    );
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} />);
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("0");
  });

  it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeReact's measured element/property", () => {
    const { container, rerender } = render(
      <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />
    );
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    rerender(<UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />);
    // The ResizeObserver mock's synchronous observe() callback fires once on
    // mount, before offsetHeight is stubbed post-render — a real re-render
    // does not by itself re-measure (the component's effect has an empty
    // dependency array, so it does not re-run on rerender). Re-invoking the
    // *component's own* captured resizeObserverCallback simulates a real
    // browser firing the observer again on an actual resize, which is what
    // drives UScroller's internal contentSizeState.
    //
    // Deviation from the brief: the brief's literal example constructs a
    // *new* ResizeObserver(() => {}) and calls .observe(root) on it. The
    // mock's `resizeObserverCallback` is a single module-scope variable
    // shared by every instance, so that `new ResizeObserver(...)`
    // constructor call overwrites it with the test's own no-op callback
    // before .observe() invokes it — silently discarding the component's
    // real setContentSizeState callback captured at mount. This mirrors the
    // exact brief-test bug Task 3 (Angular) hit and fixed by re-invoking the
    // captured resizeObserverCallback directly instead of constructing a new
    // observer (see packages/ng/src/scroller/scroller.spec.ts:95). The call
    // is wrapped in act() because it synchronously triggers a React state
    // update (setContentSizeState) outside of React's own event handling.
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    expect(root.getAttribute("data-num-items-in-viewport")).toBe("10");
  });

  it("renders only the windowed subset of items, not the full array, given a mocked 200px viewport", () => {
    const { container } = render(<UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />);
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    // See the deviation note on the preceding test: re-invoke the
    // component's captured resizeObserverCallback directly rather than
    // constructing a new ResizeObserver, which would clobber it.
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    const renderedItems = container.querySelectorAll("[data-u-scroller-item]");
    // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
    // calculateLast(0, 10, 5) = 0+10+2*5=20, clamped to items.length (1000) -> 20.
    expect(renderedItems.length).toBe(20);
  });

  it("renders loader markup with .u-scroller-loader when loading is true", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} loading />);
    expect(container.querySelector(".u-scroller-loader")).not.toBeNull();
  });

  it("does not render loader markup when loading is false or unset", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} />);
    expect(container.querySelector(".u-scroller-loader")).toBeNull();
  });
});
