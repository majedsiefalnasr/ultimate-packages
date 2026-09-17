import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USelect } from "./index";

describe("USelect", () => {
  // UPortal teleports the overlay panel directly to document.body (same
  // pattern documented in autocomplete.spec.ts/password.spec.ts) — clean up
  // between tests, and query it via `document`, never `wrapper.find()`.
  afterEach(() => {
    document.querySelectorAll('[role="listbox"]').forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    const wrapper = mount(USelect, {
      props: { modelValue: null, options: ["A", "B"], placeholder: "Choose" },
    });
    const trigger = wrapper.find('[role="combobox"]');
    expect(trigger.exists()).toBe(true);
    expect(trigger.text()).toBe("Choose");
  });

  it("opens the overlay on click and lists the provided options", async () => {
    const wrapper = mount(USelect, { props: { modelValue: null, options: ["Apple", "Banana"] } });
    await wrapper.find('[role="combobox"]').trigger("click");
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].textContent?.trim()).toBe("Apple");
  });

  it("selects an option on click, emits update:modelValue, and closes the overlay", async () => {
    const wrapper = mount(USelect, { props: { modelValue: null, options: ["Apple", "Banana"] } });
    await wrapper.find('[role="combobox"]').trigger("click");
    const option = document.querySelectorAll('[role="option"]')[1] as HTMLElement;
    option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Banana"]);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: null, options: ["Apple", "Banana", "Cherry"] },
    });
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger("keydown", { code: "ArrowDown" });
    await trigger.trigger("keydown", { code: "ArrowDown" });
    await trigger.trigger("keydown", { code: "Enter" });

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]);
  });

  it("closes the overlay on Escape", async () => {
    const wrapper = mount(USelect, { props: { modelValue: null, options: ["Apple"] } });
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger("click");
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();

    await trigger.trigger("keydown", { code: "Escape" });
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it("filters the option list via the filter input when filter is enabled", async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: null, options: ["Apple", "Banana", "Cherry"], filter: true },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const filterInput = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    filterInput.value = "ban";
    filterInput.dispatchEvent(new Event("input"));
    await wrapper.vm.$nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent?.trim()).toBe("Banana");
  });

  it("v-model — reflects the modelValue prop as the displayed label", async () => {
    const wrapper = mount(USelect, { props: { modelValue: "Apple", options: ["Apple", "Banana"] } });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Apple");
    await wrapper.setProps({ modelValue: "Banana" });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Banana");
  });

  it("respects the disabled option — clicking it does not select or close", async () => {
    const wrapper = mount(USelect, {
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
    await wrapper.find('[role="combobox"]').trigger("click");
    const option = document.querySelectorAll('[role="option"]')[0] as HTMLElement;
    option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });
});
