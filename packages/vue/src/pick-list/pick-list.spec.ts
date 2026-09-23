import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import UPickList from "./PickList.vue";

function setup() {
  return mount(UPickList, {
    props: {
      modelValue: [
        ["A", "B", "C", "D"],
        ["X", "Y", "Z", "W"],
      ],
    },
  });
}

describe("UPickList", () => {
  it("defaults to a two-array model without source or target props", () => {
    const wrapper = mount(UPickList);
    expect(wrapper.props("modelValue")).toEqual([[], []]);
    expect(wrapper.props()).not.toHaveProperty("source");
    expect(wrapper.props()).not.toHaveProperty("target");
  });

  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("reorders the source %s", async (direction, expected) => {
    const wrapper = setup();
    const source = wrapper.find('[data-pc-section="sourcelist"]');
    await source.findAll('[role="option"]')[1].trigger("click");
    await source.find(`[data-pc-section="move${direction}button"]`).trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual([
      expected,
      ["X", "Y", "Z", "W"],
    ]);
  });

  it.each([
    ["up", ["Y", "X", "Z", "W"]],
    ["top", ["Y", "X", "Z", "W"]],
    ["down", ["X", "Z", "Y", "W"]],
    ["bottom", ["X", "Z", "W", "Y"]],
  ])("reorders the target %s", async (direction, expected) => {
    const wrapper = setup();
    const target = wrapper.find('[data-pc-section="targetlist"]');
    await target.findAll('[role="option"]')[1].trigger("click");
    await target.find(`[data-pc-section="move${direction}button"]`).trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual([
      ["A", "B", "C", "D"],
      expected,
    ]);
  });

  it.each([0, 1])("transfers selected items from side %s", async (side) => {
    const wrapper = setup();
    const section = side === 0 ? "sourcelist" : "targetlist";
    const button = side === 0 ? "movetotargetbutton" : "movetosourcebutton";
    await wrapper.find(`[data-pc-section="${section}"] [role="option"]`).trigger("click");
    await wrapper.find(`[data-pc-section="${button}"]`).trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(
      side === 0
        ? [
            ["B", "C", "D"],
            ["X", "Y", "Z", "W", "A"],
          ]
        : [
            ["A", "B", "C", "D", "X"],
            ["Y", "Z", "W"],
          ]
    );
  });

  it.each([0, 1])("transfers all items from side %s", async (side) => {
    const wrapper = setup();
    const button = side === 0 ? "movealltotargetbutton" : "movealltosourcebutton";
    await wrapper.find(`[data-pc-section="${button}"]`).trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(
      side === 0
        ? [[], ["X", "Y", "Z", "W", "A", "B", "C", "D"]]
        : [["A", "B", "C", "D", "X", "Y", "Z", "W"], []]
    );
  });

  it("has no filtering or drag/drop surface", () => {
    const wrapper = setup();
    for (const prop of ["dragdrop", "filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find("[draggable], [role='searchbox'], input[type='text']").exists()).toBe(
      false
    );
  });

  it("composes two accessible multiple-selection Listboxes", async () => {
    const wrapper = setup();
    const lists = wrapper.findAll('[role="listbox"]');
    expect(lists).toHaveLength(2);
    expect(lists[0].attributes("aria-multiselectable")).toBe("true");
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("click");
    expect(
      wrapper.find('[data-pc-section="sourcelist"] [role="option"]').attributes("aria-selected")
    ).toBe("true");
  });

  it("places transfer controls between the source and target in reading order", () => {
    const wrapper = setup();
    expect(
      Array.from((wrapper.element as Element).children, (element) =>
        element.getAttribute("data-pc-section")
      )
    ).toEqual(["sourcelist", "transfercontrols", "targetlist"]);
  });

  it("retains dataKey selection through equivalent item refresh", async () => {
    const wrapper = mount(UPickList, {
      props: {
        modelValue: [
          [
            { id: "a", label: "Apple" },
            { id: "b", label: "Banana" },
          ],
          [],
        ],
        dataKey: "id",
      },
    });
    const first = () => wrapper.find('[data-pc-section="sourcelist"] [role="option"]');
    await first().trigger("click");
    await wrapper.setProps({
      modelValue: [
        [
          { id: "a", label: "Apple refreshed" },
          { id: "b", label: "Banana refreshed" },
        ],
        [],
      ],
    });
    expect(first().attributes("aria-selected")).toBe("true");
    await first().trigger("click");
    expect(first().attributes("aria-selected")).toBe("false");
  });

  it("honors metaKeySelection", async () => {
    const wrapper = mount(UPickList, {
      props: { modelValue: [["A", "B"], []], metaKeySelection: true },
    });
    const options = wrapper.findAll('[data-pc-section="sourcelist"] [role="option"]');
    await options[0].trigger("click");
    await options[1].trigger("click");
    expect(options[0].attributes("aria-selected")).toBe("false");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click", { metaKey: true });
    expect(options[1].attributes("aria-selected")).toBe("false");
  });

  it("drives tabindex, hover focus, and auto option focus in each Listbox", async () => {
    const wrapper = mount(UPickList, {
      attachTo: document.body,
      props: {
        modelValue: [["A", "B"], ["X"]],
        tabindex: 5,
        autoOptionFocus: false,
        focusOnHover: true,
      },
    });
    await wrapper.vm.$nextTick();
    const source = wrapper.find('[data-pc-section="sourcelist"] [role="listbox"]');
    expect(source.attributes("tabindex")).toBe("5");
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("mouseover");
    expect(document.activeElement).toBe(source.element);
    wrapper.unmount();
    const auto = mount(UPickList, {
      props: { modelValue: [["A", "B"], ["X"]], autoOptionFocus: true },
    });
    const list = auto.find('[data-pc-section="targetlist"] [role="listbox"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "Enter" });
    expect(
      auto.find('[data-pc-section="targetlist"] [role="option"]').attributes("aria-selected")
    ).toBe("true");
  });

  it("propagates disabled state, aria labels, and presentation to both lists", async () => {
    const wrapper = mount(UPickList, {
      props: {
        modelValue: [["A"], ["X"]],
        disabled: true,
        ariaLabelledby: "heading",
        tabindex: 3,
        striped: true,
        scrollHeight: "22rem",
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-pick-list").classes()).toContain("u-striped");
    expect(wrapper.findAll(".u-pick-list-list")[0].attributes("style")).toContain("22rem");
    for (const list of wrapper.findAll('[role="listbox"]')) {
      expect(list.attributes("tabindex")).toBe("-1");
      expect(list.attributes("aria-disabled")).toBe("true");
      expect(list.attributes("aria-labelledby")).toBe("heading");
    }
    for (const option of wrapper.findAll('[role="option"]'))
      expect(option.attributes("aria-disabled")).toBe("true");
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("forwards shared and per-button props and hides optional controls", () => {
    const wrapper = mount(UPickList, {
      props: {
        modelValue: [["A"], ["X"]],
        showSourceControls: false,
        buttonProps: { title: "Move", "data-shared": "yes" },
        moveToTargetButtonProps: { "aria-label": "Send right" },
      },
    });
    expect(
      wrapper.find('[data-pc-section="sourcelist"] [data-pc-section="moveupbutton"]').exists()
    ).toBe(false);
    expect(
      wrapper.find('[data-pc-section="targetlist"] [data-pc-section="moveupbutton"]').exists()
    ).toBe(true);
    const button = wrapper.find('[data-pc-section="movetotargetbutton"]');
    expect(button.attributes("title")).toBe("Move");
    expect(button.attributes("data-shared")).toBe("yes");
    expect(button.attributes("aria-label")).toBe("Send right");
  });

  it("responds to breakpoint changes", async () => {
    let listener: ((event: { matches: boolean }) => void) | undefined;
    const media = {
      matches: false,
      addEventListener: vi.fn((name, callback) => {
        if (name === "change") listener = callback;
      }),
      removeEventListener: vi.fn(),
    };
    const matchMedia = vi.fn(() => media);
    vi.stubGlobal("matchMedia", matchMedia);
    const wrapper = mount(UPickList, {
      props: { modelValue: [["A"], ["X"]], breakpoint: "700px" },
    });
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 700px)");
    listener?.({ matches: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-pick-list").attributes("style")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
    wrapper.unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", listener);
    vi.unstubAllGlobals();
  });
});
