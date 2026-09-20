import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UMultiSelect } from "./index";

describe("UMultiSelect", () => {
  afterEach(() => {
    document.querySelectorAll('.u-multi-select-overlay, [role="listbox"]').forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    const wrapper = mount(UMultiSelect, {
      props: { modelValue: [], options: ["A", "B"], placeholder: "Choose" },
    });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Choose");
  });

  it("opens the overlay on click and lists options with checkboxes", async () => {
    const wrapper = mount(UMultiSelect, { props: { modelValue: [], options: ["Apple", "Banana"] } });
    await wrapper.find('[role="combobox"]').trigger("click");
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it("toggles options in and out of the array value, and does not close the overlay", async () => {
    const wrapper = mount(UMultiSelect, {
      props: { modelValue: [], options: ["Apple", "Banana", "Cherry"] },
    });
    await wrapper.find('[role="combobox"]').trigger("click");

    let options = document.querySelectorAll('[role="option"]');
    (options[0] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["Apple"]]);
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();

    await wrapper.setProps({ modelValue: ["Apple"] });
    options = document.querySelectorAll('[role="option"]');
    (options[1] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([["Apple", "Banana"]]);
  });

  it("select-all header checkbox selects/deselects every visible option", async () => {
    const wrapper = mount(UMultiSelect, { props: { modelValue: [], options: ["Apple", "Banana"] } });
    await wrapper.find('[role="combobox"]').trigger("click");
    const selectAll = document.querySelector('[aria-label="Select All"]') as HTMLInputElement;
    selectAll.checked = true;
    selectAll.dispatchEvent(new Event("change", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["Apple", "Banana"]]);
  });

  it("filters the option list via the filter input when filter is enabled", async () => {
    const wrapper = mount(UMultiSelect, {
      props: { modelValue: [], options: ["Apple", "Banana", "Cherry"], filter: true },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const filterInput = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    filterInput.value = "ban";
    filterInput.dispatchEvent(new Event("input"));
    await wrapper.vm.$nextTick();

    expect(document.querySelectorAll('[role="option"]').length).toBe(1);
  });

  it("closes the overlay on Escape", async () => {
    const wrapper = mount(UMultiSelect, { props: { modelValue: [], options: ["Apple"] } });
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger("click");
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    await trigger.trigger("keydown", { code: "Escape" });
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it("v-model — reflects the modelValue array prop as the displayed label", async () => {
    const wrapper = mount(UMultiSelect, {
      props: { modelValue: ["Apple"], options: ["Apple", "Banana"] },
    });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Apple");
    await wrapper.setProps({ modelValue: ["Apple", "Banana"] });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Apple, Banana");
  });
});
