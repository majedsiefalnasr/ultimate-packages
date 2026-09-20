import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UProgressBar } from "./index";

describe("UProgressBar", () => {
  it("renders a determinate bar with the value width and label text", () => {
    const wrapper = mount(UProgressBar, { props: { value: 42 } });
    const value = wrapper.find(".u-progress-bar-value");
    expect(value.attributes("style")).toContain("width: 42%");
    expect(wrapper.find(".u-progress-bar-label").text()).toBe("42%");
  });

  it("hides the label when showValue is false", () => {
    const wrapper = mount(UProgressBar, { props: { value: 50, showValue: false } });
    expect(wrapper.find(".u-progress-bar-label").exists()).toBe(false);
  });

  it("renders indeterminate mode without a value/label", () => {
    const wrapper = mount(UProgressBar, { props: { mode: "indeterminate" } });
    expect(wrapper.find(".u-progress-bar-label").exists()).toBe(false);
    expect(wrapper.find(".u-progress-bar").classes()).toContain("u-progress-bar-indeterminate");
  });

  it("sets role=progressbar and aria-valuenow in determinate mode", () => {
    const wrapper = mount(UProgressBar, { props: { value: 75 } });
    const root = wrapper.find(".u-progress-bar");
    expect(root.attributes("role")).toBe("progressbar");
    expect(root.attributes("aria-valuenow")).toBe("75");
  });

  it("appends a custom unit to the value label", () => {
    const wrapper = mount(UProgressBar, { props: { value: 3, unit: " MB" } });
    expect(wrapper.find(".u-progress-bar-label").text()).toBe("3 MB");
  });
});
