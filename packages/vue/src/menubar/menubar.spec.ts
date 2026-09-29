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

  describe("keyboard navigation (GAP-054)", () => {
    const rootLink = (wrapper: ReturnType<typeof mount>, index: number) =>
      wrapper.findAll(".u-menubar-root-list > li > .u-menubar-item-content > a")[index];

    it("carries ARIA roles for menubar/menu/menuitem", () => {
      const wrapper = mount(UMenubar, { props: { model: items } });
      expect(wrapper.find(".u-menubar-root-list").attributes("role")).toBe("menubar");
      const rootLinks = wrapper.findAll(".u-menubar-root-list > li > .u-menubar-item-content > a");
      rootLinks.forEach((link) => expect(link.attributes("role")).toBe("menuitem"));
    });

    it("moves focus with ArrowRight/ArrowLeft among root items", async () => {
      const wrapper = mount(UMenubar, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      const edit = rootLink(wrapper, 1);
      const help = rootLink(wrapper, 2);

      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(edit.element);

      await edit.trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(help.element);

      // Wraps around.
      await help.trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(file.element);

      await file.trigger("keydown", { code: "ArrowLeft" });
      expect(document.activeElement).toBe(help.element);

      wrapper.unmount();
    });

    it("skips disabled items in roving focus", async () => {
      const model = [{ label: "One" }, { label: "Two", disabled: true }, { label: "Three" }];
      const wrapper = mount(UMenubar, { props: { model }, attachTo: document.body });
      const one = rootLink(wrapper, 0);
      const three = rootLink(wrapper, 2);

      (one.element as HTMLElement).focus();
      await one.trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(three.element);

      wrapper.unmount();
    });

    it("opens a submenu and focuses its first item on Enter/Space", async () => {
      const wrapper = mount(UMenubar, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
      expect(fileItem.attributes("data-u-open")).toBe("true");

      const firstSubItemLink = fileItem.find(".u-menubar-submenu > li:first-child > .u-menubar-item-content > a");
      expect(document.activeElement).toBe(firstSubItemLink.element);

      wrapper.unmount();
    });

    it("closes the innermost open submenu on Escape and refocuses its trigger", async () => {
      const wrapper = mount(UMenubar, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
      const firstSubItemLink = fileItem.find(".u-menubar-submenu > li:first-child > .u-menubar-item-content > a");
      expect(document.activeElement).toBe(firstSubItemLink.element);

      await firstSubItemLink.trigger("keydown", { code: "Escape" });

      expect(fileItem.attributes("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(file.element);

      wrapper.unmount();
    });

    it("closes only the innermost submenu when nested two levels deep via real keyboard navigation", async () => {
      const wrapper = mount(UMenubar, { props: { model: items }, attachTo: document.body });
      // File (root) -> Open (submenu item 2, has nested "Recent") -> Recent (nested submenu).
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
      const newLink = fileItem.find(".u-menubar-submenu > li:nth-child(1) > .u-menubar-item-content > a");
      expect(document.activeElement).toBe(newLink.element);

      // Move down within the open submenu to "Open" (has its own nested submenu).
      await newLink.trigger("keydown", { code: "ArrowDown" });
      const openItemLi = fileItem.find(".u-menubar-submenu > li:nth-child(2)");
      const openLink = openItemLi.find(":scope > .u-menubar-item-content > a");
      expect(document.activeElement).toBe(openLink.element);

      // Open the nested submenu via Enter, landing focus on "Recent".
      await openLink.trigger("keydown", { code: "Enter" });
      expect(openItemLi.attributes("data-u-open")).toBe("true");
      const recentLink = openItemLi.find(".u-menubar-submenu > li:first-child > .u-menubar-item-content > a");
      expect(document.activeElement).toBe(recentLink.element);

      // Escape from the deepest level closes only that level, not the parent "File" menu.
      await recentLink.trigger("keydown", { code: "Escape" });
      expect(openItemLi.attributes("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(openLink.element);
      expect(fileItem.attributes("data-u-open")).toBe("true");

      wrapper.unmount();
    });

    describe("index mapping with a separator/hidden item before the target (GAP-054 fix-loop)", () => {
      const modelWithSeparator = [
        { label: "New" },
        { separator: true },
        { label: "Open", items: [{ label: "Recent" }] },
        { label: "Exit" },
      ];

      it("opens the submenu on Enter for a group item positioned after a separator", async () => {
        const wrapper = mount(UMenubar, {
          props: { model: [{ label: "File", items: modelWithSeparator }] },
          attachTo: document.body,
        });
        const file = rootLink(wrapper, 0);
        (file.element as HTMLElement).focus();
        await file.trigger("keydown", { code: "Enter" });

        const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
        // "Open" is rendered link index 1 (separator has no <a>), but model index 2.
        const openLink = fileItem.findAll(".u-menubar-submenu > li > .u-menubar-item-content > a")[1];
        (openLink.element as HTMLElement).focus();
        await openLink.trigger("keydown", { code: "Enter" });

        const openLi = openLink.element.closest("li") as HTMLElement;
        expect(openLi.getAttribute("data-u-open")).toBe("true");

        wrapper.unmount();
      });

      it("Escape from a nested item refocuses the correct owning trigger, not a sibling shifted by a separator", async () => {
        const wrapper = mount(UMenubar, {
          props: { model: [{ label: "File", items: modelWithSeparator }] },
          attachTo: document.body,
        });
        const file = rootLink(wrapper, 0);
        (file.element as HTMLElement).focus();
        await file.trigger("keydown", { code: "Enter" });

        const fileItem = wrapper.findAll(".u-menubar-root-list > li")[0];
        const openLink = fileItem.findAll(".u-menubar-submenu > li > .u-menubar-item-content > a")[1];
        (openLink.element as HTMLElement).focus();
        await openLink.trigger("keydown", { code: "Enter" });

        const openLi = wrapper.findAll(".u-menubar-submenu > li").find((li) => li.element === openLink.element.closest("li"))!;
        const recentLink = openLi.find(".u-menubar-submenu > li:first-child > .u-menubar-item-content > a");
        expect(document.activeElement).toBe(recentLink.element);

        await recentLink.trigger("keydown", { code: "Escape" });

        // Must refocus "Open" (its real owning trigger), not "Exit".
        expect(document.activeElement).toBe(openLink.element);

        wrapper.unmount();
      });

      it("ArrowLeft from a root item after a hidden item does not get stuck", async () => {
        const model = [{ label: "A" }, { label: "Hidden", visible: false }, { label: "B" }, { label: "C" }];
        const wrapper = mount(UMenubar, { props: { model }, attachTo: document.body });
        const links = wrapper.findAll(".u-menubar-root-list > li > .u-menubar-item-content > a");
        // Rendered links are [A, B, C] (Hidden renders no <li>/<a>).
        const [a, b, c] = links;
        (b.element as HTMLElement).focus();
        await b.trigger("keydown", { code: "ArrowLeft" });
        expect(document.activeElement).toBe(a.element);

        await a.trigger("keydown", { code: "ArrowLeft" });
        expect(document.activeElement).toBe(c.element);

        wrapper.unmount();
      });
    });
  });
});
