import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputText } from "./index";

describe("UInputText — controlled (v-model)", () => {
  it("renders a single native input[type=text]", () => {
    const wrapper = mount(UInputText, { props: { modelValue: "" } });
    const inputs = wrapper.findAll("input");
    expect(inputs).toHaveLength(1);
    expect(inputs[0].attributes("type")).toBe("text");
  });

  it("reflects modelValue as the input's value", () => {
    const wrapper = mount(UInputText, { props: { modelValue: "hello" } });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("hello");
  });

  it("emits update:modelValue with the typed value on input", async () => {
    const wrapper = mount(UInputText, { props: { modelValue: "" } });
    await wrapper.find("input").setValue("abc");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["abc"]);
  });

  it("does not manage its own value when controlled — reflects the prop only", async () => {
    const wrapper = mount(UInputText, { props: { modelValue: "a" } });
    await wrapper.setProps({ modelValue: "b" });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("b");
  });
});

describe("UInputText — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UInputText, { props: { modelValue: "", invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/name/placeholder pass through to the native input", () => {
    const wrapper = mount(UInputText, {
      props: { modelValue: "", disabled: true, name: "email", placeholder: "you@example.com" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("name")).toBe("email");
    expect(input.attributes("placeholder")).toBe("you@example.com");
  });

  it("emits focus/blur events", async () => {
    const wrapper = mount(UInputText, { props: { modelValue: "" } });
    await wrapper.find("input").trigger("focus");
    await wrapper.find("input").trigger("blur");
    expect(wrapper.emitted("focus")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });

  it("fluid prop applies the fluid class", () => {
    const wrapper = mount(UInputText, { props: { modelValue: "", fluid: true } });
    expect(wrapper.find("input").classes()).toContain("u-input-text-fluid");
  });
});
