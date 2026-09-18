import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UIftaLabel } from "./index";

describe("UIftaLabel", () => {
  it("projects its default slot content (input + label)", () => {
    const wrapper = mount(UIftaLabel, {
      slots: { default: '<input id="username" type="text" /><label for="username">Username</label>' },
    });
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("label").exists()).toBe(true);
  });

  it("applies the u-ifta-label root class", () => {
    const wrapper = mount(UIftaLabel);
    expect(wrapper.classes()).toContain("u-ifta-label");
  });

  it("label-position trigger is pure CSS (:has()) — root class list is stable regardless of child filled state", () => {
    const unfilled = mount(UIftaLabel, { slots: { default: '<input type="text" />' } });
    const filled = mount(UIftaLabel, { slots: { default: '<input type="text" class="u-filled" />' } });
    expect(filled.classes().sort()).toEqual(unfilled.classes().sort());
    expect(filled.find("input.u-filled").exists()).toBe(true);
  });
});
