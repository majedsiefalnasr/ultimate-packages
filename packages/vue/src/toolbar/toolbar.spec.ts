import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UToolbar } from "./index";

describe("UToolbar", () => {
  it("has role=toolbar", () => {
    const wrapper = mount(UToolbar);
    expect(wrapper.attributes("role")).toBe("toolbar");
  });

  it("renders default slot content", () => {
    const wrapper = mount(UToolbar, { slots: { default: "Plain content" } });
    expect(wrapper.text()).toContain("Plain content");
  });

  it("renders start/center/end slots", () => {
    const wrapper = mount(UToolbar, {
      slots: { start: "Start", center: "Center", end: "End" },
    });
    expect(wrapper.find(".u-toolbar-start").text()).toBe("Start");
    expect(wrapper.find(".u-toolbar-center").text()).toBe("Center");
    expect(wrapper.find(".u-toolbar-end").text()).toBe("End");
  });

  it("does not render an end wrapper when the end slot is not provided", () => {
    const wrapper = mount(UToolbar, { slots: { start: "Start" } });
    expect(wrapper.find(".u-toolbar-end").exists()).toBe(false);
  });

  it("sets aria-labelledby when provided", () => {
    const wrapper = mount(UToolbar, { props: { ariaLabelledby: "actions-heading" } });
    expect(wrapper.attributes("aria-labelledby")).toBe("actions-heading");
  });
});
