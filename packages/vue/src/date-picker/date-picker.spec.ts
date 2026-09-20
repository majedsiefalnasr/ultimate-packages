import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UDatePicker } from "./index";

describe("UDatePicker", () => {
  // UPortal teleports the overlay panel directly to document.body (same
  // pattern documented in select.spec.ts/color-picker.spec.ts) — clean up
  // between tests, and query it via `document`, never `wrapper.find()`.
  afterEach(() => {
    document.querySelectorAll(".u-date-picker-panel").forEach((el) => el.remove());
  });

  it("renders a readonly text input showing empty value when nothing is selected", () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: null, placeholder: "Select a date" } });
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("readonly")).toBeDefined();
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("clicking the input opens the overlay panel with a day grid", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: null } });
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
    await wrapper.find("input").trigger("click");
    expect(document.querySelector(".u-date-picker-panel")).not.toBeNull();
    expect(document.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(27);
  });

  it("selecting a date emits update:modelValue, formats the input, and closes the overlay", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: new Date(2026, 8, 1) } });
    await wrapper.find("input").trigger("click");

    const day15 = Array.from(document.querySelectorAll('[role="gridcell"]')).find(
      (el) => el.textContent?.trim() === "15" && !el.className.includes("other-month")
    ) as HTMLElement;
    day15.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect((emitted?.[0][0] as Date).getDate()).toBe(15);
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
  });

  it("navigates months with the header prev/next buttons", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: new Date(2026, 8, 1) } });
    await wrapper.find("input").trigger("click");

    const titleBefore = document.querySelector(".u-date-picker-title")?.textContent?.trim();
    const nextButton = document.querySelectorAll(".u-date-picker-nav-button")[1] as HTMLElement;
    nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    const titleAfter = document.querySelector(".u-date-picker-title")?.textContent?.trim();

    expect(titleAfter).not.toBe(titleBefore);
  });

  it("supports arrow-key grid navigation across the day grid", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: new Date(2026, 8, 15) } });
    await wrapper.find("input").trigger("click");

    let focused = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focused.textContent?.trim()).toBe("15");

    focused.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    focused = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focused.textContent?.trim()).toBe("16");

    focused.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    await wrapper.vm.$nextTick();
    focused = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focused.textContent?.trim()).toBe("23");

    focused.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:modelValue");
    expect((emitted?.[0][0] as Date).getDate()).toBe(23);
  });

  it("closes the overlay on Escape", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: null } });
    const input = wrapper.find("input");
    await input.trigger("click");
    expect(document.querySelector(".u-date-picker-panel")).not.toBeNull();

    await input.trigger("keydown", { code: "Escape" });
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
  });

  it("respects minDate/maxDate — dates outside the range are marked disabled and cannot be selected", async () => {
    const wrapper = mount(UDatePicker, {
      props: {
        modelValue: null,
        minDate: new Date(2026, 8, 10),
        maxDate: new Date(2026, 8, 20),
      },
    });
    await wrapper.find("input").trigger("click");

    const day5 = Array.from(document.querySelectorAll('[role="gridcell"]')).find(
      (el) => el.textContent?.trim() === "5" && !el.className.includes("other-month")
    ) as HTMLElement;
    expect(day5.getAttribute("aria-disabled")).toBe("true");
    day5.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("clears the value via the clear icon when showClear is set", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: new Date(2026, 8, 18), showClear: true } });
    const clearIcon = wrapper.find(".u-date-picker-clear-icon");
    await clearIcon.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
  });

  it("disabled state prevents opening the overlay", async () => {
    const wrapper = mount(UDatePicker, { props: { modelValue: null, disabled: true } });
    await wrapper.find("input").trigger("click");
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
  });
});
