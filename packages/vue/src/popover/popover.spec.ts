import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UPopover } from "./index";

const HostComponent = {
  components: { UPopover },
  template: `
    <div>
      <button @click="$refs.op.toggle($event)">Toggle</button>
      <UPopover ref="op" :dismissable="dismissable">
        <div class="panel-content">Popover content</div>
      </UPopover>
    </div>
  `,
  props: { dismissable: { type: Boolean, default: true } },
};

describe("UPopover", () => {
  afterEach(() => {
    document.querySelectorAll(".u-popover").forEach((el) => el.remove());
  });

  it("is hidden until toggled", () => {
    mount(HostComponent);
    expect(document.querySelector(".u-popover")).toBeNull();
  });

  it("shows the overlay on toggle and hides on second toggle", async () => {
    const wrapper = mount(HostComponent, { attachTo: document.body });
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(document.querySelector(".u-popover")).not.toBeNull();
    expect(document.querySelector(".panel-content")?.textContent).toBe("Popover content");

    await button.trigger("click");
    expect(document.querySelector(".u-popover")).toBeNull();

    wrapper.unmount();
  });

  it("emits show/hide when toggled", async () => {
    const wrapper = mount(HostComponent, { attachTo: document.body });
    const button = wrapper.find("button");

    await button.trigger("click");
    const popoverVm = wrapper.findComponent(UPopover);
    expect(popoverVm.emitted("show")).toBeTruthy();

    await button.trigger("click");
    expect(popoverVm.emitted("hide")).toBeTruthy();

    wrapper.unmount();
  });

  it("hides when clicking outside", async () => {
    const wrapper = mount(HostComponent, { attachTo: document.body });
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-popover")).toBeNull();

    wrapper.unmount();
  });

  it("hides on Escape", async () => {
    const wrapper = mount(HostComponent, { attachTo: document.body });
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-popover")).toBeNull();

    wrapper.unmount();
  });

  it("does not hide on outside click when dismissable is false", async () => {
    const wrapper = mount(HostComponent, { props: { dismissable: false }, attachTo: document.body });
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-popover")).not.toBeNull();

    wrapper.unmount();
  });
});
