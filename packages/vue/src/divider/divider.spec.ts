import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UDivider } from "./index";

describe("UDivider", () => {
  it("renders default slot content", () => {
    const wrapper = mount(UDivider, { slots: { default: "OR" } });
    expect(wrapper.find(".u-divider-content").text()).toBe("OR");
  });

  it("defaults to horizontal layout", () => {
    const wrapper = mount(UDivider);
    const root = wrapper.find(".u-divider");
    expect(root.classes()).toContain("u-divider-horizontal");
    expect(root.attributes("aria-orientation")).toBe("horizontal");
    expect(root.attributes("role")).toBe("separator");
  });

  it("applies vertical layout when specified", () => {
    const wrapper = mount(UDivider, { props: { layout: "vertical" } });
    const root = wrapper.find(".u-divider");
    expect(root.classes()).toContain("u-divider-vertical");
    expect(root.attributes("aria-orientation")).toBe("vertical");
  });

  it("does not render a content wrapper without a default slot", () => {
    const wrapper = mount(UDivider);
    expect(wrapper.find(".u-divider-content").exists()).toBe(false);
  });
});
