import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UToggleSwitch } from "./index";

describe("UToggleSwitch — controlled (v-model)", () => {
  it("renders a native input[role=switch] plus a decorative slider/handle", () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false } });
    expect(wrapper.find('input[type="checkbox"][role="switch"]').exists()).toBe(true);
    expect(wrapper.find(".u-toggle-switch-slider").exists()).toBe(true);
    expect(wrapper.find(".u-toggle-switch-handle").exists()).toBe(true);
  });

  it("checked reflects modelValue === trueValue (per real ToggleSwitch.spec.js)", () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
    expect(wrapper.find(".u-toggle-switch").classes()).toContain("u-toggle-switch-checked");
  });

  it("emits update:modelValue with trueValue on change from unchecked", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("emits update:modelValue with falseValue on change from checked", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: true } });
    await wrapper.find("input").setValue(false);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
  });

  it("does not manage its own checked state when controlled — reflects the prop only", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false } });
    await wrapper.setProps({ modelValue: true });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("UToggleSwitch — custom trueValue/falseValue", () => {
  it("checked reflects modelValue === custom trueValue", () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: "on", trueValue: "on", falseValue: "off" },
    });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("emits the custom falseValue on change from checked", async () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: "on", trueValue: "on", falseValue: "off" },
    });
    await wrapper.find("input").setValue(false);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["off"]);
  });
});

describe("UToggleSwitch — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false, invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/tabindex pass through to the native input", () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: false, disabled: true, readonly: true, tabindex: 5 },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("tabindex")).toBe("5");
  });

  it("disabled prevents onChange from emitting", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false, disabled: true } });
    await wrapper.find("input").trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("emits focus/blur events", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false } });
    await wrapper.find("input").trigger("focus");
    await wrapper.find("input").trigger("blur");
    expect(wrapper.emitted("focus")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });
});
