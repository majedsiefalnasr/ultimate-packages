import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mount, config } from "@vue/test-utils";
import { USplitButton } from "./index";

const items = [{ label: "Delete" }, { label: "Rename" }];

// @vue/test-utils stubs <transition> by default — same real-environment
// finding menu.spec.ts already documents for UMenu's own popup-mode
// tests. USplitButton composes UMenu in popup mode, so its own popup
// tests need the same real-transition opt-out.
beforeAll(() => {
  config.global.stubs.transition = false;
});
afterAll(() => {
  config.global.stubs.transition = true;
});

describe("USplitButton", () => {
  it("renders two buttons — the default command button and the dropdown toggle", () => {
    const wrapper = mount(USplitButton, { props: { label: "Save", model: items } });
    expect(wrapper.findAll("button").length).toBe(2);
  });

  it("does not render the popup menu until the dropdown button is clicked", () => {
    mount(USplitButton, { props: { label: "Save", model: items }, attachTo: document.body });
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it("opens the popup menu on dropdown button click", async () => {
    const wrapper = mount(USplitButton, { props: { label: "Save", model: items }, attachTo: document.body });
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expect(document.querySelectorAll('[role="menuitem"]').length).toBe(2);
    wrapper.unmount();
  });

  it("closes the popup menu on a second dropdown button click", async () => {
    const wrapper = mount(USplitButton, { props: { label: "Save", model: items }, attachTo: document.body });
    await wrapper.vm.$nextTick();
    const dropdown = wrapper.findAll("button")[1];
    await dropdown.trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    await dropdown.trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("emits click and closes the menu when the default button is clicked", async () => {
    const wrapper = mount(USplitButton, { props: { label: "Save", model: items }, attachTo: document.body });
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    await buttons[0].trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("invokes the item's command when a menu item is selected and closes the popup", async () => {
    let called = false;
    const model = [{ label: "Delete", command: () => (called = true) }];
    const wrapper = mount(USplitButton, { props: { label: "Save", model }, attachTo: document.body });
    await wrapper.vm.$nextTick();
    const dropdown = wrapper.findAll("button")[1];
    await dropdown.trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    const menuItemLink = document.querySelector('[role="menuitem"] a') as HTMLElement;
    menuItemLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(called).toBe(true);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("marks the dropdown button with aria-haspopup=menu", () => {
    const wrapper = mount(USplitButton, { props: { label: "Save", model: items } });
    const dropdown = wrapper.findAll("button")[1];
    expect(dropdown.attributes("aria-haspopup")).toBe("menu");
  });
});
