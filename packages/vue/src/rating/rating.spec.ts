import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { URating } from "./index";

describe("URating", () => {
  it("wraps each star's radio input in the shared u-hidden-accessible class (GAP-074)", () => {
    const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
    expect(wrapper.findAll(".u-hidden-accessible input[type=radio]").length).toBeGreaterThan(0);
    expect(wrapper.find(".p-hidden-accessible").exists()).toBe(false);
  });

  it("renders one option per star", () => {
    const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
    expect(wrapper.findAll('input[type="radio"]').length).toBe(5);
  });

  it("clicking a star emits update:modelValue with that star's value", async () => {
    const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[2].trigger("change");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
  });

  it("clicking the already-selected star clears it", async () => {
    const wrapper = mount(URating, { props: { modelValue: 3, stars: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[2].trigger("change");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
  });

  it("ArrowRight/ArrowDown steps to the next star, wrapping past the max", async () => {
    const wrapper = mount(URating, { props: { modelValue: 3, stars: 3 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[2].trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([1]);
  });

  it("ArrowLeft/ArrowUp steps to the previous star", async () => {
    const wrapper = mount(URating, { props: { modelValue: 3, stars: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[2].trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([2]);
  });

  it("readonly prevents value changes", async () => {
    const wrapper = mount(URating, { props: { modelValue: 2, stars: 5, readonly: true } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[4].trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("disabled state disables every radio input", () => {
    const wrapper = mount(URating, { props: { modelValue: null, stars: 3, disabled: true } });
    const inputs = wrapper.findAll('input[type="radio"]');
    inputs.forEach((input) => expect(input.attributes("disabled")).toBeDefined());
  });

  it("v-model — reflects the modelValue prop as the checked star", async () => {
    const wrapper = mount(URating, { props: { modelValue: 2, stars: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true);

    await wrapper.setProps({ modelValue: 4 });
    const inputsAfter = wrapper.findAll('input[type="radio"]');
    expect((inputsAfter[3].element as HTMLInputElement).checked).toBe(true);
  });
});
