import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import UOrderList from "./OrderList.vue";

function setup() {
  return mount(UOrderList, { props: { modelValue: ["A", "B", "C", "D"] } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("synchronizes labels and disabled state onto the composed Listbox ul", async () => {
    const wrapper = mount(UOrderList, {
      props: {
        modelValue: ["A", "B"],
        ariaLabel: "Inventory",
        ariaLabelledby: "inventory-heading",
        disabled: true,
      },
    });
    await wrapper.vm.$nextTick();
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.attributes("aria-labelledby")).toBe("inventory-heading");
    expect(listbox.attributes("aria-label")).toBeUndefined();
    expect(listbox.attributes("aria-disabled")).toBe("true");
    expect(listbox.attributes("tabindex")).toBe("-1");

    await wrapper.setProps({ ariaLabelledby: null, disabled: false });
    await wrapper.vm.$nextTick();
    expect(listbox.attributes("aria-labelledby")).toBeUndefined();
    expect(listbox.attributes("aria-label")).toBe("Inventory source");
    expect(listbox.attributes("aria-disabled")).toBeUndefined();
    expect(listbox.attributes("tabindex")).toBe("0");
  });

  it("prevents disabled Listbox options from changing internal selection", async () => {
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], disabled: true },
    });
    await wrapper.vm.$nextTick();
    const listbox = wrapper.find('[role="listbox"]');
    const option = wrapper.find('[role="option"]');
    expect(listbox.attributes("aria-disabled")).toBe("true");
    expect(listbox.attributes("tabindex")).toBe("-1");
    expect(option.attributes("aria-disabled")).toBe("true");
    await option.trigger("click");
    expect(option.attributes("aria-selected")).toBe("false");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("forwards shared and direction-specific button props and list presentation", () => {
    const wrapper = mount(UOrderList, {
      props: {
        modelValue: ["A", "B"],
        striped: true,
        scrollHeight: "22rem",
        buttonProps: { title: "Move selection", "data-shared": "true" },
        moveUpButtonProps: { "aria-label": "Move selected item up", "data-direction": "up" },
      },
    });
    const root = wrapper.find(".u-order-list");
    const up = wrapper.find('[data-pc-section="moveupbutton"]');
    const down = wrapper.find('[data-pc-section="movedownbutton"]');
    expect(root.classes()).toContain("u-striped");
    expect(wrapper.find(".u-order-list-list").attributes("style")).toContain("max-height: 22rem");
    expect(up.attributes("title")).toBe("Move selection");
    expect(up.attributes("data-shared")).toBe("true");
    expect(up.attributes("aria-label")).toBe("Move selected item up");
    expect(up.attributes("data-direction")).toBe("up");
    expect(down.attributes("title")).toBe("Move selection");
    expect(down.attributes("data-direction")).toBeUndefined();
  });

  it("switches controls to the narrow responsive layout after a media transition", async () => {
    let listener: ((event: { matches: boolean }) => void) | undefined;
    const media = {
      matches: false,
      addEventListener: vi.fn((event, callback) => {
        if (event === "change") listener = callback;
      }),
      removeEventListener: vi.fn(),
    };
    const matchMedia = vi.fn(() => media);
    vi.stubGlobal("matchMedia", matchMedia);

    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], breakpoint: "700px" },
    });
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 700px)");
    expect(wrapper.find(".u-order-list").classes()).not.toContain("u-order-list-narrow");

    if (!listener) throw new Error("matchMedia change listener was not registered");
    listener({ matches: true });
    await wrapper.vm.$nextTick();
    const root = wrapper.find(".u-order-list");
    expect(root.classes()).toContain("u-order-list-narrow");
    expect(root.attributes("style")).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(wrapper.find(".u-order-list-controls").exists()).toBe(true);
  });

  it("does not apply the narrow responsive layout when responsive is false", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], responsive: false },
    });
    const root = wrapper.find(".u-order-list");
    expect(root.classes()).not.toContain("u-order-list-narrow");
    expect(root.attributes("style")).toBeUndefined();
  });
});
