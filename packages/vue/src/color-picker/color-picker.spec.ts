import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UColorPicker } from "./index";

describe("UColorPicker", () => {
  // UPortal teleports the overlay panel directly to document.body (same
  // pattern documented in select.spec.ts/password.spec.ts) — clean up
  // between tests, and query it via `document`, never `wrapper.find()`.
  afterEach(() => {
    document.querySelectorAll(".u-color-picker-panel").forEach((el) => el.remove());
  });

  it("renders a readonly preview input", () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null } });
    const input = wrapper.find(".u-color-picker-preview");
    expect(input.attributes("readonly")).toBeDefined();
  });

  it("clicking the preview opens the overlay panel", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null } });
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
    await wrapper.find(".u-color-picker-preview").trigger("click");
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
  });

  it("Escape closes the overlay panel", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null } });
    const input = wrapper.find(".u-color-picker-preview");
    await input.trigger("click");
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    await input.trigger("keydown", { code: "Escape" });
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
    expect(wrapper.emitted("hide")).toBeTruthy();
  });

  it("dragging in the color selector emits a hex value via update:modelValue", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null } });
    await wrapper.find(".u-color-picker-preview").trigger("click");

    const selector = document.querySelector(".u-color-picker-color-selector") as HTMLElement;
    selector.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }) as DOMRect;
    selector.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 75, clientY: 75 }));
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0][0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("dragging the hue strip updates the value", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: "#ff0000" } });
    await wrapper.find(".u-color-picker-preview").trigger("click");

    const hue = document.querySelector(".u-color-picker-hue") as HTMLElement;
    hue.getBoundingClientRect = () => ({ left: 0, top: 0, width: 20, height: 150, right: 20, bottom: 150 }) as DOMRect;
    // clientY 75 (mid-strip) maps to hue 180 (cyan) — clearly distinct from
    // the starting red (#ff0000, hue 0/360).
    hue.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 75 }));
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0][0]).not.toBe("#ff0000");
  });

  it("respects the rgb format", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null, format: "rgb" } });
    await wrapper.find(".u-color-picker-preview").trigger("click");

    const selector = document.querySelector(".u-color-picker-color-selector") as HTMLElement;
    selector.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }) as DOMRect;
    selector.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 75, clientY: 75 }));
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted?.[0][0]).toEqual(
      expect.objectContaining({ r: expect.any(Number), g: expect.any(Number), b: expect.any(Number) })
    );
  });

  it("disabled state prevents opening the overlay", async () => {
    const wrapper = mount(UColorPicker, { props: { modelValue: null, disabled: true } });
    await wrapper.find(".u-color-picker-preview").trigger("click");
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });
});
