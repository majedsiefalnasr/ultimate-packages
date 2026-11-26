import { afterAll, afterEach, beforeAll, describe, it, expect, vi } from "vitest";
import { config, mount, type VueWrapper } from "@vue/test-utils";
import { UColorPicker } from "./index";

const RECT = {
  left: 0,
  top: 0,
  width: 150,
  height: 150,
  x: 0,
  y: 0,
  right: 150,
  bottom: 150,
  toJSON: () => ({}),
} as DOMRect;

const wrappers: VueWrapper[] = [];

// @vue/test-utils stubs <transition> by default, which skips the @enter and
// @leave hooks that bind the overlay listeners and set the z-index (the
// same switch menu.spec.ts uses).
beforeAll(() => {
  config.global.stubs.transition = false;
});
afterAll(() => {
  config.global.stubs.transition = true;
});

function render(props: Record<string, unknown> = {}, attachTo: HTMLElement = document.body) {
  const wrapper = mount(UColorPicker, { props, attachTo });
  wrappers.push(wrapper);
  return wrapper;
}

function controlled(props: Record<string, unknown> = {}) {
  const wrapper: VueWrapper = render({
    modelValue: null,
    ...props,
    "onUpdate:modelValue": (value: unknown) => wrapper.setProps({ modelValue: value }),
  });
  return wrapper;
}

function release(wrapper: VueWrapper) {
  wrapper.unmount();
  wrappers.splice(wrappers.indexOf(wrapper), 1);
}

function panel(): HTMLElement | null {
  return document.querySelector(".u-color-picker-panel");
}

function part(name: string): HTMLElement {
  const element = document.querySelector(`.u-color-picker-${name}`) as HTMLElement;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(RECT);
  return element;
}

function mouse(type: string, target: EventTarget, clientX = 0, clientY = 0) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY }));
}

function touch(
  type: string,
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY: number
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", { value: [{ identifier, clientX, clientY }] });
  target.dispatchEvent(event);
}

async function open(wrapper: VueWrapper) {
  // UPortal teleports only after its own mount tick; a click in that same
  // tick would render the panel without running the enter hook.
  await wrapper.vm.$nextTick();
  await wrapper.find("input").trigger("click");
  await vi.waitFor(() => expect(panel()).not.toBeNull());
}

async function closed() {
  await vi.waitFor(() => expect(panel()).toBeNull());
}

function lastValue(wrapper: VueWrapper) {
  return (wrapper.emitted("change")!.at(-1)![0] as { value: unknown }).value;
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("UColorPicker", () => {
  it("renders a readonly preview input named 'Select a color' showing the default color", () => {
    const wrapper = render({ inputId: "brand", tabindex: "3" });
    const input = wrapper.find("input").element;
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute("aria-label")).toBe("Select a color");
    expect(input.id).toBe("brand");
    expect(input.tabIndex).toBe(3);
    expect(input.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("opens the panel in the body and emits show and hide", async () => {
    const wrapper = render();
    await open(wrapper);
    expect(wrapper.element.contains(panel())).toBe(false);
    expect(panel()!.style.zIndex).not.toBe("");
    expect(wrapper.find("input").attributes("aria-expanded")).toBe("true");
    expect(wrapper.emitted("show")).toHaveLength(1);

    await wrapper.find("input").trigger("keydown", { code: "Escape" });
    await closed();
    expect(wrapper.emitted("hide")).toHaveLength(1);
  });

  it("keeps the panel in place with appendTo='self'", async () => {
    const wrapper = render({ appendTo: "self" });
    await open(wrapper);
    expect(wrapper.element.contains(panel())).toBe(true);
  });

  it("Tab closes and Space toggles the panel", async () => {
    const wrapper = render();
    const input = wrapper.find("input");
    await open(wrapper);
    await input.trigger("keydown", { code: "Tab" });
    await closed();
    await input.trigger("keydown", { code: "Space" });
    await vi.waitFor(() => expect(panel()).not.toBeNull());
    await input.trigger("keydown", { code: "Space" });
    await closed();
  });

  it("closes on an outside click but not on a click inside the panel", async () => {
    const wrapper = render();
    await open(wrapper);
    part("hue").click();
    await wrapper.vm.$nextTick();
    expect(panel()).not.toBeNull();
    document.body.click();
    await closed();
  });

  it("closes when a scrollable ancestor scrolls", async () => {
    const scroller = document.createElement("div");
    scroller.style.overflow = "scroll";
    document.body.appendChild(scroller);
    const wrapper = render({}, scroller);
    await open(wrapper);
    scroller.dispatchEvent(new Event("scroll"));
    await closed();
  });

  it("writes rrggbb without # and emits change with originalEvent, value and event", async () => {
    const wrapper = controlled({ modelValue: "#00ff00" });
    expect(wrapper.find("input").element.style.backgroundColor).toBe("rgb(0, 255, 0)");
    await open(wrapper);
    mouse("mousedown", part("color-selector"), 150, 0);
    expect(wrapper.emitted("update:modelValue")!.at(-1)![0]).toBe("00ff00");
    const event = wrapper.emitted("change")!.at(-1)![0] as Record<string, unknown>;
    expect(event.value).toBe("00ff00");
    expect(event.originalEvent).toBeInstanceOf(MouseEvent);
    expect(event.event).toBe(event.originalEvent);
  });

  it("reads hex with or without # and follows model changes when not dragging", async () => {
    const wrapper = render({ modelValue: "0000ff" });
    const input = wrapper.find("input").element;
    expect(input.style.backgroundColor).toBe("rgb(0, 0, 255)");
    await wrapper.setProps({ modelValue: "#00ff00" });
    expect(input.style.backgroundColor).toBe("rgb(0, 255, 0)");
  });

  it("ignores model updates while dragging", async () => {
    const wrapper = render({ modelValue: "ff0000" });
    const input = wrapper.find("input").element;
    await open(wrapper);
    mouse("mousedown", part("hue"), 5, 75);
    expect(lastValue(wrapper)).toBe("00ffff");
    await wrapper.setProps({ modelValue: "0000ff" });
    expect(input.style.backgroundColor).toBe("rgb(0, 255, 255)");
    mouse("mouseup", document);
    await wrapper.setProps({ modelValue: "ff00ff" });
    expect(input.style.backgroundColor).toBe("rgb(255, 0, 255)");
  });

  it("keeps the hue of a black value in localHue", async () => {
    const wrapper = controlled({ modelValue: "00ffff" });
    await open(wrapper);
    await wrapper.setProps({ modelValue: "000000" });
    expect(part("color-selector").style.backgroundColor).toBe("rgb(0, 255, 255)");
    mouse("mousedown", part("color-selector"), 150, 0);
    mouse("mouseup", document);
    expect(lastValue(wrapper)).toBe("00ffff");
  });

  it("dragging the hue strip follows the pointer until mouseup", async () => {
    const wrapper = controlled({ modelValue: "ff0000" });
    await open(wrapper);
    mouse("mousedown", part("hue"), 5, 75);
    expect(lastValue(wrapper)).toBe("00ffff");
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain("u-color-picker-dragging");
    mouse("mousemove", document, 5, 100);
    expect(lastValue(wrapper)).toBe("00ff00");
    mouse("mouseup", document);
    const calls = wrapper.emitted("change")!.length;
    mouse("mousemove", document, 5, 150);
    expect(wrapper.emitted("change")!.length).toBe(calls);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain("u-color-picker-dragging");
  });

  it("a touch drag follows only its own touch and ends on touchcancel", async () => {
    const wrapper = controlled({ modelValue: "ff0000" });
    await open(wrapper);
    touch("touchstart", part("hue"), 7, 5, 75);
    expect(lastValue(wrapper)).toBe("00ffff");
    touch("touchmove", document, 8, 5, 100);
    expect(lastValue(wrapper)).toBe("00ffff");
    touch("touchmove", document, 7, 5, 100);
    expect(lastValue(wrapper)).toBe("00ff00");
    touch("touchcancel", document, 7, 5, 100);
    const calls = wrapper.emitted("change")!.length;
    touch("touchmove", document, 7, 5, 150);
    expect(wrapper.emitted("change")!.length).toBe(calls);
  });

  it("respects the rgb and hsb formats", async () => {
    const rgb = render({ format: "rgb" });
    await open(rgb);
    mouse("mousedown", part("color-selector"), 150, 0);
    mouse("mouseup", document);
    expect(lastValue(rgb)).toEqual({ r: 255, g: 0, b: 0 });
    release(rgb);
    await closed();

    const hsb = render({ format: "hsb" });
    await open(hsb);
    mouse("mousedown", part("color-selector"), 150, 0);
    expect(lastValue(hsb)).toEqual({ h: 0, s: 100, b: 100 });
  });

  it("renders the panel in place without an input when inline", () => {
    const wrapper = render({ inline: true });
    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.find(".u-color-picker-panel").classes()).toContain(
      "u-color-picker-panel-inline"
    );
    expect(wrapper.classes()).not.toContain("u-color-picker-overlay");
  });

  it("a disabled picker does not open", async () => {
    const wrapper = render({ disabled: true });
    const input = wrapper.find("input");
    expect(input.classes()).toContain("p-disabled");
    await input.trigger("click");
    expect(panel()).toBeNull();
  });

  it("adds overlayClass and p-invalid to the panel", async () => {
    const wrapper = render({ overlayClass: "brand-panel", invalid: true });
    await open(wrapper);
    expect(panel()!.classList).toContain("brand-panel");
    expect(panel()!.classList).toContain("p-invalid");
  });

  it("removes the drag and overlay listeners when unmounted mid-drag", async () => {
    const wrapper = render();
    await open(wrapper);
    mouse("mousedown", part("hue"), 5, 75);
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const removeWindow = vi.spyOn(window, "removeEventListener");
    release(wrapper);
    const removed = removeDocument.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["mousemove", "mouseup", "click"]));
    expect(removeWindow.mock.calls.map(([type]) => type)).toContain("resize");
  });

  it("applies pt sections, with PrimeVue's overlay merged over panel", async () => {
    const wrapper = render({
      pt: {
        root: { "data-part": "root" },
        preview: { "data-part": "preview" },
        panel: { "data-part": "panel" },
        overlay: { "data-alias": "overlay" },
        content: { "data-part": "content" },
        colorSelector: { "data-part": "colorSelector" },
        colorBackground: { "data-part": "colorBackground" },
        colorHandle: { "data-part": "colorHandle" },
        hue: { "data-part": "hue" },
        hueHandle: { "data-part": "hueHandle" },
      },
    });
    expect(wrapper.attributes("data-part")).toBe("root");
    expect(wrapper.find("input").attributes("data-part")).toBe("preview");
    await open(wrapper);
    for (const name of [
      "panel",
      "content",
      "colorSelector",
      "colorBackground",
      "colorHandle",
      "hue",
      "hueHandle",
    ]) {
      expect(document.querySelector(`[data-part="${name}"]`), name).not.toBeNull();
    }
    expect(panel()!.getAttribute("data-alias")).toBe("overlay");
  });

  it("drops the component classes when unstyled", () => {
    const wrapper = render({ unstyled: true });
    expect(wrapper.element.className).not.toContain("u-color-picker");
    expect(wrapper.find("input").element.className).toBe("");
  });
});
