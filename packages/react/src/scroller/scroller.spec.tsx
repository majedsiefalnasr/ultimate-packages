/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { createRef } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { UScroller } from "./scroller";
import type { UScrollerHandle } from "./scroller";

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

  it("disabled mode renders all items with zero virtualization", () => {
    const { container } = render(
      <UScroller items={Array.from({ length: 50 }, (_, i) => i)} itemSize={20} disabled />
    );
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(50);
  });

  it("exposes scrollTo/scrollToIndex via ref", () => {
    const ref = createRef<UScrollerHandle>();
    const { container } = render(
      <UScroller ref={ref} items={Array.from({ length: 100 }, (_, i) => i)} itemSize={20} />
    );
    const root = container.firstChild as HTMLElement;
    const scrollToSpy = vi.fn();
    root.scrollTo = scrollToSpy;
    ref.current?.scrollToIndex(10);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
  });

  it("sets aria-busy=true on the root while loading is true", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} loading />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when loading is false or unset", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-busy")).toBeNull();
  });

  it("fires onLazyLoad with {first, last} after a scroll-triggered window change, when lazy is true, given a mocked 200px viewport", async () => {
    const onLazyLoad = vi.fn();
    const { container } = render(
      <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} lazy onLazyLoad={onLazyLoad} />
    );
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    // See the deviation note on the earlier offsetHeight test: constructing a
    // *new* ResizeObserver(() => {}) here would clobber the module-scope
    // resizeObserverCallback the mock uses, discarding the component's real
    // captured callback (same bug class hit in Tasks 3, 7, and 8's briefs).
    // Re-invoke the already-captured callback directly instead, wrapped in
    // act() because it synchronously triggers a React state update
    // (setContentSizeState) outside of React's own event handling.
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    act(() => {
      root.dispatchEvent(new Event("scroll"));
    });
    await Promise.resolve();
    // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
    // calculateLast(100, 10, 5) = 100+10+3*5=125, clamped to items.length
    // (1000) -> 125.
    expect(onLazyLoad).toHaveBeenCalledWith({ first: 100, last: 125 });
  });

  it("does not fire onLazyLoad when lazy is false", async () => {
    const onLazyLoad = vi.fn();
    const { container } = render(
      <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} onLazyLoad={onLazyLoad} />
    );
    const root = container.firstChild as HTMLElement;
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    act(() => {
      root.dispatchEvent(new Event("scroll"));
    });
    await Promise.resolve();
    expect(onLazyLoad).not.toHaveBeenCalled();
  });

  it("advances first (data-first) on a plain scroll event when lazy is not set, given a mocked 200px viewport", () => {
    const { container } = render(
      <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />
    );
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    const initialFirst = root.getAttribute("data-first");
    Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
    act(() => {
      root.dispatchEvent(new Event("scroll"));
    });
    // scrollTop=2000, itemSize=20 -> first = floor(2000/20) = 100
    expect(root.getAttribute("data-first")).toBe("100");
    expect(root.getAttribute("data-first")).not.toBe(initialFirst);
  });

  it("is exported from its own subpath index", async () => {
    const { UScroller: SubpathExport } = await import("./index");
    expect(SubpathExport).toBe(UScroller);
  });
});

describe("UScroller content template (Task 3)", () => {
  // Deviation from the brief: this describe block is a sibling of the main
  // "UScroller" describe above, not nested inside it, so it does not
  // inherit that block's beforeEach/afterEach ResizeObserver stub — every
  // UScroller render mounts the offsetHeight-measuring ResizeObserver
  // effect (scroller.tsx), which throws ReferenceError without a stub.
  // Mirroring the same stub setup here (rather than restructuring the
  // existing describe nesting, which the task's additive-only constraint
  // rules out) is the minimal fix. Also mirrors the main block's
  // mockViewportHeight helper: jsdom's default offsetHeight is 0, which
  // (via calculateNumItemsInViewport) makes the non-disabled windowed
  // visibleItems empty — the brief's literal tests assume a real, non-zero
  // viewport the way the main describe block's own windowing tests do.
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

  it("renders the consumer-supplied contentTemplate instead of the built-in item divs when provided", () => {
    const items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        contentTemplate={({ items: visible }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    expect(container.querySelector("[data-test-content-template]")).not.toBeNull();
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
    expect(container.querySelectorAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("still renders the built-in item divs when no contentTemplate is supplied (existing behavior unchanged)", () => {
    const { container } = render(<UScroller items={["a", "b", "c"]} itemSize={30} />);
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeReact's getOptions() shape", () => {
    const items = ["a", "b", "c"];
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        contentTemplate={({ items: visible, getItemOptions }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index} data-first={String(getItemOptions(entry.index).first)}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    const root = container.firstChild as HTMLElement;
    mockViewportHeight(root, 200);
    act(() => {
      resizeObserverCallback?.([{ target: root } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    });
    expect(container.querySelector("tr[data-index='0']")?.getAttribute("data-first")).toBe("true");
  });

  it("passes the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior", () => {
    const items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        disabled
        contentTemplate={({ items: visible }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    expect(container.querySelectorAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether contentTemplate is supplied", () => {
    const { container } = render(
      <UScroller
        items={["a", "b"]}
        itemSize={30}
        loading
        contentTemplate={() => <table data-test-content-template />}
      />
    );
    expect(container.querySelector(".u-scroller-loader")).not.toBeNull();
    expect(container.querySelector("[data-test-content-template]")).not.toBeNull();
  });
});
