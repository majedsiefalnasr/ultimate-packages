import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { USplitter } from "./index";

function mockOffset(el: HTMLElement, width: number): void {
  Object.defineProperty(el, "offsetWidth", { value: width, configurable: true });
}

/** jsdom's `MouseEvent` doesn't accept `pageX`/`pageY` via its constructor init dict — set them directly. */
function mouseEventAt(type: string, pageX: number): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, "pageX", { value: pageX, configurable: true });
  Object.defineProperty(event, "pageY", { value: 0, configurable: true });
  return event;
}

describe("USplitter", () => {
  it("renders one panel wrapper per panels entry, with gutters between them", () => {
    const wrapper = mount(USplitter, {
      props: { panels: [{ id: "a" }, { id: "b" }] },
      slots: { default: (slotProps: { item: { id: string } }) => h("span", slotProps.item.id) },
    });
    const panels = wrapper.findAll(".u-splitter-panel");
    const gutters = wrapper.findAll(".u-splitter-gutter");
    expect(panels.length).toBe(2);
    expect(gutters.length).toBe(1);
    expect(panels[0].text()).toBe("a");
    expect(panels[1].text()).toBe("b");
  });

  it("distributes initial panel sizes evenly", () => {
    const wrapper = mount(USplitter, { props: { panels: [{}, {}] } });
    const panels = wrapper.findAll(".u-splitter-panel");
    expect((panels[0].element as HTMLElement).style.flexBasis).toContain("50%");
    expect((panels[1].element as HTMLElement).style.flexBasis).toContain("50%");
  });

  it("resizes panels on a mousedown/mousemove/mouseup drag sequence", async () => {
    const wrapper = mount(USplitter, { props: { panels: [{}, {}] } });
    mockOffset(wrapper.element as HTMLElement, 400);
    const gutter = wrapper.find(".u-splitter-gutter").element as HTMLElement;

    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    document.dispatchEvent(mouseEventAt("mousemove", 240));
    document.dispatchEvent(mouseEventAt("mouseup", 240));
    await wrapper.vm.$nextTick();

    const panels = wrapper.findAll(".u-splitter-panel");
    expect((panels[0].element as HTMLElement).style.flexBasis).toContain("60%");
  });

  it("clamps resize against each panel's minSize", async () => {
    const wrapper = mount(USplitter, { props: { panels: [{ minSize: 45 }, {}] } });
    mockOffset(wrapper.element as HTMLElement, 400);
    const gutter = wrapper.find(".u-splitter-gutter").element as HTMLElement;

    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    document.dispatchEvent(mouseEventAt("mousemove", 0));
    document.dispatchEvent(mouseEventAt("mouseup", 0));
    await wrapper.vm.$nextTick();

    const panels = wrapper.findAll(".u-splitter-panel");
    expect((panels[0].element as HTMLElement).style.flexBasis).toContain("45%");
  });

  it("resizes on ArrowRight keydown for a horizontal layout, by step", async () => {
    const wrapper = mount(USplitter, { props: { panels: [{}, {}], step: 10 } });
    mockOffset(wrapper.element as HTMLElement, 400);
    const handle = wrapper.find(".u-splitter-gutter-handle").element as HTMLElement;

    handle.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "ArrowRight" }));
    handle.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    await wrapper.vm.$nextTick();

    const panels = wrapper.findAll(".u-splitter-panel");
    expect((panels[0].element as HTMLElement).style.flexBasis).not.toContain("50%");
  });

  it("emits resizestart and resizeend around a drag", () => {
    const wrapper = mount(USplitter, { props: { panels: [{}, {}] } });
    mockOffset(wrapper.element as HTMLElement, 400);
    const gutter = wrapper.find(".u-splitter-gutter").element as HTMLElement;

    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    expect(wrapper.emitted("resizestart")).toHaveLength(1);
    document.dispatchEvent(mouseEventAt("mouseup", 200));
    expect(wrapper.emitted("resizeend")).toHaveLength(1);
  });

  it("applies vertical layout class", () => {
    const wrapper = mount(USplitter, { props: { panels: [{}, {}], layout: "vertical" } });
    expect(wrapper.find(".u-splitter").classes()).toContain("u-splitter-vertical");
  });
});
