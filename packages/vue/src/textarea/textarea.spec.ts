import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UTextarea } from "./index";

describe("UTextarea — controlled (v-model)", () => {
  it("renders a single native textarea", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "" } });
    expect(wrapper.findAll("textarea")).toHaveLength(1);
  });

  it("reflects modelValue as the textarea's value", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "hello" } });
    expect((wrapper.find("textarea").element as HTMLTextAreaElement).value).toBe("hello");
  });

  it("emits update:modelValue with the typed value on input", async () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "" } });
    await wrapper.find("textarea").setValue("multi\nline");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["multi\nline"]);
  });

  it("does not manage its own value when controlled — reflects the prop only", async () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "a" } });
    await wrapper.setProps({ modelValue: "b" });
    expect((wrapper.find("textarea").element as HTMLTextAreaElement).value).toBe("b");
  });
});

describe("UTextarea — accessibility and pass-through", () => {
  it("aria-invalid reflects the invalid prop", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", invalid: true } });
    expect(wrapper.find("textarea").attributes("aria-invalid")).toBe("true");
  });

  it("disabled/name/placeholder pass through", () => {
    const wrapper = mount(UTextarea, {
      props: { modelValue: "", disabled: true, name: "bio", placeholder: "Tell us about you" },
    });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("disabled")).toBeDefined();
    expect(textarea.attributes("name")).toBe("bio");
    expect(textarea.attributes("placeholder")).toBe("Tell us about you");
  });

  it("emits focus/blur events", async () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "" } });
    await wrapper.find("textarea").trigger("focus");
    await wrapper.find("textarea").trigger("blur");
    expect(wrapper.emitted("focus")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });
});

describe("UTextarea — autoResize", () => {
  it("applies the resizable class when autoResize is true", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", autoResize: true } });
    expect(wrapper.find("textarea").classes()).toContain("u-textarea-resizable");
  });

  it("does not apply the resizable class by default", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "" } });
    expect(wrapper.find("textarea").classes()).not.toContain("u-textarea-resizable");
  });

  it("resize() grows the element's height to its scrollHeight when it needs more room", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", autoResize: true } });
    const el = wrapper.find("textarea").element as HTMLTextAreaElement;

    Object.defineProperty(el, "offsetParent", { value: document.body, configurable: true });
    Object.defineProperty(el, "scrollHeight", { value: 120, configurable: true });

    (wrapper.vm as unknown as { resize: () => void }).resize();

    expect(el.style.height).toBe("120px");
  });

  it("resize() shrinks the element via the auto-then-remeasure two-step when content got shorter", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", autoResize: true } });
    const el = wrapper.find("textarea").element as HTMLTextAreaElement;

    Object.defineProperty(el, "offsetParent", { value: document.body, configurable: true });
    el.style.height = "200px";
    Object.defineProperty(el, "scrollHeight", { value: 60, configurable: true });

    (wrapper.vm as unknown as { resize: () => void }).resize();

    expect(el.style.height).toBe("60px");
  });

  it("resize() is a no-op when the element has no offsetParent (detached)", () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", autoResize: true } });
    const el = wrapper.find("textarea").element as HTMLTextAreaElement;

    Object.defineProperty(el, "offsetParent", { value: null, configurable: true });
    el.style.height = "42px";

    (wrapper.vm as unknown as { resize: () => void }).resize();

    expect(el.style.height).toBe("42px");
  });

  it("calls resize() on input when autoResize is enabled", async () => {
    const wrapper = mount(UTextarea, { props: { modelValue: "", autoResize: true } });
    const resizeSpy = vi.spyOn(wrapper.vm as unknown as { resize: () => void }, "resize");

    await wrapper.find("textarea").setValue("grows");

    expect(resizeSpy).toHaveBeenCalled();
  });
});
