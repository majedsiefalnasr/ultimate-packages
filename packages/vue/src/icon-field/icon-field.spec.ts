import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UIconField, UInputIcon } from "./index";

describe("UIconField", () => {
  it("projects its default slot content (icon + input)", () => {
    const wrapper = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<UInputIcon>search</UInputIcon><input type="text" />' },
    });
    expect(wrapper.findComponent(UInputIcon).exists()).toBe(true);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("applies the u-icon-field root class", () => {
    const wrapper = mount(UIconField);
    expect(wrapper.classes()).toContain("u-icon-field");
  });

  it("positions the icon leading/trailing via DOM order — root has no per-position class", () => {
    const leading = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<UInputIcon>search</UInputIcon><input type="text" />' },
    });
    const trailing = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<input type="text" /><UInputIcon>search</UInputIcon>' },
    });
    expect(trailing.classes().sort()).toEqual(leading.classes().sort());
    expect(leading.element.firstElementChild?.classList.contains("u-input-icon")).toBe(true);
    expect(trailing.element.lastElementChild?.classList.contains("u-input-icon")).toBe(true);
  });
});

describe("UInputIcon", () => {
  it("renders its default slot, applies the u-input-icon root class, and is aria-hidden", () => {
    const wrapper = mount(UInputIcon, { slots: { default: "search" } });
    expect(wrapper.classes()).toContain("u-input-icon");
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.text()).toBe("search");
  });
});
