import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UTieredMenu } from "./index";

// UTieredMenu's imperative show()/hide()/toggle() methods (declared inside
// TieredMenu.vue's own `methods:` block, merged in at runtime via
// `extends: createBaseTieredMenu()`) are not visible on `createBaseTieredMenu()`'s
// deliberately-wide `ComponentOptions` return type — same pre-existing,
// documented project-wide gap `menu.spec.ts` already found and worked
// around for `UMenu`'s own instance methods (see that file's own comment
// for the full explanation). A small local interface describing just the
// public imperative surface this test file calls is declared here and
// used to cast `wrapper.vm` at each call site below.
interface UTieredMenuInstance {
  show(): void;
  hide(): void;
  toggle(): void;
}

const items = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit" },
];

describe("UTieredMenu", () => {
  it('renders role="menu" and root-level items when inline (popup: false)', () => {
    const wrapper = mount(UTieredMenu, { props: { model: items } });
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(2);
  });

  it("does not render its content when popup: true and not yet shown", () => {
    const wrapper = mount(UTieredMenu, { props: { model: items, popup: true } });
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it("renders its content after show() is called for a popup menu", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items, popup: true } });
    (wrapper.vm as unknown as UTieredMenuInstance).show();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });

  it("hides after hide() is called", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items, popup: true } });
    (wrapper.vm as unknown as UTieredMenuInstance).show();
    await wrapper.vm.$nextTick();
    (wrapper.vm as unknown as UTieredMenuInstance).hide();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it("toggle() flips visibility", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items, popup: true } });
    (wrapper.vm as unknown as UTieredMenuInstance).toggle();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    (wrapper.vm as unknown as UTieredMenuInstance).toggle();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it("hides on Escape when popup and visible", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items, popup: true } });
    (wrapper.vm as unknown as UTieredMenuInstance).show();
    await wrapper.vm.$nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it("opens a nested submenu on hover of a group item", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items } });
    const fileItem = wrapper.find('[role="menuitem"]');
    await fileItem.trigger("mouseenter");
    expect(fileItem.attributes("data-u-open")).toBe("true");
  });

  it("renders drill-down (doubly-nested) submenus", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: items } });
    const fileItem = wrapper.find('[role="menuitem"]');
    await fileItem.trigger("mouseenter");
    expect(fileItem.find(".u-tieredmenu-submenu .u-tieredmenu-submenu").exists()).toBe(true);
  });

  it("emits item-select and closes the popup on a leaf item click", async () => {
    const wrapper = mount(UTieredMenu, { props: { model: [{ label: "Action" }], popup: true } });
    (wrapper.vm as unknown as UTieredMenuInstance).show();
    await wrapper.vm.$nextTick();
    await wrapper.find("a").trigger("click");
    expect(wrapper.emitted("item-select")).toBeTruthy();
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  describe("keyboard navigation (GAP-054)", () => {
    const rootLink = (wrapper: ReturnType<typeof mount>, index: number) =>
      wrapper.findAll(".u-tieredmenu-root-list > li > .u-tieredmenu-item-content > a")[index];

    it("carries ARIA roles for menu/menuitem", () => {
      const wrapper = mount(UTieredMenu, { props: { model: items } });
      expect(wrapper.find(".u-tieredmenu-root-list").attributes("role")).toBe("menu");
      const rootLinks = wrapper.findAll(".u-tieredmenu-root-list > li > .u-tieredmenu-item-content > a");
      rootLinks.forEach((link) => expect(link.attributes("role")).toBeUndefined());
    });

    it("moves focus with ArrowDown/ArrowUp among root items (same axis at every level)", async () => {
      const wrapper = mount(UTieredMenu, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      const edit = rootLink(wrapper, 1);

      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(edit.element);

      // Wraps around.
      await edit.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(file.element);

      await file.trigger("keydown", { code: "ArrowUp" });
      expect(document.activeElement).toBe(edit.element);

      wrapper.unmount();
    });

    it("skips disabled items in roving focus", async () => {
      const model = [{ label: "One" }, { label: "Two", disabled: true }, { label: "Three" }];
      const wrapper = mount(UTieredMenu, { props: { model }, attachTo: document.body });
      const one = rootLink(wrapper, 0);
      const three = rootLink(wrapper, 2);

      (one.element as HTMLElement).focus();
      await one.trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(three.element);

      wrapper.unmount();
    });

    it("opens a submenu and focuses its first item on Enter/Space", async () => {
      const wrapper = mount(UTieredMenu, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-tieredmenu-root-list > li")[0];
      expect(fileItem.attributes("data-u-open")).toBe("true");

      const firstSubItemLink = fileItem.find(".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-item-content > a");
      expect(document.activeElement).toBe(firstSubItemLink.element);

      wrapper.unmount();
    });

    it("closes the innermost open submenu on Escape and refocuses its trigger", async () => {
      const wrapper = mount(UTieredMenu, { props: { model: items }, attachTo: document.body });
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-tieredmenu-root-list > li")[0];
      const firstSubItemLink = fileItem.find(".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-item-content > a");
      expect(document.activeElement).toBe(firstSubItemLink.element);

      await firstSubItemLink.trigger("keydown", { code: "Escape" });

      expect(fileItem.attributes("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(file.element);

      wrapper.unmount();
    });

    it("closes only the innermost submenu when nested two levels deep via real keyboard navigation", async () => {
      const wrapper = mount(UTieredMenu, { props: { model: items }, attachTo: document.body });
      // File (root) -> Open (submenu item 2, has nested "Recent") -> Recent (nested submenu).
      const file = rootLink(wrapper, 0);
      (file.element as HTMLElement).focus();
      await file.trigger("keydown", { code: "Enter" });

      const fileItem = wrapper.findAll(".u-tieredmenu-root-list > li")[0];
      const newLink = fileItem.find(".u-tieredmenu-submenu > li:nth-child(1) > .u-tieredmenu-item-content > a");
      expect(document.activeElement).toBe(newLink.element);

      // Move down within the open submenu to "Open" (has its own nested submenu).
      await newLink.trigger("keydown", { code: "ArrowDown" });
      const openItemLi = fileItem.find(".u-tieredmenu-submenu > li:nth-child(2)");
      const openLink = openItemLi.find(":scope > .u-tieredmenu-item-content > a");
      expect(document.activeElement).toBe(openLink.element);

      // Open the nested submenu via Enter, landing focus on "Recent".
      await openLink.trigger("keydown", { code: "Enter" });
      expect(openItemLi.attributes("data-u-open")).toBe("true");
      const recentLink = openItemLi.find(".u-tieredmenu-submenu > li:first-child > .u-tieredmenu-item-content > a");
      expect(document.activeElement).toBe(recentLink.element);

      // Escape from the deepest level closes only that level, not the parent "File" menu.
      await recentLink.trigger("keydown", { code: "Escape" });
      expect(openItemLi.attributes("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(openLink.element);
      expect(fileItem.attributes("data-u-open")).toBe("true");

      wrapper.unmount();
    });
  });
});
