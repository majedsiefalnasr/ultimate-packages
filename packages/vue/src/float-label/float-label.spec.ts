import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UFloatLabel } from "./index";

describe("UFloatLabel", () => {
  it("projects its default slot content (input + label)", () => {
    const wrapper = mount(UFloatLabel, {
      slots: { default: '<input id="username" type="text" /><label for="username">Username</label>' },
    });
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("label").exists()).toBe(true);
  });

  it("applies the u-float-label root class", () => {
    const wrapper = mount(UFloatLabel);
    expect(wrapper.classes()).toContain("u-float-label");
  });

  it("applies the default 'over' variant class", () => {
    const wrapper = mount(UFloatLabel);
    expect(wrapper.classes()).toContain("u-float-label-over");
  });

  it("applies the 'in' variant class when set", () => {
    const wrapper = mount(UFloatLabel, { props: { variant: "in" } });
    expect(wrapper.classes()).toContain("u-float-label-in");
  });

  it("label-float trigger is pure CSS (:has()) — root class list is stable regardless of child filled state", () => {
    const unfilled = mount(UFloatLabel, { slots: { default: '<input type="text" />' } });
    const filled = mount(UFloatLabel, { slots: { default: '<input type="text" class="u-filled" />' } });
    expect(filled.classes().sort()).toEqual(unfilled.classes().sort());
    expect(filled.find("input.u-filled").exists()).toBe(true);
  });
});
