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
});
