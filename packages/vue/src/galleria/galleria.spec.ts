import { h } from "vue";
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UGalleria } from "./index";

function flushMacrotask() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const items = ["a.png", "b.png", "c.png"];

function mountGalleria(props = {}) {
  return mount(UGalleria, {
    props: { value: items, ...props },
    slots: {
      item: (slotProps: { item: string }) =>
        h("img", { class: "active-item", src: slotProps.item }),
    },
    attachTo: document.body,
  });
}

describe("UGalleria", () => {
  it("renders the active item via the item slot", () => {
    const wrapper = mountGalleria();
    expect(wrapper.find(".active-item").attributes("src")).toBe("a.png");
    wrapper.unmount();
  });

  it("renders a thumbnail per item", () => {
    const wrapper = mountGalleria();
    expect(wrapper.findAll(".u-galleria-thumbnail-item")).toHaveLength(3);
    wrapper.unmount();
  });

  it("navigates forward and backward via the nav buttons", async () => {
    const wrapper = mountGalleria();
    await wrapper.find(".u-galleria-next-button").trigger("click");
    expect(wrapper.find(".active-item").attributes("src")).toBe("b.png");
    await wrapper.find(".u-galleria-prev-button").trigger("click");
    expect(wrapper.find(".active-item").attributes("src")).toBe("a.png");
    wrapper.unmount();
  });

  it("disables prev at the first item and next at the last item when not circular", async () => {
    const wrapper = mountGalleria();
    expect(wrapper.find(".u-galleria-prev-button").attributes("disabled")).toBeDefined();
    await wrapper.find(".u-galleria-next-button").trigger("click");
    await wrapper.find(".u-galleria-next-button").trigger("click");
    expect(wrapper.find(".u-galleria-next-button").attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });

  it("wraps around when circular", async () => {
    const wrapper = mountGalleria({ circular: true });
    await wrapper.find(".u-galleria-prev-button").trigger("click");
    expect(wrapper.find(".active-item").attributes("src")).toBe("c.png");
    wrapper.unmount();
  });

  it("jumps to an item when its thumbnail is clicked", async () => {
    const wrapper = mountGalleria();
    const thumbnails = wrapper.findAll(".u-galleria-thumbnail-item");
    await thumbnails[2].trigger("click");
    expect(wrapper.find(".active-item").attributes("src")).toBe("c.png");
    wrapper.unmount();
  });

  it("emits update:activeIndex when navigating", async () => {
    const wrapper = mountGalleria();
    await wrapper.find(".u-galleria-next-button").trigger("click");
    expect(wrapper.emitted("update:activeIndex")).toEqual([[1]]);
    wrapper.unmount();
  });

  it("autoplays through items on an interval", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mountGalleria({ autoplayInterval: 1000 });
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".active-item").attributes("src")).toBe("b.png");
      wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not render a fullscreen mask by default", () => {
    const wrapper = mountGalleria();
    expect(document.querySelector(".u-galleria-mask")).toBeFalsy();
    wrapper.unmount();
  });

  it("opens and closes the fullscreen overlay when fullScreenActive is set", async () => {
    const wrapper = mountGalleria({ fullScreen: true, fullScreenActive: true });
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-galleria-mask")).toBeTruthy();

    const closeBtn = document.querySelector(".u-galleria-close-button") as HTMLElement;
    closeBtn.click();
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-galleria-mask")).toBeFalsy();
    expect(wrapper.emitted("update:fullScreenActive")).toEqual([[false]]);
    wrapper.unmount();
  });
});
