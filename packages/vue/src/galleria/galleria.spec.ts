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

describe("keyboard navigation, Escape, role=region (Spec §5.1, GAP-050)", () => {
  it("has role=region on the root element", () => {
    const wrapper = mountGalleria();
    expect(wrapper.find("[role=region]").exists()).toBe(true);
    wrapper.unmount();
  });

  it("ArrowRight advances to the next item", async () => {
    const wrapper = mountGalleria();
    await wrapper.find("[data-u-galleria-content]").trigger("keydown", { code: "ArrowRight" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("b.png");
    wrapper.unmount();
  });

  it("ArrowLeft goes to the previous item", async () => {
    const wrapper = mountGalleria();
    await wrapper.find("[data-u-galleria-content]").trigger("keydown", { code: "ArrowRight" });
    await wrapper.find("[data-u-galleria-content]").trigger("keydown", { code: "ArrowLeft" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("a.png");
    wrapper.unmount();
  });

  it("Home jumps to the first item, End jumps to the last", async () => {
    const wrapper = mountGalleria();
    const content = wrapper.find("[data-u-galleria-content]");
    await content.trigger("keydown", { code: "End" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("c.png");
    await content.trigger("keydown", { code: "Home" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("a.png");
    wrapper.unmount();
  });

  it("Escape closes fullscreen mode when active", async () => {
    const wrapper = mountGalleria({ fullScreen: true, fullScreenActive: true });
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-galleria-mask")).toBeTruthy();

    const content = document.querySelector("[data-u-galleria-content]") as HTMLElement;
    content.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-galleria-mask")).toBeFalsy();
    expect(wrapper.emitted("update:fullScreenActive")).toEqual([[false]]);
    wrapper.unmount();
  });

  it("Escape does nothing when fullscreen mode is not active", async () => {
    const wrapper = mountGalleria();
    const content = wrapper.find("[data-u-galleria-content]");
    await expect(content.trigger("keydown", { code: "Escape" })).resolves.not.toThrow();
    expect(wrapper.emitted("update:fullScreenActive")).toBeUndefined();
    wrapper.unmount();
  });

  it("does not navigate when ArrowLeft/ArrowRight are pressed while a focused input inside a custom item template has focus", async () => {
    const wrapper = mount(UGalleria, {
      props: { value: items },
      slots: {
        item: (slotProps: { item: string }) =>
          h("input", { class: "item-input", value: slotProps.item }),
      },
      attachTo: document.body,
    });
    const input = wrapper.find(".item-input").element as HTMLInputElement;
    input.focus();
    input.value = "typed";
    await wrapper.find(".item-input").trigger("keydown", { code: "ArrowRight" });
    expect(wrapper.emitted("update:activeIndex")).toBeUndefined();
    expect(input.value).toBe("typed");
    wrapper.unmount();
  });
});

describe("thumbnail keyboard activation (Spec §5.1, GAP-050 Task 7)", () => {
  it("makes the thumbnail focusable", () => {
    const wrapper = mountGalleria();
    const thumbnail = wrapper.find(".u-galleria-thumbnail-item");
    expect(thumbnail.attributes("tabindex")).toBe("0");
    wrapper.unmount();
  });

  it("Enter on a focused thumbnail activates it the same as a click", async () => {
    const wrapper = mountGalleria();
    const thumbnails = wrapper.findAll(".u-galleria-thumbnail-item");
    await thumbnails[2].trigger("keydown", { code: "Enter" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("c.png");
    wrapper.unmount();
  });

  it("Space on a focused thumbnail activates it the same as a click", async () => {
    const wrapper = mountGalleria();
    const thumbnails = wrapper.findAll(".u-galleria-thumbnail-item");
    await thumbnails[1].trigger("keydown", { code: "Space" });
    expect(wrapper.find(".active-item").attributes("src")).toBe("b.png");
    wrapper.unmount();
  });

  it("existing click behavior on the thumbnail is unchanged", async () => {
    const wrapper = mountGalleria();
    const thumbnails = wrapper.findAll(".u-galleria-thumbnail-item");
    await thumbnails[2].trigger("click");
    expect(wrapper.find(".active-item").attributes("src")).toBe("c.png");
    wrapper.unmount();
  });
});
