import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { UKnob } from "./index";

function stubRect(element: Element) {
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100, x: 0, y: 0, right: 100, bottom: 100 }) as DOMRect;
}

function touch(type: string, target: EventTarget, x: number, y: number, identifier = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier, clientX: x, clientY: y }],
  });
  target.dispatchEvent(event);
}

function lastModel(wrapper: ReturnType<typeof mount>) {
  return wrapper.emitted("update:modelValue")?.at(-1)?.[0];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UKnob", () => {
  it("renders an SVG with role=slider reflecting the current value", () => {
    const wrapper = mount(UKnob, { props: { modelValue: 30 } });
    const svg = wrapper.find('[role="slider"]');
    expect(svg.attributes("aria-valuenow")).toBe("30");
  });

  it("clicking the SVG at a given offset updates the value", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 0 } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("click", { offsetX: 50, offsetY: 5 });
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0][0] as number).toBeGreaterThan(0);
  });

  it("ArrowUp increments the value by step", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, step: 5 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([55]);
  });

  it("ArrowDown decrements the value by step", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, step: 5 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowDown" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([45]);
  });

  it("Home/End jump to min/max", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, min: 0, max: 100 } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("keydown", { code: "End" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
    await svg.trigger("keydown", { code: "Home" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([0]);
  });

  it("readonly prevents value changes", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, readonly: true } });
    await wrapper.find('[role="slider"]').trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("disabled prevents value changes and sets tabindex -1", async () => {
    const wrapper = mount(UKnob, { props: { modelValue: 50, disabled: true } });
    const svg = wrapper.find('[role="slider"]');
    await svg.trigger("keydown", { code: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    expect(svg.attributes("tabindex")).toBe("-1");
  });

  describe("touch and drag", () => {
    it("drags with touchstart, touchmove and touchend", async () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 } });
      const svg = wrapper.find('[role="slider"]').element;
      stubRect(svg);
      touch("touchstart", svg, 50, 5);
      touch("touchmove", document, 50, 5);
      expect(lastModel(wrapper)).toBe(50);
      touch("touchend", document, 50, 5);
      touch("touchmove", document, 95, 50);
      expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    });

    it("follows only the touch that started the drag", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 } });
      const svg = wrapper.find('[role="slider"]').element;
      stubRect(svg);
      touch("touchstart", svg, 50, 5, 1);
      touch("touchmove", document, 95, 50, 2);
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
      touch("touchmove", document, 95, 50, 1);
      expect(lastModel(wrapper)).toBe(80);
      touch("touchcancel", document, 95, 50, 1);
    });

    it("drags with the mouse and stops on mouseup", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 } });
      const svg = wrapper.find('[role="slider"]').element;
      stubRect(svg);
      svg.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 95, clientY: 50 }));
      expect(lastModel(wrapper)).toBe(80);
      expect(wrapper.emitted("change")?.at(-1)).toEqual([80]);
      document.dispatchEvent(new MouseEvent("mouseup"));
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 5, clientY: 50 }));
      expect(lastModel(wrapper)).toBe(80);
    });

    it("removes the drag listeners when unmounted mid-drag", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 } });
      const svg = wrapper.find('[role="slider"]').element;
      stubRect(svg);
      const remove = vi.spyOn(document, "removeEventListener");
      svg.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      wrapper.unmount();
      expect(remove).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(remove).toHaveBeenCalledWith("mouseup", expect.any(Function));
    });

    it("ignores touch on a readonly knob", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30, readonly: true } });
      const svg = wrapper.find('[role="slider"]').element;
      stubRect(svg);
      touch("touchstart", svg, 50, 5);
      touch("touchmove", document, 50, 5);
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("accessibility and state", () => {
    it("uses the configured tabindex and -1 when readonly", async () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30, tabindex: 3 } });
      const svg = wrapper.find('[role="slider"]');
      expect(svg.attributes("tabindex")).toBe("3");
      await wrapper.setProps({ readonly: true });
      expect(svg.attributes("tabindex")).toBe("-1");
    });

    it("names the dial with aria-label and aria-labelledby", () => {
      const wrapper = mount(UKnob, {
        props: { modelValue: 30, ariaLabel: "Volume", ariaLabelledby: "volume-label" },
      });
      const svg = wrapper.find('[role="slider"]');
      expect(svg.attributes("aria-label")).toBe("Volume");
      expect(svg.attributes("aria-labelledby")).toBe("volume-label");
    });

    it("adds p-disabled and p-invalid to the root", async () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30, invalid: true } });
      expect(wrapper.classes()).toEqual(expect.arrayContaining(["u-knob", "p-invalid"]));
      expect(wrapper.classes()).not.toContain("p-disabled");
      await wrapper.setProps({ disabled: true });
      expect(wrapper.classes()).toContain("p-disabled");
    });

    it("puts fallthrough attributes on the root", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 }, attrs: { id: "knob" } });
      expect(wrapper.attributes("id")).toBe("knob");
    });
  });

  describe("styling and templates", () => {
    it("applies pt sections to the root, svg, arcs and text", () => {
      const wrapper = mount(UKnob, {
        props: {
          modelValue: 30,
          pt: {
            root: { "data-test": "root" },
            svg: { "data-test": "svg" },
            range: { "data-test": "range" },
            value: { "data-test": "value" },
            text: { "data-test": "text" },
          },
        },
      });
      const paths = wrapper.findAll("path");
      expect(wrapper.attributes("data-test")).toBe("root");
      expect(wrapper.find("svg").attributes("data-test")).toBe("svg");
      expect(paths[0].attributes("data-test")).toBe("range");
      expect(paths[1].attributes("data-test")).toBe("value");
      expect(wrapper.find("text").attributes("data-test")).toBe("text");
    });

    it("drops the component classes when unstyled", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30, unstyled: true } });
      expect(wrapper.classes()).not.toContain("u-knob");
      expect(wrapper.find("path").classes()).not.toContain("u-knob-range");
    });

    it("defaults the colours to the knob token variables", () => {
      const wrapper = mount(UKnob, { props: { modelValue: 30 } });
      const paths = wrapper.findAll("path");
      expect(paths[0].attributes("stroke")).toBe("var(--u-knob-range-background)");
      expect(paths[1].attributes("stroke")).toBe("var(--u-knob-value-background)");
      expect(wrapper.find("text").attributes("fill")).toBe("var(--u-knob-text-color)");
    });

    it("replaces every {value} placeholder in a string template", () => {
      const wrapper = mount(UKnob, {
        props: { modelValue: 30, valueTemplate: "{value} of {value}" },
      });
      expect(wrapper.find("text").text()).toBe("30 of 30");
    });

    it("formats the value with a function template", () => {
      const wrapper = mount(UKnob, {
        props: { modelValue: 30, valueTemplate: (value: number) => `${value}%` },
      });
      expect(wrapper.find("text").text()).toBe("30%");
    });
  });
});
