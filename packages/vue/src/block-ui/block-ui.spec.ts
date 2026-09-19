import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UBlockUI } from "./index";

describe("UBlockUI", () => {
  it("renders its slotted content and no mask when not blocked", () => {
    const wrapper = mount(UBlockUI, { slots: { default: "<p>content</p>" } });
    expect(wrapper.text()).toContain("content");
    expect(wrapper.find(".u-blockui-mask").exists()).toBe(false);
  });

  it("renders a mask when blocked is true", () => {
    const wrapper = mount(UBlockUI, { props: { blocked: true } });
    expect(wrapper.find(".u-blockui-mask").exists()).toBe(true);
  });

  it("toggles the mask visibility when blocked changes", async () => {
    const wrapper = mount(UBlockUI, { props: { blocked: false } });
    expect(wrapper.find(".u-blockui-mask").exists()).toBe(false);

    await wrapper.setProps({ blocked: true });
    expect(wrapper.find(".u-blockui-mask").exists()).toBe(true);

    await wrapper.setProps({ blocked: false });
    expect(wrapper.find(".u-blockui-mask").exists()).toBe(false);
  });

  it("sets aria-busy reflecting blocked", () => {
    const wrapper = mount(UBlockUI, { props: { blocked: true } });
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("applies the fullScreen document mask class", () => {
    const wrapper = mount(UBlockUI, { props: { blocked: true, fullScreen: true } });
    expect(wrapper.find(".u-blockui-mask-document").exists()).toBe(true);
  });

  it("emits blocked and unblocked as blocked toggles", async () => {
    const wrapper = mount(UBlockUI, { props: { blocked: false } });
    await wrapper.setProps({ blocked: true });
    expect(wrapper.emitted("blocked")).toHaveLength(1);

    await wrapper.setProps({ blocked: false });
    expect(wrapper.emitted("unblocked")).toHaveLength(1);
  });
});
