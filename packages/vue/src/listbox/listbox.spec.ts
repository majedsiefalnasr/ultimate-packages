import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UListbox } from "./index";

describe("UListbox", () => {
  it("renders an always-visible role=listbox with the provided options — no overlay/portal", () => {
    const wrapper = mount(UListbox, { props: { modelValue: null, options: ["Apple", "Banana"] } });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="option"]').length).toBe(2);
  });

  it("single-select — clicking an option emits update:modelValue", async () => {
    const wrapper = mount(UListbox, { props: { modelValue: null, options: ["Apple", "Banana"] } });
    const options = wrapper.findAll('[role="option"]');
    await options[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Banana"]);
  });

  it("multi-select — toggles values in and out of an array, renders checkboxes", async () => {
    const wrapper = mount(UListbox, {
      props: { modelValue: [], options: ["Apple", "Banana", "Cherry"], multiple: true },
    });
    const options = wrapper.findAll('[role="option"]');
    expect(options[0].find('input[type="checkbox"]').exists()).toBe(true);

    await options[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["Apple"]]);

    await wrapper.setProps({ modelValue: ["Apple"] });
    const optionsAfter = wrapper.findAll('[role="option"]');
    await optionsAfter[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([["Apple", "Banana"]]);
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", async () => {
    const wrapper = mount(UListbox, {
      props: { modelValue: null, options: ["Apple", "Banana", "Cherry"] },
    });
    const list = wrapper.find('[role="listbox"]');
    await list.trigger("keydown", { code: "ArrowDown" });
    await list.trigger("keydown", { code: "ArrowDown" });
    await list.trigger("keydown", { code: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Banana"]);
  });

  it("filters the option list via the filter input when filter is enabled", async () => {
    const wrapper = mount(UListbox, {
      props: { modelValue: null, options: ["Apple", "Banana", "Cherry"], filter: true },
    });
    const filterInput = wrapper.find('[role="searchbox"]');
    await filterInput.setValue("ban");
    expect(wrapper.findAll('[role="option"]').length).toBe(1);
  });

  it("respects the disabled option — clicking it does not select", async () => {
    const wrapper = mount(UListbox, {
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
    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("v-model — reflects the modelValue prop via aria-selected", async () => {
    const wrapper = mount(UListbox, { props: { modelValue: "Apple", options: ["Apple", "Banana"] } });
    const options = wrapper.findAll('[role="option"]');
    expect(options[0].attributes("aria-selected")).toBe("true");
    expect(options[1].attributes("aria-selected")).toBe("false");

    await wrapper.setProps({ modelValue: "Banana" });
    const optionsAfter = wrapper.findAll('[role="option"]');
    expect(optionsAfter[0].attributes("aria-selected")).toBe("false");
    expect(optionsAfter[1].attributes("aria-selected")).toBe("true");
  });
});
