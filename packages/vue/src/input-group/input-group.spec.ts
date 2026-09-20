import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputGroup, UInputGroupAddon } from "./index";

describe("UInputGroup", () => {
  it("projects addons and an input via its default slot", () => {
    const wrapper = mount(UInputGroup, {
      global: { components: { UInputGroupAddon } },
      slots: {
        default: '<UInputGroupAddon>$</UInputGroupAddon><input type="text" /><UInputGroupAddon>.00</UInputGroupAddon>',
      },
    });
    expect(wrapper.findAllComponents(UInputGroupAddon)).toHaveLength(2);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("applies the u-input-group root class", () => {
    const wrapper = mount(UInputGroup);
    expect(wrapper.classes()).toContain("u-input-group");
  });
});

describe("UInputGroupAddon", () => {
  it("renders slot content and applies the u-input-group-addon root class", () => {
    const wrapper = mount(UInputGroupAddon, { slots: { default: "$" } });
    expect(wrapper.classes()).toContain("u-input-group-addon");
    expect(wrapper.text()).toBe("$");
  });
});
