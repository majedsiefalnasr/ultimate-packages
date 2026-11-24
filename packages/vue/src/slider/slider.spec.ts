import { afterEach, describe, it, expect, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { USlider } from "./index";

const RECT = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 } as DOMRect;

function mockRect(wrapper: VueWrapper) {
  (wrapper.element as HTMLElement).getBoundingClientRect = () => RECT;
}

function controlled(props: Record<string, unknown>) {
  const wrapper: VueWrapper = mount(USlider, {
    props: {
      ...props,
      "onUpdate:modelValue": (value: unknown) => wrapper.setProps({ modelValue: value }),
    },
    attachTo: document.body,
  });
  return wrapper;
}

function touch(type: string, target: EventTarget, x: number, y = 0, identifier = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier, clientX: x, clientY: y }],
  });
  target.dispatchEvent(event);
}

function mouse(type: string, x: number, y = 0) {
  document.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("USlider", () => {
  it("renders a single handle by default with role=slider", () => {
    const wrapper = mount(USlider, { props: { modelValue: 50 } });
    const handles = wrapper.findAll('[role="slider"]');
    expect(handles.length).toBe(1);
    expect(handles[0].attributes("aria-valuenow")).toBe("50");
  });

  it("range mode renders two handles", () => {
    const wrapper = mount(USlider, { props: { modelValue: [20, 80], range: true } });
    const handles = wrapper.findAll('[role="slider"]');
    expect(handles.length).toBe(2);
    expect(handles[0].attributes("aria-valuenow")).toBe("20");
    expect(handles[1].attributes("aria-valuenow")).toBe("80");
  });

  it("ArrowRight increments the value by step (default 1)", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 50 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([51]);
  });

  it("ArrowLeft decrements the value", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 50 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([49]);
  });

  it("PageUp and PageDown move ten steps", async () => {
    const wrapper = controlled({ modelValue: 50, step: 2 });
    const handle = wrapper.find('[role="slider"]');
    await handle.trigger("keydown", { key: "PageUp" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([70]);
    await handle.trigger("keydown", { key: "PageDown" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([50]);
  });

  it("Home/End jump to min/max", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 50, min: 0, max: 100 } });
    const handle = wrapper.find('[role="slider"]');
    await handle.trigger("keydown", { key: "End" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
    await handle.trigger("keydown", { key: "Home" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([0]);
  });

  it("clicking the track sets the value from click position", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 0 } });
    const root = wrapper.find(".u-slider");
    root.element.getBoundingClientRect = () => RECT;
    await root.trigger("click", { clientX: 25, clientY: 10 });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([25]);
  });

  it("disabled state prevents keyboard interaction", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 50, disabled: true } });
    await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("v-model — reflects the modelValue prop", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 30 } });
    expect(wrapper.find('[role="slider"]').attributes("aria-valuenow")).toBe("30");
    await wrapper.setProps({ modelValue: 70 });
    expect(wrapper.find('[role="slider"]').attributes("aria-valuenow")).toBe("70");
  });

  it("emits change with the original event and the value", async () => {
    const wrapper = mount(USlider, { props: { modelValue: 50 } });
    await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
    const payload = wrapper.emitted("change")?.[0]?.[0] as { originalEvent: Event; value: number };
    expect(payload.value).toBe(51);
    expect(payload.originalEvent.type).toBe("keydown");
  });

  describe("pointer drag", () => {
    it("drags with the mouse and reports the final value on slideend", async () => {
      const wrapper = controlled({ modelValue: 10 });
      mockRect(wrapper);
      await wrapper.find('[role="slider"]').trigger("mousedown");
      mouse("mousemove", 40);
      mouse("mousemove", 65);
      mouse("mouseup", 65);
      await nextTick();
      expect(wrapper.find('[role="slider"]').attributes("aria-valuenow")).toBe("65");
      const slideEnd = wrapper.emitted("slideend") as Array<[{ value: number }]>;
      expect(slideEnd).toHaveLength(1);
      expect(slideEnd[0][0].value).toBe(65);
    });

    it("moves only the grabbed handle in range mode", async () => {
      const wrapper = controlled({ modelValue: [20, 80], range: true });
      mockRect(wrapper);
      await wrapper.findAll('[role="slider"]')[1].trigger("mousedown");
      mouse("mousemove", 90);
      mouse("mouseup", 90);
      const slideEnd = wrapper.emitted("slideend") as Array<[{ value: number[] }]>;
      expect(slideEnd[0][0].value).toEqual([20, 90]);
    });

    it("grabs the start handle when both handles sit at max", async () => {
      const wrapper = controlled({ modelValue: [100, 100], range: true });
      mockRect(wrapper);
      await wrapper.findAll('[role="slider"]')[1].trigger("mousedown");
      mouse("mousemove", 70);
      mouse("mouseup", 70);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[70, 100]]);
    });

    it("removes the document listeners when the component unmounts mid-drag", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 10 }, attachTo: document.body });
      mockRect(wrapper);
      await wrapper.find('[role="slider"]').trigger("mousedown");
      wrapper.unmount();
      mouse("mousemove", 50);
      mouse("mouseup", 50);
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
      expect(wrapper.emitted("slideend")).toBeFalsy();
    });

    it("does not treat the click after a drag as a track click", async () => {
      const wrapper = controlled({ modelValue: 10 });
      mockRect(wrapper);
      await wrapper.find('[role="slider"]').trigger("mousedown");
      mouse("mousemove", 40);
      mouse("mouseup", 40);
      await wrapper.find(".u-slider").trigger("click", { clientX: 40, clientY: 0 });
      expect(wrapper.emitted("slideend")).toHaveLength(1);
    });

    it("ignores a zero-size track instead of emitting NaN", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 10 } });
      await wrapper.find(".u-slider").trigger("click", { clientX: 20, clientY: 0 });
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("touch drag", () => {
    it("drags with touchstart, touchmove and touchend", async () => {
      const wrapper = controlled({ modelValue: 10 });
      mockRect(wrapper);
      const handle = wrapper.find('[role="slider"]');
      touch("touchstart", handle.element, 10);
      touch("touchmove", document, 55);
      touch("touchend", document, 55);
      await nextTick();
      expect(handle.attributes("aria-valuenow")).toBe("55");
      const slideEnd = wrapper.emitted("slideend") as Array<[{ value: number }]>;
      expect(slideEnd).toHaveLength(1);
      expect(slideEnd[0][0].value).toBe(55);
    });

    it("follows only the touch that started the drag", async () => {
      const wrapper = controlled({ modelValue: 10 });
      mockRect(wrapper);
      const handle = wrapper.find('[role="slider"]');
      touch("touchstart", handle.element, 10, 0, 7);
      touch("touchmove", document, 90, 0, 3);
      await nextTick();
      expect(handle.attributes("aria-valuenow")).toBe("10");
      touch("touchmove", document, 40, 0, 7);
      await nextTick();
      expect(handle.attributes("aria-valuenow")).toBe("40");
    });

    it("does not start a drag when disabled", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 10, disabled: true } });
      mockRect(wrapper);
      touch("touchstart", wrapper.find('[role="slider"]').element, 10);
      touch("touchmove", document, 50);
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("step snapping", () => {
    it("snaps relative to the current value so a non-zero min stays on its own grid", async () => {
      const wrapper = controlled({ modelValue: 5, min: 5, max: 105, step: 10 });
      mockRect(wrapper);
      await wrapper.find('[role="slider"]').trigger("mousedown");
      mouse("mousemove", 12);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([15]);
      mouse("mouseup", 12);
    });

    it("keeps decimal steps free of float noise", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 0.1, step: 0.1 } });
      await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0.2]);
    });

    it("does not divide by zero when max equals min", () => {
      const wrapper = mount(USlider, { props: { modelValue: 5, min: 5, max: 5 } });
      expect((wrapper.find('[role="slider"]').element as HTMLElement).style.insetInlineStart).toBe(
        "0%"
      );
    });
  });

  describe("RTL", () => {
    it("places the handle with inset-inline-start", () => {
      const wrapper = mount(USlider, { props: { modelValue: 25 } });
      expect((wrapper.find('[role="slider"]').element as HTMLElement).style.insetInlineStart).toBe(
        "25%"
      );
    });

    it("mirrors the pointer position in a right-to-left slider", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 0 } });
      const root = wrapper.find(".u-slider");
      root.element.getBoundingClientRect = () => RECT;
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        direction: "rtl",
      } as CSSStyleDeclaration);
      await root.trigger("click", { clientX: 25, clientY: 0 });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([75]);
    });

    it("does not mirror a vertical slider", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 0, orientation: "vertical" } });
      const root = wrapper.find(".u-slider");
      root.element.getBoundingClientRect = () => RECT;
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        direction: "rtl",
      } as CSSStyleDeclaration);
      await root.trigger("click", { clientX: 0, clientY: 25 });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([75]);
    });
  });

  describe("tab stop and accessible name", () => {
    it("handles are focusable with tabindex 0 by default and take a custom tabindex", async () => {
      const wrapper = mount(USlider, { props: { modelValue: 5 } });
      expect(wrapper.find('[role="slider"]').attributes("tabindex")).toBe("0");
      await wrapper.setProps({ tabindex: 3 });
      expect(wrapper.find('[role="slider"]').attributes("tabindex")).toBe("3");
    });

    it("a disabled slider has no tab stop", () => {
      const wrapper = mount(USlider, {
        props: { modelValue: [10, 20], range: true, disabled: true },
      });
      for (const handle of wrapper.findAll('[role="slider"]')) {
        expect(handle.attributes("tabindex")).toBeUndefined();
      }
    });

    it("forwards ariaLabel and ariaLabelledby to every handle, not the root", () => {
      const wrapper = mount(USlider, {
        props: {
          modelValue: [10, 20],
          range: true,
          ariaLabel: "Price",
          ariaLabelledby: "price-label",
        },
      });
      for (const handle of wrapper.findAll('[role="slider"]')) {
        expect(handle.attributes("aria-label")).toBe("Price");
        expect(handle.attributes("aria-labelledby")).toBe("price-label");
      }
      expect(wrapper.find(".u-slider").attributes("aria-label")).toBeUndefined();
    });
  });

  describe("state classes", () => {
    it("adds p-disabled and p-invalid to the root", () => {
      const wrapper = mount(USlider, { props: { modelValue: 5, disabled: true, invalid: true } });
      const root = wrapper.find(".u-slider");
      expect(root.classes()).toContain("p-disabled");
      expect(root.classes()).toContain("p-invalid");
    });

    it("uses the orientation classes", () => {
      const wrapper = mount(USlider, { props: { modelValue: 5, orientation: "vertical" } });
      expect(wrapper.find(".u-slider").classes()).toContain("u-slider-vertical");
    });
  });

  describe("attributes and pass-through", () => {
    it("places fallthrough attributes on the root", () => {
      const wrapper = mount(USlider, {
        props: { modelValue: 5 },
        attrs: { id: "s", class: "mine", "data-testid": "x" },
      });
      const root = wrapper.find(".u-slider");
      expect(root.attributes("id")).toBe("s");
      expect(root.attributes("data-testid")).toBe("x");
      expect(root.classes()).toContain("mine");
    });

    it("pt reaches the root, range and handle sections", () => {
      const wrapper = mount(USlider, {
        props: {
          modelValue: 5,
          pt: {
            root: { id: "root-pt", class: "extra-root" },
            range: { "data-part": "range" },
            handle: { "data-part": "handle" },
          },
        },
      });
      const root = wrapper.find(".u-slider");
      expect(root.attributes("id")).toBe("root-pt");
      expect(root.classes()).toContain("extra-root");
      expect(wrapper.find(".u-slider-range").attributes("data-part")).toBe("range");
      expect(wrapper.find('[role="slider"]').attributes("data-part")).toBe("handle");
    });

    it("range handles take startHandler and endHandler", () => {
      const wrapper = mount(USlider, {
        props: {
          modelValue: [10, 20],
          range: true,
          pt: {
            startHandler: { "data-which": "start" },
            endHandler: { "data-which": "end" },
          },
        },
      });
      const handles = wrapper.findAll('[role="slider"]');
      expect(handles[0].attributes("data-which")).toBe("start");
      expect(handles[1].attributes("data-which")).toBe("end");
    });

    it("unstyled drops the Ultimate classes and keeps pt", () => {
      const wrapper = mount(USlider, {
        props: { modelValue: 5, unstyled: true, pt: { root: { class: "extra-root" } } },
      });
      const root = wrapper.element as HTMLElement;
      expect(root.className).toContain("extra-root");
      expect(root.className).not.toMatch(/u-slider/);
      expect((wrapper.find('[role="slider"]').element as HTMLElement).className).not.toMatch(
        /u-slider/
      );
    });
  });
});
