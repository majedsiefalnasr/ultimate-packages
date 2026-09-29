import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UDock } from "./index";

const items = [
  { label: "Finder", icon: "pi pi-search" },
  { label: "Mail", icon: "pi pi-envelope" },
  { label: "Trash", icon: "pi pi-trash" },
];

describe("UDock", () => {
  it("renders one menuitem per model entry", () => {
    const wrapper = mount(UDock, { props: { model: items } });
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(3);
  });

  it("marks the hovered item active via data-u-active on mouseenter", async () => {
    const wrapper = mount(UDock, { props: { model: items } });
    const links = wrapper.findAll('[role="menuitem"]');
    expect(links[1].attributes("data-u-active")).toBe("false");
    await links[1].trigger("mouseenter");
    expect(links[1].attributes("data-u-active")).toBe("true");
  });

  it("clears the active item on mouseleave", async () => {
    const wrapper = mount(UDock, { props: { model: items } });
    const links = wrapper.findAll('[role="menuitem"]');
    await links[0].trigger("mouseenter");
    await links[0].trigger("mouseleave");
    expect(links[0].attributes("data-u-active")).toBe("false");
  });

  it("applies the position class (default bottom)", () => {
    const wrapper = mount(UDock, { props: { model: items } });
    expect(wrapper.find(".u-dock-bottom").exists()).toBe(true);
  });

  it("applies a non-default position class", () => {
    const wrapper = mount(UDock, { props: { model: items, position: "left" } });
    expect(wrapper.find(".u-dock-left").exists()).toBe(true);
  });

  it("emits item-select and invokes item.command on click", async () => {
    let called = false;
    const model = [{ label: "Trash", command: () => (called = true) }];
    const wrapper = mount(UDock, { props: { model } });
    await wrapper.find("a").trigger("click");
    expect(wrapper.emitted("item-select")).toBeTruthy();
    expect(called).toBe(true);
  });

  it("skips items with visible: false", () => {
    const model = [{ label: "One" }, { label: "Hidden", visible: false }];
    const wrapper = mount(UDock, { props: { model } });
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(1);
  });

  describe("keyboard navigation (Spec §5.4, GAP-055)", () => {
    it("ArrowRight/ArrowLeft move focus among dock items", async () => {
      const model = [{ label: "Finder" }, { label: "Mail" }];
      const wrapper = mount(UDock, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1].element);
      wrapper.unmount();
    });

    it("wraps ArrowLeft from the first item to the last item", async () => {
      const model = [{ label: "Finder" }, { label: "Mail" }, { label: "Trash" }];
      const wrapper = mount(UDock, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowLeft" });
      expect(document.activeElement).toBe(links[2].element);
      wrapper.unmount();
    });

    it("Home/End jump to the first/last item", async () => {
      const model = [{ label: "A" }, { label: "B" }, { label: "C" }];
      const wrapper = mount(UDock, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[1].element as HTMLElement).focus();
      await links[1].trigger("keydown", { code: "End" });
      expect(document.activeElement).toBe(links[2].element);
      wrapper.unmount();
    });

    it("uses ArrowUp/ArrowDown instead when position is left or right", async () => {
      const model = [{ label: "A" }, { label: "B" }];
      const wrapper = mount(UDock, { props: { model, position: "left" }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[1].element);
      wrapper.unmount();
    });

    it("does not move focus on ArrowRight/ArrowLeft when position is left or right", async () => {
      const model = [{ label: "A" }, { label: "B" }];
      const wrapper = mount(UDock, { props: { model, position: "left" }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[0].element);
      wrapper.unmount();
    });

    it("skips disabled items when moving focus", async () => {
      const model = [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }];
      const wrapper = mount(UDock, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[2].element);
      wrapper.unmount();
    });

    it("maps focus correctly when a hidden item precedes the target item (GAP-054 lesson applied proactively)", async () => {
      const model = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "B" }, { label: "C" }];
      const wrapper = mount(UDock, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menuitem"]');
      // Rendered links are [A, B, C] (Hidden is skipped). Focusing A and
      // pressing ArrowRight must move to the rendered B (links[1]), not
      // mis-map into C by indexing against the full 4-item model.
      expect(links.length).toBe(3);
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1].element);
      wrapper.unmount();
    });
  });
});
