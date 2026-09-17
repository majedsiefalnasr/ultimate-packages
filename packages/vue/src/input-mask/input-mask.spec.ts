import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputMask } from "./index";

describe("UInputMask — masking (mask='999-999')", () => {
  it("renders a single native input[type=text]", () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    expect(wrapper.findAll("input")).toHaveLength(1);
  });

  it("formats a typed digit sequence with the mask's static separator", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    await input.setValue("123456");
    expect((input.element as HTMLInputElement).value).toBe("123-456");
  });

  it("emits update:modelValue with the formatted (masked) value by default", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    await wrapper.find("input").setValue("123456");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["123-456"]);
  });

  it("rejects non-matching characters (letters against digit slots)", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    await input.setValue("abc123");
    expect((input.element as HTMLInputElement).value).toBe("123-___");
  });

  it("emits complete when all required slots are filled", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    await wrapper.find("input").setValue("123456");
    expect(wrapper.emitted("complete")).toBeTruthy();
  });

  it("does not emit complete for a partially-filled mask", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    await wrapper.find("input").setValue("123");
    expect(wrapper.emitted("complete")).toBeFalsy();
  });
});

describe("UInputMask — unmask", () => {
  it("emits the raw unmasked characters when unmask is set", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999", unmask: true } });
    await wrapper.find("input").setValue("123456");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123456"]);
  });
});

describe("UInputMask — autoClear", () => {
  it("clears an incomplete value on blur when autoClear is true (default)", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    await input.setValue("12");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
  });

  it("keeps an incomplete value on blur when autoClear is false", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999", autoClear: false } });
    const input = wrapper.find("input");
    await input.setValue("12");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["12_-___"]);
  });
});

describe("UInputMask — backspace", () => {
  it("clears the slot immediately before the caret on Backspace", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "123-456", mask: "999-999" } });
    const input = wrapper.find("input");
    const el = input.element;
    el.setSelectionRange(3, 3);
    await input.trigger("keydown", { key: "Backspace" });
    expect(el.value).toBe("12_-456");
  });
});

describe("UInputMask — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999", invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly/name pass through", () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999", disabled: true, readonly: true, name: "phone" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("name")).toBe("phone");
  });
});
