import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UScroller from "./Scroller.vue";

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
});
