import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USelectButton } from "./index";

describe("USelectButton", () => {
  it("renders one toggle button per option, with role=group on the root", () => {
    const wrapper = mount(USelectButton, { props: { modelValue: null, options: ["A", "B", "C"] } });
    expect(wrapper.attributes("role")).toBe("group");
    expect(wrapper.findAll("button").length).toBe(3);
  });

  it("single-select — clicking an option emits update:modelValue with that option's value", async () => {
    const wrapper = mount(USelectButton, { props: { modelValue: null, options: ["A", "B", "C"] } });
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["A"]);
  });

  it("single-select — clicking the already-selected option clears it when allowEmpty", async () => {
    const wrapper = mount(USelectButton, { props: { modelValue: "A", options: ["A", "B"] } });
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
  });

  it("single-select — allowEmpty false prevents deselecting the last selection", async () => {
    const wrapper = mount(USelectButton, {
      props: { modelValue: "A", options: ["A", "B"], allowEmpty: false },
    });
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("multi-select — toggles values in and out of an array", async () => {
    const wrapper = mount(USelectButton, {
      props: { modelValue: [], options: ["A", "B", "C"], multiple: true },
    });
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["A"]]);

    await wrapper.setProps({ modelValue: ["A"] });
    await buttons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([["A", "B"]]);
  });

  it("respects per-option disabled via optionDisabled", async () => {
    const wrapper = mount(USelectButton, {
      props: {
        modelValue: null,
        options: [
          { label: "A", disabled: true },
          { label: "B", disabled: false },
        ],
        optionLabel: "label",
        optionDisabled: "disabled",
      },
    });
    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("disabled")).toBeDefined();
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("v-model — reflects the modelValue prop as the pressed button", async () => {
    const wrapper = mount(USelectButton, { props: { modelValue: "A", options: ["A", "B"] } });
    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("aria-pressed")).toBe("true");
    expect(buttons[1].attributes("aria-pressed")).toBe("false");

    await wrapper.setProps({ modelValue: "B" });
    expect(buttons[0].attributes("aria-pressed")).toBe("false");
    expect(buttons[1].attributes("aria-pressed")).toBe("true");
  });
});
