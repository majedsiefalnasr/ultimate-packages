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
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999-999", autoClear: false },
    });
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
    expect(el.value).toBe("124-56_");
  });

  it("removes the character at the caret on Delete and shifts the rest left", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "123-456", mask: "999-999" } });
    const input = wrapper.find("input");
    const el = input.element;
    el.setSelectionRange(1, 1);
    await input.trigger("keydown", { key: "Delete" });
    expect(el.value).toBe("134-56_");
  });
});

describe("UInputMask — keyboard, paste and composition", () => {
  it("restores the value held at focus on Escape", async () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "123-456", mask: "999-999" },
      attachTo: document.body,
    });
    const input = wrapper.find("input");
    const el = input.element;
    await input.trigger("focus");
    await input.setValue("999-999");
    await input.trigger("keydown", { key: "Escape" });
    expect(el.value).toBe("123-456");
    wrapper.unmount();
  });

  it("blurs the input on Enter", async () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "123-456", mask: "999-999" },
      attachTo: document.body,
    });
    const input = wrapper.find("input");
    (input.element as HTMLInputElement).focus();
    expect(document.activeElement).toBe(input.element);
    await input.trigger("keydown", { key: "Enter" });
    expect(document.activeElement).not.toBe(input.element);
    wrapper.unmount();
  });

  it("emits keydown and keypress", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    await input.trigger("keydown", { key: "a" });
    await input.trigger("keypress", { key: "1" });
    expect(wrapper.emitted("keydown")).toHaveLength(1);
    expect(wrapper.emitted("keypress")).toHaveLength(1);
  });

  it("masks a typed character on keypress and emits complete with the value", async () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "99" },
      attachTo: document.body,
    });
    const input = wrapper.find("input");
    (input.element as HTMLInputElement).focus();
    await input.trigger("keypress", { key: "1" });
    await input.trigger("keypress", { key: "2" });
    expect((input.element as HTMLInputElement).value).toBe("12");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["12"]);
    expect(wrapper.emitted("complete")?.at(-1)).toEqual([
      { originalEvent: expect.any(Event), value: "12" },
    ]);
    wrapper.unmount();
  });

  it("emits paste and reformats from the input event the browser fires after it", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    await input.trigger("paste");
    expect(wrapper.emitted("paste")).toHaveLength(1);
    await input.setValue("123456");
    expect((input.element as HTMLInputElement).value).toBe("123-456");
  });

  it("ignores input events while an IME composition is active, and finalizes on compositionend", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    const input = wrapper.find("input");
    const el = input.element as HTMLInputElement;
    el.value = "12";
    el.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await input.trigger("compositionend");
    expect(el.value).toBe("12_-___");
  });
});

describe("UInputMask — behavior changes", () => {
  it("places a multi-character slotChar by position", async () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999", slotChar: "ab", autoClear: false },
    });
    const input = wrapper.find("input");
    await input.setValue("1");
    expect((input.element as HTMLInputElement).value).toBe("1ba");
  });

  it("re-initializes when the mask changes", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999-999" } });
    await wrapper.setProps({ mask: "99/99" });
    const input = wrapper.find("input");
    await input.setValue("1234");
    expect((input.element as HTMLInputElement).value).toBe("12/34");
  });

  it("behaves as a plain input without a mask", async () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "" } });
    await wrapper.find("input").setValue("hello");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["hello"]);
  });
});

describe("UInputMask — InputText parity", () => {
  it("renders the InputText and InputMask root classes", () => {
    const wrapper = mount(UInputMask, { props: { modelValue: "", mask: "999" } });
    const classes = wrapper.find("input").classes();
    expect(classes).toContain("u-inputtext");
    expect(classes).toContain("u-inputmask");
  });

  it("applies size, variant and fluid classes", () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999", size: "small", variant: "filled", fluid: true },
    });
    const classes = wrapper.find("input").classes();
    expect(classes).toContain("u-inputtext-sm");
    expect(classes).toContain("p-variant-filled");
    expect(classes).toContain("u-inputtext-fluid");
  });

  it("passes aria-label through to the input", () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999" },
      attrs: { "aria-label": "Phone" },
    });
    expect(wrapper.find("input").attributes("aria-label")).toBe("Phone");
  });

  it("applies pt root and pcInputText root", () => {
    const wrapper = mount(UInputMask, {
      props: {
        modelValue: "",
        mask: "999",
        pt: { root: { "data-root": "a" }, pcInputText: { root: { "data-input-text": "b" } } },
      },
    });
    const input = wrapper.find("input");
    expect(input.attributes("data-root")).toBe("a");
    expect(input.attributes("data-input-text")).toBe("b");
  });

  it("drops the styling classes when unstyled", () => {
    const wrapper = mount(UInputMask, {
      props: { modelValue: "", mask: "999", unstyled: true },
    });
    expect(wrapper.find("input").classes()).not.toContain("u-inputtext");
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
