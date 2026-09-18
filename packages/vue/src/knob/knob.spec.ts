import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UKnob } from "./index";

describe("UKnob", () => {
  it("renders an SVG with role=slider reflecting the current value", () => {
    const wrapper = mount(UKnob, { props: { modelValue: 30 } });
    const svg = wrapper.find('[role="slider"]');
    expect(svg.attributes("aria-valuenow")).toBe("30");
  });

  it("clicking the SVG at a given offset updates the value", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 0 } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("click", { offsetX: 50, offsetY: 5 });
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect((emitted?.[0][0] as number)).toBeGreaterThan(0);
  });

  it("ArrowUp increments the value by step", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, step: 5 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([55]);
  });

  it("ArrowDown decrements the value by step", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, step: 5 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowDown" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([45]);
  });

  it("Home/End jump to min/max", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, min: 0, max: 100 } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("keydown", { code: "End" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
    await svg.trigger("keydown", { code: "Home" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([0]);
  });

  it("readonly prevents value changes", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, readonly: true } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("disabled prevents value changes and sets tabindex -1", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, disabled: true } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    expect(svg.attributes("tabindex")).toBe("-1");
  });
});
