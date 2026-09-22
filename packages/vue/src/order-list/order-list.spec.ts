import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UOrderList from "./OrderList.vue";

function setup() {
  return mount(UOrderList, { props: { modelValue: ["A", "B", "C", "D"] } });
}

describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", async (direction, expected) => {
    const wrapper = setup();
    const root = wrapper.find('[data-pc-section="sourcelist"]');
    await root.findAll('[role="option"]')[1].trigger("click");
    await root.find('[data-pc-section="move' + direction + 'button"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(expected);
  });

  it("has neither drag/drop nor filtering in its public props or rendered behavior", () => {
    const wrapper = setup();
    for (const prop of ["dragdrop", "filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find("[draggable]").exists()).toBe(false);
    expect(wrapper.find('[role="searchbox"]').exists()).toBe(false);
    expect(wrapper.find('input[type="text"]').exists()).toBe(false);
  });

  it("uses an accessible composed multiple-selection Listbox", async () => {
    const wrapper = setup();
    expect(wrapper.find('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
    await wrapper.find('[role="option"]').trigger("click");
    expect(wrapper.find('[role="option"]').attributes("aria-selected")).toBe("true");
  });

  it("retains dataKey selection after an equivalent model array refresh", async () => {
    const wrapper = mount(UOrderList, {
      props: {
        modelValue: [
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ],
        dataKey: "id",
      },
    });
    await wrapper.findAll('[role="option"]')[1].trigger("click");
    await wrapper.setProps({
      modelValue: [
        { id: "a", label: "Apple refreshed" },
        { id: "b", label: "Banana refreshed" },
      ],
    });
    expect(wrapper.findAll('[role="option"]')[1].attributes("aria-selected")).toBe("true");
    await wrapper.findAll('[role="option"]')[1].trigger("click");
    expect(wrapper.findAll('[role="option"]')[1].attributes("aria-selected")).toBe("false");
  });

  it("implements metaKeySelection for plain and Ctrl/Cmd clicks", async () => {
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], metaKeySelection: true },
    });
    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger("click");
    await options[1].trigger("click");
    expect(options[0].attributes("aria-selected")).toBe("false");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click", { ctrlKey: true });
    expect(options[1].attributes("aria-selected")).toBe("false");
  });

  it("applies tabindex and auto/hover focus to the composed Listbox ul", async () => {
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], tabindex: 6, autoOptionFocus: false, focusOnHover: true },
      attachTo: document.body,
    });
    await wrapper.vm.$nextTick();
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.attributes("tabindex")).toBe("6");
    await wrapper.find('[role="option"]').trigger("mouseover");
    expect(document.activeElement).toBe(listbox.element);
    const auto = mount(UOrderList, {
      props: { modelValue: ["A", "B"], autoOptionFocus: true },
      attachTo: document.body,
    });
    const autoListbox = auto.find('[role="listbox"]');
    await autoListbox.trigger("focus");
    await autoListbox.trigger("keydown", { code: "Enter" });
    expect(auto.findAll('[role="option"]')[0].attributes("aria-selected")).toBe("true");
  });
});
