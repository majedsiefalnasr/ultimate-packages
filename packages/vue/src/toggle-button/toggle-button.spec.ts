import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UToggleButton } from "./index";

describe("UToggleButton — controlled (v-model)", () => {
  it("renders a native button[type=button] host", () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false } });
    expect(wrapper.find('button[type="button"]').exists()).toBe(true);
  });

  it("aria-pressed reflects modelValue", () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: true } });
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });

  it("emits update:modelValue with the inverted boolean on click (per real ToggleButton.spec.js 'should change works')", async () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);

    await wrapper.setProps({ modelValue: true });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([false]);
  });

  it("does not manage its own pressed state when controlled — reflects the prop only", async () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false } });
    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });
});

describe("UToggleButton — labels (per real ToggleButton.spec.js 'should be customized')", () => {
  it("shows onLabel when active and offLabel when inactive", async () => {
    const wrapper = mount(UToggleButton, {
      props: { modelValue: true, onLabel: "I confirm", offLabel: "I reject" },
    });
    expect(wrapper.find(".u-toggle-button-label").text()).toBe("I confirm");

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find(".u-toggle-button-label").text()).toBe("I reject");
  });

  it("shows onIcon/offIcon reflecting active state", async () => {
    const wrapper = mount(UToggleButton, {
      props: { modelValue: false, onIcon: "pi pi-check", offIcon: "pi pi-times" },
    });
    expect(wrapper.find(".pi-times").exists()).toBe(true);

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });
});

describe("UToggleButton — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false, invalid: true } });
    expect(wrapper.find("button").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/tabindex pass through to the native button", () => {
    const wrapper = mount(UToggleButton, {
      props: { modelValue: false, disabled: true, tabindex: 5 },
    });
    const button = wrapper.find("button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.attributes("tabindex")).toBe("5");
  });

  it("disabled prevents onChange from emitting", async () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false, disabled: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("readonly prevents onChange from emitting", async () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false, readonly: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("emits blur event", async () => {
    const wrapper = mount(UToggleButton, { props: { modelValue: false } });
    await wrapper.find("button").trigger("blur");
    expect(wrapper.emitted("blur")).toBeTruthy();
  });
});
