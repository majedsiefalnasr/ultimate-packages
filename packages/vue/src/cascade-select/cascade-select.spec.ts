import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UCascadeSelect } from "./index";

const COUNTRIES = [
  {
    name: "Germany",
    items: [{ name: "Berlin" }, { name: "Hamburg" }],
  },
  {
    name: "USA",
    items: [{ name: "New York" }],
  },
];

describe("UCascadeSelect", () => {
  afterEach(() => {
    document.querySelectorAll('[role="tree"]').forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: null, options: COUNTRIES, optionLabel: "name", placeholder: "Select a city" },
    });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Select a city");
  });

  it("opens the overlay showing only the top-level (root) options", async () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: null, options: COUNTRIES, optionLabel: "name" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const items = document.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain("Germany");
    expect(items[1].textContent).toContain("USA");
  });

  it("drills down through nested groups on click, revealing the next level", async () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: null, options: COUNTRIES, optionLabel: "name" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");

    const germanyContent = document.querySelectorAll(".u-cascade-select-option-content")[0] as HTMLElement;
    germanyContent.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    const items = document.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBe(4);
    const labels = Array.from(items).map((el) => el.textContent?.trim());
    expect(labels.some((l) => l?.includes("Berlin"))).toBe(true);
    expect(labels.some((l) => l?.includes("Hamburg"))).toBe(true);
  });

  it("drills down through a group and selects a leaf, closing the overlay and updating the label", async () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: null, options: COUNTRIES, optionLabel: "name", optionValue: "name" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");

    let contents = document.querySelectorAll(".u-cascade-select-option-content");
    (contents[0] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    contents = document.querySelectorAll(".u-cascade-select-option-content");
    const berlin = Array.from(contents).find((el) => el.textContent?.trim() === "Berlin") as HTMLElement;
    expect(berlin).toBeDefined();
    berlin.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Berlin"]);
    expect(document.querySelector('[role="tree"]')).toBeNull();
  });

  it("closes the overlay on Escape", async () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: null, options: COUNTRIES, optionLabel: "name" },
    });
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger("click");
    expect(document.querySelector('[role="tree"]')).not.toBeNull();

    await trigger.trigger("keydown", { code: "Escape" });
    expect(document.querySelector('[role="tree"]')).toBeNull();
  });

  it("v-model — reflects the modelValue prop as the displayed label (matched against leaf options)", async () => {
    const wrapper = mount(UCascadeSelect, {
      props: { modelValue: "Berlin", options: COUNTRIES, optionLabel: "name", optionValue: "name" },
    });
    expect(wrapper.find('[role="combobox"]').text()).toBe("Berlin");

    await wrapper.setProps({ modelValue: "New York" });
    expect(wrapper.find('[role="combobox"]').text()).toBe("New York");
  });
});
