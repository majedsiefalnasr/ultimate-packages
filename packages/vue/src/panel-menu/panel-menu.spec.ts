import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UPanelMenu } from "./index";

const items = [
  { label: "Files", items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }] },
  { label: "Settings" },
];

describe("UPanelMenu", () => {
  it("renders a tree of root items, collapsed by default", () => {
    const wrapper = mount(UPanelMenu, { props: { model: items } });
    const rootItems = wrapper.findAll('[role="tree"] > [role="treeitem"]');
    expect(rootItems.length).toBe(2);
    expect(rootItems[0].attributes("data-u-expanded")).toBe("false");
  });

  it("expands a group item in-place on header click", async () => {
    const wrapper = mount(UPanelMenu, { props: { model: items } });
    const firstHeader = wrapper.find('[role="treeitem"] a');
    await firstHeader.trigger("click");
    const firstItem = wrapper.find('[role="treeitem"]');
    expect(firstItem.attributes("data-u-expanded")).toBe("true");
    expect(firstItem.attributes("aria-expanded")).toBe("true");
    expect(firstItem.find('[role="tree"]').exists()).toBe(true);
  });

  it("collapses an expanded group on a second header click", async () => {
    const wrapper = mount(UPanelMenu, { props: { model: items } });
    const firstHeader = wrapper.find('[role="treeitem"] a');
    await firstHeader.trigger("click");
    await firstHeader.trigger("click");
    const firstItem = wrapper.find('[role="treeitem"]');
    expect(firstItem.attributes("data-u-expanded")).toBe("false");
  });

  it("collapses sibling panels when multiple is false (accordion behavior)", async () => {
    const model = [
      { label: "A", items: [{ label: "A1" }] },
      { label: "B", items: [{ label: "B1" }] },
    ];
    const wrapper = mount(UPanelMenu, { props: { model } });
    const rootItems = wrapper.findAll('[role="tree"] > [role="treeitem"]');
    await rootItems[0].find("a").trigger("click");
    await rootItems[1].find("a").trigger("click");
    expect(rootItems[0].attributes("data-u-expanded")).toBe("false");
    expect(rootItems[1].attributes("data-u-expanded")).toBe("true");
  });

  it("allows multiple concurrently-expanded panels when multiple is true", async () => {
    const model = [
      { label: "A", items: [{ label: "A1" }] },
      { label: "B", items: [{ label: "B1" }] },
    ];
    const wrapper = mount(UPanelMenu, { props: { model, multiple: true } });
    const rootItems = wrapper.findAll('[role="tree"] > [role="treeitem"]');
    await rootItems[0].find("a").trigger("click");
    await rootItems[1].find("a").trigger("click");
    expect(rootItems[0].attributes("data-u-expanded")).toBe("true");
    expect(rootItems[1].attributes("data-u-expanded")).toBe("true");
  });

  it("supports drill-down to a doubly-nested group", async () => {
    const wrapper = mount(UPanelMenu, { props: { model: items } });
    const firstHeader = wrapper.find('[role="treeitem"] a');
    await firstHeader.trigger("click");
    const nestedHeader = wrapper.find('[role="tree"] [role="tree"] [role="treeitem"] a');
    expect(nestedHeader.exists()).toBe(true);
    await nestedHeader.trigger("click");
    expect(wrapper.find('[role="tree"] [role="tree"] [role="tree"]').exists()).toBe(true);
  });

  it("emits item-select and calls item.command for a leaf item", async () => {
    let called = false;
    const model = [{ label: "Leaf", command: () => (called = true) }];
    const wrapper = mount(UPanelMenu, { props: { model } });
    await wrapper.find("a").trigger("click");
    expect(called).toBe(true);
    expect(wrapper.emitted("item-select")).toBeTruthy();
  });

  it("does not expand or invoke command for a disabled group item", async () => {
    let called = false;
    const model = [{ label: "Disabled", disabled: true, items: [{ label: "Hidden" }], command: () => (called = true) }];
    const wrapper = mount(UPanelMenu, { props: { model } });
    const link = wrapper.find("a");
    expect(link.attributes("aria-disabled")).toBe("true");
    await link.trigger("click");
    expect(called).toBe(false);
    expect(wrapper.find('[role="treeitem"]').attributes("data-u-expanded")).toBe("false");
  });

  it("hides an item whose visible is false", () => {
    const wrapper = mount(UPanelMenu, { props: { model: [...items, { label: "Hidden", visible: false }] } });
    expect(wrapper.text()).not.toContain("Hidden");
  });
});
