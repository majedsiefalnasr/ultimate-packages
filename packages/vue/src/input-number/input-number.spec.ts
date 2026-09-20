import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputNumber } from "./index";

describe("UInputNumber — controlled (v-model)", () => {
  it("renders a single native input[type=text] with role=spinbutton", () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: null } });
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("role")).toBe("spinbutton");
  });

  it("formats modelValue with grouping separators (locale-aware, en-US default)", () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 1234567, locale: "en-US" } });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("1,234,567");
  });

  it("emits update:modelValue with the parsed numeric value on input", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: null, locale: "en-US" } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("42");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([42]);
  });

  it("shows the raw (unformatted) value while focused", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 1234, locale: "en-US" } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    expect((input.element as HTMLInputElement).value).toBe("1234");
  });

  it("re-formats with grouping separators on blur", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 1234, locale: "en-US" } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe("1,234");
  });
});

describe("UInputNumber — min/max clamping", () => {
  it("clamps a typed value above max down to max", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: null, max: 10, locale: "en-US" } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("50");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([10]);
  });

  it("clamps a typed value below min up to min", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: null, min: 5, locale: "en-US" } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("1");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([5]);
  });
});

describe("UInputNumber — keyboard increment", () => {
  it("ArrowUp increments by step", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 5, step: 1, locale: "en-US" } });
    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([6]);
  });

  it("ArrowDown decrements by step", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 5, step: 1, locale: "en-US" } });
    await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([4]);
  });

  it("ArrowUp respects a custom step", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 0, step: 5, locale: "en-US" } });
    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([5]);
  });

  it("ArrowUp clamps at max", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 10, max: 10, step: 1, locale: "en-US" } });
    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([10]);
  });

  it("does not increment when disabled", async () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 5, disabled: true, locale: "en-US" } });
    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });
});

describe("UInputNumber — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: null, invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/name pass through", () => {
    const wrapper = mount(UInputNumber, {
      props: { modelValue: null, disabled: true, readonly: true, name: "qty" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("name")).toBe("qty");
  });

  it("aria-valuemin/aria-valuemax reflect min/max", () => {
    const wrapper = mount(UInputNumber, { props: { modelValue: 5, min: 0, max: 100 } });
    const input = wrapper.find("input");
    expect(input.attributes("aria-valuemin")).toBe("0");
    expect(input.attributes("aria-valuemax")).toBe("100");
  });

  it("prefix/suffix are applied to the formatted display value", () => {
    const wrapper = mount(UInputNumber, {
      props: { modelValue: 100, prefix: "$", suffix: " USD", locale: "en-US" },
    });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("$100 USD");
  });
});
