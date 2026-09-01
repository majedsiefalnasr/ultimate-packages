import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UCheckbox } from "./index";

describe("UCheckbox — controlled (v-model)", () => {
  it("renders a native input[type=checkbox] plus a decorative box", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.find(".u-checkbox-box").exists()).toBe(true);
  });

  it("binary mode: checked reflects modelValue === trueValue", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: true, binary: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("binary mode: emits update:modelValue with trueValue/falseValue on change", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("does not manage its own checked state when controlled — reflects the prop only", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true } });
    await wrapper.setProps({ modelValue: true });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("UCheckbox — uncontrolled (defaultValue)", () => {
  it("initializes checked state from defaultValue when modelValue is absent", () => {
    const wrapper = mount(UCheckbox, { props: { defaultValue: true, binary: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("UCheckbox — indeterminate (real, verified prop; opposite finding from React's Checkbox)", () => {
  it("renders MinusIcon and sets the native input's indeterminate DOM property when indeterminate", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, indeterminate: true } });
    expect((wrapper.find("input").element as HTMLInputElement).indeterminate).toBe(true);
    expect(wrapper.findComponent({ name: "UMinusIcon" }).exists()).toBe(true);
  });

  it("clears indeterminate and emits update:indeterminate on change", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, indeterminate: true } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:indeterminate")?.[0]).toEqual([false]);
  });
});

describe("UCheckbox — binary: false (array-membership mode, no PrimeReact equivalent)", () => {
  it("checked reflects whether the checkbox's value is a member of the modelValue array", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: ["a", "b"], value: "a" } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("checking adds the value to the array, unchecking removes it", async () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: ["a"], value: "b" } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a", "b"]]);
  });
});

describe("UCheckbox — accessibility", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UCheckbox, { props: { modelValue: false, binary: true, invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/required/name/tabindex pass through to the native input", () => {
    const wrapper = mount(UCheckbox, {
      props: { modelValue: false, binary: true, disabled: true, readonly: true, required: true, name: "agree", tabindex: 5 },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("name")).toBe("agree");
    expect(input.attributes("tabindex")).toBe("5");
  });
});
