import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputOtp } from "./index";

describe("UInputOtp — controlled (v-model)", () => {
  it("renders `length` native text inputs", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4 } });
    expect(wrapper.findAll("input")).toHaveLength(4);
  });

  it("splits modelValue across segments", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "1234", length: 4 } });
    const inputs = wrapper.findAll("input");
    expect(inputs.map((i) => (i.element as HTMLInputElement).value)).toEqual(["1", "2", "3", "4"]);
  });

  it("emits update:modelValue with the joined token string on input", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4 } });
    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("1");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["1"]);
  });

  it("emits a change event with the joined value", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "12", length: 4 } });
    const inputs = wrapper.findAll("input");
    await inputs[2].setValue("3");
    const changeEvent = wrapper.emitted("change")?.[0]?.[0] as { value: string };
    expect(changeEvent.value).toBe("123");
  });
});

describe("UInputOtp — segment navigation", () => {
  it("ArrowRight moves focus to the next segment", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 3 }, attachTo: document.body });
    const inputs = wrapper.findAll("input");
    inputs[0].element.focus();
    await inputs[0].trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(inputs[1].element);
    wrapper.unmount();
  });

  it("ArrowLeft moves focus to the previous segment", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 3 }, attachTo: document.body });
    const inputs = wrapper.findAll("input");
    inputs[1].element.focus();
    await inputs[1].trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(inputs[0].element);
    wrapper.unmount();
  });

  it("Backspace on an empty segment moves focus to the previous segment", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 3 }, attachTo: document.body });
    const inputs = wrapper.findAll("input");
    inputs[1].element.focus();
    await inputs[1].trigger("keydown", { key: "Backspace" });
    expect(document.activeElement).toBe(inputs[0].element);
    wrapper.unmount();
  });

  it("blocks non-digit keys when integerOnly is set", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 3, integerOnly: true } });
    const el = wrapper.findAll("input")[0].element;
    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows digit keys when integerOnly is set", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 3, integerOnly: true } });
    const el = wrapper.findAll("input")[0].element;
    const event = new KeyboardEvent("keydown", { key: "5", bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("UInputOtp — paste", () => {
  it("splits pasted text across segments and writes the joined value", async () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4 } });
    const input = wrapper.findAll("input")[0];

    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent & {
      clipboardData: { getData: () => string };
    };
    Object.defineProperty(pasteEvent, "clipboardData", { value: { getData: () => "5678" } });
    input.element.dispatchEvent(pasteEvent);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["5678"]);
  });
});

describe("UInputOtp — masking and accessibility", () => {
  it("renders type=password per segment when mask is set", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4, mask: true } });
    expect(wrapper.find("input").attributes("type")).toBe("password");
  });

  it("renders type=text per segment by default", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4 } });
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 4, invalid: true } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/readonly pass through to every segment", () => {
    const wrapper = mount(UInputOtp, { props: { modelValue: "", length: 2, disabled: true, readonly: true } });
    for (const input of wrapper.findAll("input")) {
      expect(input.attributes("disabled")).toBeDefined();
      expect(input.attributes("readonly")).toBeDefined();
    }
  });
});
