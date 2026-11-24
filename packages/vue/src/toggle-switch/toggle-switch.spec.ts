import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
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

describe("UToggleSwitch — readonly, invalid, data hooks, handle slot", () => {
  it("readonly prevents onChange from emitting", async () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false, readonly: true } });
    await wrapper.find("input").trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("invalid adds p-invalid on the root and aria-invalid on the input", () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false, invalid: true } });
    expect(wrapper.find(".u-toggle-switch").classes()).toContain("p-invalid");
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("root carries data-p-checked, data-p-disabled and data-p; slider and handle carry data-p", () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: true, disabled: true, invalid: true },
    });
    const root = wrapper.find(".u-toggle-switch");
    expect(root.attributes("data-p-checked")).toBe("true");
    expect(root.attributes("data-p-disabled")).toBe("true");
    expect(root.attributes("data-p")).toContain("checked");
    expect(root.attributes("data-p")).toContain("disabled");
    expect(root.attributes("data-p")).toContain("invalid");
    expect(wrapper.find(".u-toggle-switch-slider").attributes("data-p")).toBe(
      root.attributes("data-p")
    );
    expect(wrapper.find(".u-toggle-switch-handle").attributes("data-p")).toBe(
      root.attributes("data-p")
    );
  });

  it("renders the handle slot with the checked state", () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: true },
      slots: {
        handle: `<template #handle="{ checked }"><i class="icon">{{ checked ? "on" : "off" }}</i></template>`,
      },
    });
    expect(wrapper.find(".u-toggle-switch-handle .icon").text()).toBe("on");
  });
});

describe("UToggleSwitch — pass-through, unstyled, dt", () => {
  it("class and attributes from the caller land on the root", () => {
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: false },
      attrs: { class: "caller", "data-caller": "1" },
    });
    const root = wrapper.find(".u-toggle-switch");
    expect(root.classes()).toContain("caller");
    expect(root.attributes("data-caller")).toBe("1");
  });

  it("pt reaches the root, input, slider and handle sections", () => {
    const wrapper = mount(UToggleSwitch, {
      props: {
        modelValue: false,
        pt: {
          root: { "data-pt-root": "r" },
          input: { "data-pt-input": "i" },
          slider: { "data-pt-slider": "s" },
          handle: { "data-pt-handle": "h" },
        },
      },
    });
    expect(wrapper.find(".u-toggle-switch").attributes("data-pt-root")).toBe("r");
    expect(wrapper.find("input").attributes("data-pt-input")).toBe("i");
    expect(wrapper.find(".u-toggle-switch-slider").attributes("data-pt-slider")).toBe("s");
    expect(wrapper.find(".u-toggle-switch-handle").attributes("data-pt-handle")).toBe("h");
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UToggleSwitch, { props: { modelValue: false, unstyled: true } });
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.html()).not.toContain("u-toggle-switch");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { toggleswitch: { width: "2.5rem" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UToggleSwitch, {
      props: { modelValue: false, dt: { width: "4rem" } },
    });
    const [attr] = wrapper
      .find(".u-toggle-switch")
      .element.getAttributeNames()
      .filter((name) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-toggleswitch"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-toggleswitch-width:4rem;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-toggleswitch"]`)).toBeNull();
  });
});
