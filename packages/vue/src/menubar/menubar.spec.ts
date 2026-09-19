import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UMenubar } from "./index";

const items = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }] },
  { label: "Help", url: "/help" },
];

describe("UMenubar", () => {
  it("renders a nav with top-level items", () => {
    const wrapper = mount(UMenubar, { props: { model: items } });
    expect(wrapper.find("nav").exists()).toBe(true);
    expect(wrapper.findAll(".u-menubar-root-list > li").length).toBe(3);
  });

  it("marks items with children as aria-haspopup=menu", () => {
    const wrapper = mount(UMenubar, { props: { model: items } });
    const fileLink = wrapper.findAll(".u-menubar-root-list > li")[0].find("a");
    expect(fileLink.attributes("aria-haspopup")).toBe("menu");
  });

  it("opens a submenu on click of an item with children", async () => {
    const wrapper = mount(UMenubar, { props: { model: items } });
    const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
    await fileItem.find("a").trigger("click");
    expect(fileItem.attributes("data-u-open")).toBe("true");
  });

  it("closes an open submenu when clicked again", async () => {
    const wrapper = mount(UMenubar, { props: { model: items } });
    const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
    const link = fileItem.find("a");
    await link.trigger("click");
    await link.trigger("click");
    expect(fileItem.attributes("data-u-open")).toBe("false");
  });

  it("renders nested (drill-down) submenus", async () => {
    const wrapper = mount(UMenubar, { props: { model: items } });
    const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
    await fileItem.find("a").trigger("click");
    expect(fileItem.find(".u-menubar-submenu .u-menubar-submenu").exists()).toBe(true);
  });

  it("emits item-select and calls item.command for a leaf item click", async () => {
    let called = false;
    const model = [{ label: "Action", command: () => (called = true) }];
    const wrapper = mount(UMenubar, { props: { model } });
    await wrapper.find("a").trigger("click");
    expect(called).toBe(true);
    expect(wrapper.emitted("item-select")).toBeTruthy();
  });

  it("does not open or invoke command for a disabled item", async () => {
    let called = false;
    const model = [{ label: "Disabled", disabled: true, command: () => (called = true) }];
    const wrapper = mount(UMenubar, { props: { model } });
    const link = wrapper.find("a");
    expect(link.attributes("aria-disabled")).toBe("true");
    await link.trigger("click");
    expect(called).toBe(false);
  });

  it("renders a separator item", () => {
    const wrapper = mount(UMenubar, { props: { model: [{ label: "A" }, { separator: true }, { label: "B" }] } });
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
  });

  it("hides an item whose visible is false", () => {
    const wrapper = mount(UMenubar, { props: { model: [...items, { label: "Hidden", visible: false }] } });
    expect(wrapper.text()).not.toContain("Hidden");
  });
});
