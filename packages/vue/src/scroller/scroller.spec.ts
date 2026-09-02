import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import UScroller from "./Scroller.vue";

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

describe("UScroller", () => {
  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 5 }, (_, i) => i), itemSize: 20, numToleratedItems: 50 },
    });
    expect(wrapper.attributes("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20 } });
    expect(wrapper.attributes("data-last")).toBe("0");
  });

  it("initializes internal first/last/numItemsInViewport as reactive data, not props", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
    });
    expect(typeof (wrapper.vm as unknown as { first: number }).first).toBe("number");
    // Confirms these are NOT props: the component definition below has no
    // `first`/`last`/`numItemsInViewport` entries in its `props` object.
    expect((wrapper.vm.$options as { props?: Record<string, unknown> }).props?.first).toBeUndefined();
  });

  it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeVue's measured element/property", async () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
    });
    mockViewportHeight(wrapper.element as HTMLElement, 200);
    // Re-invoke the component's own captured ResizeObserver callback (rather
    // than constructing a fresh `new ResizeObserver(...)`, which would
    // silently overwrite the single module-scope `resizeObserverCallback`
    // slot and discard the component's real captured callback — see the
    // deviation note in the task report).
    resizeObserverCallback?.(
      [{ target: wrapper.element } as ResizeObserverEntry],
      {} as unknown as ResizeObserver
    );
    await wrapper.vm.$nextTick();
    // 200 / 20 = 10 whole items fit exactly.
    expect(wrapper.attributes("data-num-items-in-viewport")).toBe("10");
  });

  it("renders only the windowed subset of items, not the full array, given a mocked 200px viewport", async () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
    });
    mockViewportHeight(wrapper.element as HTMLElement, 200);
    resizeObserverCallback?.(
      [{ target: wrapper.element } as ResizeObserverEntry],
      {} as unknown as ResizeObserver
    );
    await wrapper.vm.$nextTick();
    const renderedItems = wrapper.findAll("[data-u-scroller-item]");
    // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
    // calculateLast(0, 10, 5) = 0+10+2*5=20, clamped to items.length (1000) -> 20.
    expect(renderedItems.length).toBe(20);
  });

  it("scrollTo calls the native Element.scrollTo with the given options", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
    });
    const scrollToSpy = vi.fn();
    wrapper.element.scrollTo = scrollToSpy;
    (wrapper.vm as unknown as { scrollTo: (o: ScrollToOptions) => void }).scrollTo({ top: 100 });
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 100 });
  });

  it("scrollToIndex computes the target position from index * itemSize", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
    });
    const scrollToSpy = vi.fn();
    wrapper.element.scrollTo = scrollToSpy;
    (wrapper.vm as unknown as { scrollToIndex: (i: number) => void }).scrollToIndex(10);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
  });

  it("disabled mode renders all items with zero virtualization", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 50 }, (_, i) => i), itemSize: 20, disabled: true },
    });
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(50);
  });

  it("renders loader markup with .u-scroller-loader when loading is true", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });
    expect(wrapper.find(".u-scroller-loader").exists()).toBe(true);
  });

  it("does not render loader markup when loading is false or unset", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20 } });
    expect(wrapper.find(".u-scroller-loader").exists()).toBe(false);
  });
});
