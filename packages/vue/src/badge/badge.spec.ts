import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UBadge } from "./index";

describe("UBadge", () => {
  it("renders its value prop as text content when no default slot is given", () => {
    const wrapper = mount(UBadge, { props: { value: "5" } });
    expect(wrapper.text()).toBe("5");
  });

  it("renders default slot content instead of the value prop when provided", () => {
    const wrapper = mount(UBadge, {
      props: { value: "5" },
      slots: { default: "custom" },
    });
    expect(wrapper.text()).toBe("custom");
  });

  it("applies the u-badge root class", () => {
    const wrapper = mount(UBadge);
    expect(wrapper.classes()).toContain("u-badge");
  });

  it("applies u-badge-circle for a single-character value", () => {
    const wrapper = mount(UBadge, { props: { value: "5" } });
    expect(wrapper.classes()).toContain("u-badge-circle");
  });

  it("applies u-badge-dot when value is unset and no default slot is given", () => {
    const wrapper = mount(UBadge);
    expect(wrapper.classes()).toContain("u-badge-dot");
  });

  it("does not apply u-badge-dot when a default slot is given, even without a value", () => {
    const wrapper = mount(UBadge, { slots: { default: "x" } });
    expect(wrapper.classes()).not.toContain("u-badge-dot");
  });

  it("applies a severity modifier class", () => {
    const wrapper = mount(UBadge, { props: { value: "Active", severity: "success" } });
    expect(wrapper.classes()).toContain("u-badge-success");
  });

  it("applies a size modifier class", () => {
    const wrapper = mount(UBadge, { props: { value: "99+", size: "large" } });
    expect(wrapper.classes()).toContain("u-badge-lg");
  });
});
