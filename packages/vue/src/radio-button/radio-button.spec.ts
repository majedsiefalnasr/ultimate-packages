import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { URadioButton } from "./index";

describe("URadioButton — controlled (v-model)", () => {
  it("renders a native input[type=radio] plus a decorative box", () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a" } });
    expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
    expect(wrapper.find(".u-radio-button-box").exists()).toBe(true);
  });

  it("checked reflects modelValue === value", () => {
    const wrapper = mount(URadioButton, { props: { modelValue: "a", value: "a" } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("emits update:modelValue with this radio's value on change", async () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a" } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
  });

  it("does not manage its own checked state when controlled — reflects the prop only", async () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a" } });
    await wrapper.setProps({ modelValue: "a" });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });
});

describe("URadioButton — binary mode", () => {
  it("binary mode: checked reflects modelValue truthiness, not value matching", () => {
    const wrapper = mount(URadioButton, { props: { modelValue: true, binary: true } });
    expect((wrapper.find("input").element as HTMLInputElement).checked).toBe(true);
  });

  it("binary mode: emits update:modelValue with the inverted boolean on change", async () => {
    const wrapper = mount(URadioButton, { props: { modelValue: false, binary: true } });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });
});

describe("URadioButton — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a", invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/required/name/tabindex pass through to the native input", () => {
    const wrapper = mount(URadioButton, {
      props: {
        modelValue: null,
        value: "a",
        disabled: true,
        readonly: true,
        required: true,
        name: "group",
        tabindex: 5,
      },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("name")).toBe("group");
    expect(input.attributes("tabindex")).toBe("5");
  });

  it("disabled prevents onChange from emitting", async () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a", disabled: true } });
    await wrapper.find("input").trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("emits focus/blur events", async () => {
    const wrapper = mount(URadioButton, { props: { modelValue: null, value: "a" } });
    await wrapper.find("input").trigger("focus");
    await wrapper.find("input").trigger("blur");
    expect(wrapper.emitted("focus")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });
});
