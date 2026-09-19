import { afterEach, describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UContextMenu } from "./index";

const items = [
  { label: "Copy" },
  { label: "Paste" },
  { separator: true },
  { label: "Delete", disabled: true },
];

describe("UContextMenu", () => {
  afterEach(() => {
    document.querySelectorAll(".u-contextmenu").forEach((el) => el.remove());
  });

  it("renders nothing until right-clicked", () => {
    mount(UContextMenu, {
      props: { model: items },
      slots: { default: '<div data-testid="target">Target</div>' },
    });
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("shows the menu on the trigger's contextmenu (right-click) event and suppresses the native menu", async () => {
    const wrapper = mount(UContextMenu, {
      props: { model: items },
      slots: { default: '<div class="target">Target</div>' },
      attachTo: document.body,
    });
    const target = wrapper.find(".target").element;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    target.dispatchEvent(event);
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".u-contextmenu")).not.toBeNull();
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.querySelectorAll(".u-contextmenu-item").length).toBe(3);

    wrapper.unmount();
  });

  it("emits item-select and hides when an enabled item is clicked", async () => {
    const wrapper = mount(UContextMenu, {
      props: { model: items },
      slots: { default: '<div class="target">Target</div>' },
      attachTo: document.body,
    });
    const target = wrapper.find(".target").element;
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await wrapper.vm.$nextTick();

    const firstLink = document.querySelector(".u-contextmenu-item-link") as HTMLAnchorElement;
    firstLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("item-select");
    expect(emitted?.[0][0]).toMatchObject({ item: items[0] });
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    wrapper.unmount();
  });

  it("does not select a disabled item", async () => {
    const wrapper = mount(UContextMenu, {
      props: { model: items },
      slots: { default: '<div class="target">Target</div>' },
      attachTo: document.body,
    });
    const target = wrapper.find(".target").element;
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await wrapper.vm.$nextTick();

    const links = document.querySelectorAll(".u-contextmenu-item-link");
    (links[links.length - 1] as HTMLAnchorElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("item-select")).toBeFalsy();

    wrapper.unmount();
  });

  it("hides on outside click", async () => {
    const wrapper = mount(
      {
        components: { UContextMenu },
        props: ["model"],
        template: `<div><UContextMenu :model="model"><div class="target">Target</div></UContextMenu><div class="outside">Outside</div></div>`,
      },
      { props: { model: items }, attachTo: document.body }
    );
    const target = wrapper.find(".target").element;
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();

    wrapper.find(".outside").element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    wrapper.unmount();
  });

  it("hides on Escape", async () => {
    const wrapper = mount(UContextMenu, {
      props: { model: items },
      slots: { default: '<div class="target">Target</div>' },
      attachTo: document.body,
    });
    const target = wrapper.find(".target").element;
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    wrapper.unmount();
  });

  it("global mode listens for contextmenu anywhere on the document", async () => {
    const wrapper = mount(UContextMenu, {
      props: { model: items, global: true },
      attachTo: document.body,
    });
    document.body.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 5, clientY: 5 })
    );
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();

    wrapper.unmount();
  });
});
