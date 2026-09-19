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
});
