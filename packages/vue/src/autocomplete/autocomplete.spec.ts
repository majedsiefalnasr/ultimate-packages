import { afterEach, describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UAutoComplete } from "./index";

describe("UAutoComplete", () => {
  // UPortal teleports the suggestion-list overlay directly to document.body
  // (same pattern documented in password.spec.ts/dialog.spec.ts) — clean up
  // between tests, and query it via `document` rather than `wrapper.find()`,
  // which only searches the wrapper's own render tree.
  afterEach(() => {
    document.querySelectorAll('[role="listbox"]').forEach((el) => el.remove());
  });

  it("renders a native combobox input", () => {
    const wrapper = mount(UAutoComplete, { props: { modelValue: null } });
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("role")).toBe("combobox");
  });

  it("emits complete after the debounce delay once minLength is met", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UAutoComplete, { props: { modelValue: null, delay: 10 } });
    await wrapper.find("input").setValue("ab");
    vi.advanceTimersByTime(10);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("complete")?.[0][0]).toMatchObject({ query: "ab" });
    vi.useRealTimers();
  });

  it("opens the suggestion overlay and lists provided suggestions", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UAutoComplete, {
      props: { modelValue: null, delay: 1, suggestions: ["Apple", "Banana"] },
    });
    await wrapper.find("input").setValue("a");
    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].textContent?.trim()).toBe("Apple");
    vi.useRealTimers();
  });

  it("navigates suggestions with ArrowDown/ArrowUp and selects with Enter", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UAutoComplete, {
      props: { modelValue: null, delay: 1, suggestions: ["Apple", "Banana"] },
    });
    await wrapper.find("input").setValue("a");
    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();

    await wrapper.find("input").trigger("keydown", { code: "ArrowDown" });
    await wrapper.find("input").trigger("keydown", { code: "Enter" });

    expect(wrapper.emitted("option-select")?.[0][0]).toMatchObject({ value: "Apple" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]);
    vi.useRealTimers();
  });

  it("closes the overlay on Escape", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UAutoComplete, {
      props: { modelValue: null, delay: 1, suggestions: ["Apple"] },
    });
    await wrapper.find("input").setValue("a");
    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();

    await wrapper.find("input").trigger("keydown", { code: "Escape" });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    vi.useRealTimers();
  });

  it("v-model — reflects the modelValue prop in the displayed input text", async () => {
    const wrapper = mount(UAutoComplete, { props: { modelValue: "Apple" } });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("Apple");
    await wrapper.setProps({ modelValue: "Banana" });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("Banana");
  });
});
