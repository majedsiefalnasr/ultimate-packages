import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
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

  it("emits lazy-load with {first, last} after a scroll-triggered window change, when lazy is true, given a mocked 200px viewport", async () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20, lazy: true },
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
    Object.defineProperty(wrapper.element, "scrollTop", { value: 2000, writable: true, configurable: true });
    await wrapper.trigger("scroll");
    await Promise.resolve(); // matches the real Promise.resolve().then() deferral, spec §10
    // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
    // calculateLast(100, 10, 5) = 100+10+3*5=125, clamped to items.length
    // (1000) -> 125.
    expect(wrapper.emitted("lazy-load")).toBeTruthy();
    expect(wrapper.emitted("lazy-load")![0][0]).toEqual({ first: 100, last: 125 });
  });

  it("does not emit lazy-load when lazy is false", async () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
    });
    Object.defineProperty(wrapper.element, "scrollTop", { value: 2000, writable: true, configurable: true });
    await wrapper.trigger("scroll");
    await Promise.resolve();
    expect(wrapper.emitted("lazy-load")).toBeFalsy();
  });

  it("sets aria-busy=true on the root while loading is true", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when loading is false or unset", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20 } });
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  it("is exported from its own subpath index", async () => {
    // The brief's own example test destructures a `default` export from
    // "./index", but this package's own established sibling pattern (see
    // button/checkbox/dialog/menu's index.ts + spec.ts files) — and the
    // brief's own Step 3 implementation code
    // (`export { default as UScroller } from "./Scroller.vue"`) — both use
    // a *named* export (`UScroller`), not a `default` re-export. Matching
    // the real, consistent convention here rather than the brief's buggy
    // test line.
    const { UScroller: SubpathExport } = await import("./index");
    expect(SubpathExport).toBe(UScroller);
  });
});

describe("UScroller content template (Task 5)", () => {
  it("renders the consumer-supplied #content slot instead of the built-in item divs when provided", () => {
    const wrapper = mount(UScroller, {
      // disabled:true guarantees a non-empty visibleItems without mocking
      // the viewport's offsetHeight (jsdom defaults it to 0, which would
      // otherwise make the windowed `last` compute to 0 for this bare
      // mount — see the sibling "renders only the windowed subset" test
      // above, which mocks the viewport instead because it's specifically
      // testing windowing). This test is about slot composition, not
      // windowing math, so disabled:true is the more direct fixture.
      props: { items: Array.from({ length: 50 }, (_, i) => `Row ${i}`), itemSize: 30, disabled: true },
      slots: {
        content: (slotProps: { items: { index: number; value: unknown }[] }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) =>
                  h("tr", { key: entry.index, "data-index": entry.index }, [h("td", {}, String(entry.value))])
                )
              ),
            ]
          ),
      },
    });
    expect(wrapper.find("[data-test-content-template]").exists()).toBe(true);
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(0);
    expect(wrapper.findAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("still renders the built-in item divs when no #content slot is supplied (existing behavior unchanged)", () => {
    // disabled:true for the same reason as above: this test is about the
    // fallback-content mechanism, not windowing, and a bare mount's
    // jsdom-default 0 offsetHeight would otherwise make visibleItems empty.
    const wrapper = mount(UScroller, { props: { items: ["a", "b", "c"], itemSize: 30, disabled: true } });
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeVue's getOptions() shape", () => {
    const wrapper = mount(UScroller, {
      props: { items: ["a", "b", "c"], itemSize: 30, disabled: true },
      slots: {
        content: (slotProps: {
          items: { index: number; value: unknown }[];
          getItemOptions: (index: number) => { first: boolean };
        }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) =>
                  h(
                    "tr",
                    { key: entry.index, "data-index": entry.index, "data-first": String(slotProps.getItemOptions(entry.index).first) },
                    [h("td", {}, String(entry.value))]
                  )
                )
              ),
            ]
          ),
      },
    });
    expect(wrapper.find("tr[data-index='0']").attributes("data-first")).toBe("true");
  });

  it("passes the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 50 }, (_, i) => `Row ${i}`), itemSize: 30, disabled: true },
      slots: {
        content: (slotProps: { items: { index: number; value: unknown }[] }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) => h("tr", { key: entry.index, "data-index": entry.index }, [h("td", {}, String(entry.value))]))
              ),
            ]
          ),
      },
    });
    expect(wrapper.findAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether #content is supplied", () => {
    const wrapper = mount(UScroller, {
      props: { items: ["a", "b"], itemSize: 30, loading: true },
      slots: { content: () => h("table", { "data-test-content-template": true }) },
    });
    expect(wrapper.find(".u-scroller-loader").exists()).toBe(true);
    expect(wrapper.find("[data-test-content-template]").exists()).toBe(true);
  });
});
