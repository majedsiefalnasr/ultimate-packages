import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { UScrollTop } from "./index";

function setScrollY(value: number) {
  Object.defineProperty(window, "pageYOffset", { value, configurable: true });
}

describe("UScrollTop", () => {
  afterEach(() => {
    setScrollY(0);
  });

  it("is hidden below the scroll threshold", () => {
    const wrapper = mount(UScrollTop, { props: { threshold: 100 } });
    expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(false);
  });

  it("becomes visible once window scroll exceeds the threshold", async () => {
    const wrapper = mount(UScrollTop, { props: { threshold: 100 } });
    setScrollY(200);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(true);
  });

  it("emits show when crossing the threshold and scrolls to top on click", async () => {
    const wrapper = mount(UScrollTop, { props: { threshold: 50 } });
    setScrollY(100);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("show")).toHaveLength(1);

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy;
    await wrapper.findComponent({ name: "UButton" }).trigger("click");
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("respects a custom behavior value", async () => {
    const wrapper = mount(UScrollTop, { props: { threshold: 10, behavior: "auto" } });
    setScrollY(50);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy;
    await wrapper.findComponent({ name: "UButton" }).trigger("click");
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("emits hide when scrolling back below threshold", async () => {
    const wrapper = mount(UScrollTop, { props: { threshold: 50 } });
    setScrollY(100);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(true);

    setScrollY(0);
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("hide")).toHaveLength(1);
    expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(false);
  });
});
