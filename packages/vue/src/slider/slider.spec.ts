import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USlider } from "./index";

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
    root.element.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 }) as DOMRect;
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
});
