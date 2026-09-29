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

  describe("keyboard navigation (GAP-054)", () => {
    it("moves focus to the next root item on ArrowDown, wrapping at the end", async () => {
      const wrapper = mount(UPanelMenu, { props: { model: items }, attachTo: document.body });
      const rootLinks = wrapper.findAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
      (rootLinks[0].element as HTMLElement).focus();
      await rootLinks[0].trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(rootLinks[1].element);

      await rootLinks[1].trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(rootLinks[0].element);
      wrapper.unmount();
    });

    it("moves focus to the previous root item on ArrowUp, wrapping at the start", async () => {
      const wrapper = mount(UPanelMenu, { props: { model: items }, attachTo: document.body });
      const rootLinks = wrapper.findAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
      (rootLinks[0].element as HTMLElement).focus();
      await rootLinks[0].trigger("keydown", { code: "ArrowUp" });
      expect(document.activeElement).toBe(rootLinks[1].element);
      wrapper.unmount();
    });

    it("skips a disabled root item during ArrowDown roving focus", async () => {
      const model = [
        { label: "A", items: [{ label: "A1" }] },
        { label: "B", disabled: true },
        { label: "C" },
      ];
      const wrapper = mount(UPanelMenu, { props: { model }, attachTo: document.body });
      const rootLinks = wrapper.findAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
      (rootLinks[0].element as HTMLElement).focus();
      await rootLinks[0].trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(rootLinks[2].element);
      wrapper.unmount();
    });

    it("expands a group item in-place on Enter, leaving focus on its own header", async () => {
      const wrapper = mount(UPanelMenu, { props: { model: items }, attachTo: document.body });
      const firstHeader = wrapper.find('[role="treeitem"] > .u-panelmenu-header-content > a');
      (firstHeader.element as HTMLElement).focus();
      await firstHeader.trigger("keydown", { code: "Enter" });

      const firstItem = wrapper.find('[role="treeitem"]');
      expect(firstItem.attributes("data-u-expanded")).toBe("true");
      expect(document.activeElement).toBe(firstHeader.element);
      wrapper.unmount();
    });

    it("collapses an expanded group item on Space, leaving focus on its own header", async () => {
      const wrapper = mount(UPanelMenu, { props: { model: items }, attachTo: document.body });
      const firstHeader = wrapper.find('[role="treeitem"] > .u-panelmenu-header-content > a');
      (firstHeader.element as HTMLElement).focus();
      await firstHeader.trigger("keydown", { code: "Space" });
      await firstHeader.trigger("keydown", { code: "Space" });

      const firstItem = wrapper.find('[role="treeitem"]');
      expect(firstItem.attributes("data-u-expanded")).toBe("false");
      expect(document.activeElement).toBe(firstHeader.element);
      wrapper.unmount();
    });

    it("does not toggle a disabled group item on Enter", async () => {
      const model = [{ label: "Disabled", disabled: true, items: [{ label: "Hidden" }] }];
      const wrapper = mount(UPanelMenu, { props: { model }, attachTo: document.body });
      const header = wrapper.find('[role="treeitem"] > .u-panelmenu-header-content > a');
      (header.element as HTMLElement).focus();
      await header.trigger("keydown", { code: "Enter" });
      expect(wrapper.find('[role="treeitem"]').attributes("data-u-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("roves focus independently within a nested level reached via real expansion", async () => {
      const model = [
        {
          label: "Files",
          items: [{ label: "Documents" }, { label: "Photos", disabled: true }, { label: "Videos" }],
        },
      ];
      const wrapper = mount(UPanelMenu, { props: { model }, attachTo: document.body });
      const rootHeader = wrapper.find('[role="treeitem"] > .u-panelmenu-header-content > a');
      (rootHeader.element as HTMLElement).focus();
      await rootHeader.trigger("keydown", { code: "Enter" });

      const nestedLinks = wrapper.findAll(
        '[role="tree"] [role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a',
      );
      expect(nestedLinks.length).toBe(3);

      (nestedLinks[0].element as HTMLElement).focus();
      await nestedLinks[0].trigger("keydown", { code: "ArrowDown" });
      // "Photos" is disabled — roving focus must skip it and land on "Videos".
      expect(document.activeElement).toBe(nestedLinks[2].element);

      // Root-level ArrowDown handling must not fire for a nested-level event.
      expect(wrapper.find('[role="treeitem"]').attributes("data-u-expanded")).toBe("true");
      wrapper.unmount();
    });

    describe("index mapping with a hidden item before the target (GAP-054 fix-loop)", () => {
      it("toggles expand/collapse on Enter for a group item positioned after a hidden item", async () => {
        const model = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "Files", items: [{ label: "Doc" }] }];
        const wrapper = mount(UPanelMenu, { props: { model }, attachTo: document.body });
        // "Files" is rendered link index 1 (Hidden renders no <li>/<a>), but model index 2.
        const links = wrapper.findAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
        const filesLink = links[1];
        (filesLink.element as HTMLElement).focus();
        await filesLink.trigger("keydown", { code: "Enter" });

        const filesItem = filesLink.element.closest('[role="treeitem"]') as HTMLElement;
        expect(filesItem.getAttribute("data-u-expanded")).toBe("true");

        wrapper.unmount();
      });

      it("ArrowDown from an item after a hidden item does not get stuck", async () => {
        const model = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "B" }, { label: "C" }];
        const wrapper = mount(UPanelMenu, { props: { model }, attachTo: document.body });
        const links = wrapper.findAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
        // Rendered links are [A, B, C] (Hidden renders no <li>/<a>).
        const [a, b, c] = links;
        (b.element as HTMLElement).focus();
        await b.trigger("keydown", { code: "ArrowDown" });
        expect(document.activeElement).toBe(c.element);

        await c.trigger("keydown", { code: "ArrowUp" });
        expect(document.activeElement).toBe(b.element);

        await b.trigger("keydown", { code: "ArrowUp" });
        expect(document.activeElement).toBe(a.element);

        wrapper.unmount();
      });
    });
  });
});
