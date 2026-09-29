import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USpeedDial } from "./index";

const items = [{ label: "Add", icon: "pi pi-plus" }, { label: "Edit", icon: "pi pi-pencil" }, { label: "Delete", icon: "pi pi-trash" }];

describe("USpeedDial", () => {
  it("renders collapsed by default (aria-expanded false)", () => {
    const wrapper = mount(USpeedDial, { props: { model: items } });
    expect(wrapper.find("button").attributes("aria-expanded")).toBe("false");
  });

  it("renders one menuitem action button per model entry", () => {
    const wrapper = mount(USpeedDial, { props: { model: items } });
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(3);
  });

  it("expands on toggle-button click", async () => {
    const wrapper = mount(USpeedDial, { props: { model: items } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
  });

  it("collapses on a second toggle-button click", async () => {
    const wrapper = mount(USpeedDial, { props: { model: items } });
    const toggle = wrapper.find("button");
    await toggle.trigger("click");
    await toggle.trigger("click");
    expect(wrapper.find("button").attributes("aria-expanded")).toBe("false");
  });

  it("emits update:visible and show/hide on toggling", async () => {
    const wrapper = mount(USpeedDial, { props: { model: items } });
    const toggle = wrapper.find("button");
    await toggle.trigger("click");
    expect(wrapper.emitted("show")).toBeTruthy();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([true]);
    await toggle.trigger("click");
    expect(wrapper.emitted("hide")).toBeTruthy();
  });

  it("clicking an action item invokes its command and collapses the dial", async () => {
    let called = false;
    const model = [{ label: "Delete", command: () => (called = true) }];
    const wrapper = mount(USpeedDial, { props: { model } });
    await wrapper.find("button").trigger("click");
    await wrapper.find('[role="menuitem"]').trigger("click");
    expect(called).toBe(true);
    expect(wrapper.find("button").attributes("aria-expanded")).toBe("false");
  });

  it("hides on Escape when closeOnEscape (default) and visible", async () => {
    const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
    await wrapper.find("button").trigger("click");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").attributes("aria-expanded")).toBe("false");
  });

  it("disabled action items are not clickable (button disabled attribute set)", async () => {
    const model = [{ label: "Delete", disabled: true }];
    const wrapper = mount(USpeedDial, { props: { model } });
    await wrapper.find("button").trigger("click");
    expect((wrapper.find('[role="menuitem"]').element as HTMLButtonElement).disabled).toBe(true);
  });

  describe("keyboard navigation (GAP-056)", () => {
    it("ArrowDown moves focus to the next item for a vertical (default 'up') direction", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[0]!.element as HTMLButtonElement).focus();
      await menuitems[0]!.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuitems[1]!.element);
      wrapper.unmount();
    });

    it("ArrowUp moves focus to the previous item for a vertical direction", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[1]!.element as HTMLButtonElement).focus();
      await menuitems[1]!.trigger("keydown", { code: "ArrowUp" });
      expect(document.activeElement).toBe(menuitems[0]!.element);
      wrapper.unmount();
    });

    it("uses ArrowRight/ArrowLeft instead of ArrowDown/ArrowUp when direction is 'right'", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items, direction: "right" }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[0]!.element as HTMLButtonElement).focus();
      await menuitems[0]!.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuitems[0]!.element);
      await menuitems[0]!.trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(menuitems[1]!.element);
      wrapper.unmount();
    });

    it("wraps around from the last item to the first on ArrowDown", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[2]!.element as HTMLButtonElement).focus();
      await menuitems[2]!.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuitems[0]!.element);
      wrapper.unmount();
    });

    it("wraps around from the first item to the last on ArrowUp", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[0]!.element as HTMLButtonElement).focus();
      await menuitems[0]!.trigger("keydown", { code: "ArrowUp" });
      expect(document.activeElement).toBe(menuitems[2]!.element);
      wrapper.unmount();
    });

    it("skips disabled items when moving focus", async () => {
      const model = [{ label: "Add" }, { label: "Edit", disabled: true }, { label: "Delete" }];
      const wrapper = mount(USpeedDial, { props: { model }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      const menuitems = wrapper.findAll('[role="menuitem"]');
      (menuitems[0]!.element as HTMLButtonElement).focus();
      await menuitems[0]!.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(menuitems[2]!.element);
      wrapper.unmount();
    });

    it("hides on Escape when closeOnEscape (default) and visible (existing mechanism, unmodified)", async () => {
      const wrapper = mount(USpeedDial, { props: { model: items }, attachTo: document.body });
      await wrapper.find("button").trigger("click");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wrapper.vm.$nextTick();
      expect(wrapper.find("button").attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });
  });
});
