import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UCarousel } from "./index";

const items = Array.from({ length: 6 }, (_, i) => `Item ${i + 1}`);

function mountCarousel(props = {}) {
  return mount(UCarousel, {
    props: { value: items, ...props },
    slots: {
      item: (slotProps: { data: string }) => slotProps.data,
    },
  });
}

describe("UCarousel", () => {
  it("renders one item element per value entry", () => {
    const wrapper = mountCarousel();
    expect(wrapper.findAll(".u-carousel-item")).toHaveLength(6);
  });

  it("navigates forward and backward with the nav buttons", async () => {
    const wrapper = mountCarousel();
    const prevBtn = wrapper.find("button.u-carousel-prev-button");
    const nextBtn = wrapper.find("button.u-carousel-next-button");

    await nextBtn.trigger("click");
    expect(wrapper.findAll(".u-carousel-indicator")[1].attributes("data-p-active")).toBe("true");

    await prevBtn.trigger("click");
    expect(wrapper.findAll(".u-carousel-indicator")[0].attributes("data-p-active")).toBe("true");
  });

  it("disables prev on the first page when not circular", () => {
    const wrapper = mountCarousel();
    expect(wrapper.find("button.u-carousel-prev-button").attributes("disabled")).toBeDefined();
  });

  it("circular: wraps forward navigation past the last page back to the first", async () => {
    const wrapper = mountCarousel({ circular: true });
    const nextBtn = wrapper.find("button.u-carousel-next-button");
    for (let i = 0; i < items.length; i++) {
      await nextBtn.trigger("click");
    }
    expect(wrapper.findAll(".u-carousel-indicator")[0].attributes("data-p-active")).toBe("true");
  });

  it("clicking an indicator dot jumps directly to that page and emits page-change", async () => {
    const wrapper = mountCarousel();
    const dots = wrapper.findAll(".u-carousel-indicator-button");
    await dots[3].trigger("click");
    expect(wrapper.emitted("page-change")?.[0]).toEqual([{ page: 3 }]);
    expect(wrapper.emitted("update:page")?.[0]).toEqual([3]);
  });

  describe("autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("advances the page automatically at the given interval", async () => {
      const wrapper = mountCarousel({ autoplayInterval: 1000 });
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.findAll(".u-carousel-indicator")[1].attributes("data-p-active")).toBe("true");
    });

    it("stops the autoplay timer on unmount", () => {
      const wrapper = mountCarousel({ autoplayInterval: 1000 });
      wrapper.unmount();
      expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
    });
  });

  describe("aria-live on autoplay content wrapper (Spec §5.2, GAP-051)", () => {
    it("sets aria-live=polite on the content wrapper when autoplayInterval is greater than 0", () => {
      const wrapper = mountCarousel({ autoplayInterval: 3000 });
      expect(wrapper.find("[data-u-carousel-content]").attributes("aria-live")).toBe("polite");
    });

    it("sets aria-live=off (not absent) when autoplayInterval is 0 (autoplay disabled), matching real PrimeVue's own always-rendered attribute", () => {
      const wrapper = mountCarousel();
      expect(wrapper.find("[data-u-carousel-content]").attributes("aria-live")).toBe("off");
    });
  });
});
