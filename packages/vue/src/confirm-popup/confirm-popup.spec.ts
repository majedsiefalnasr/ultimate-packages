import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { confirmationEventBus } from "@ultimate/vue-core";
import { UConfirmPopup } from "./index";

describe("UConfirmPopup", () => {
  afterEach(() => {
    confirmationEventBus.clear();
    document.querySelectorAll(".u-confirmpopup").forEach((el) => el.remove());
  });

  it("renders nothing until a matching confirmation is requested", () => {
    mount(UConfirmPopup);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("shows the popup positioned against the target", async () => {
    const wrapper = mount(
      { template: `<div><button ref="btn">Delete</button></div>` },
      { attachTo: document.body }
    );
    const button = wrapper.find("button").element;
    const popup = mount(UConfirmPopup, { attachTo: document.body });

    confirmationEventBus.emit("confirm", { message: "Delete?", target: button });
    await popup.vm.$nextTick();

    expect(document.querySelector(".u-confirmpopup")).not.toBeNull();
    expect(document.querySelector(".u-confirmpopup-message")?.textContent).toBe("Delete?");

    popup.unmount();
    wrapper.unmount();
  });

  it("invokes accept() and hides when the accept button is clicked", async () => {
    const wrapper = mount({ template: `<button>Delete</button>` }, { attachTo: document.body });
    const button = wrapper.element;
    const popup = mount(UConfirmPopup, { attachTo: document.body });
    let accepted = false;

    confirmationEventBus.emit("confirm", { message: "Delete?", target: button, accept: () => (accepted = true) });
    await popup.vm.$nextTick();

    const buttons = document.querySelectorAll(".u-confirmpopup-footer button");
    (buttons[buttons.length - 1] as HTMLButtonElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await popup.vm.$nextTick();

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    popup.unmount();
    wrapper.unmount();
  });

  it("invokes reject() and hides when the reject button is clicked", async () => {
    const wrapper = mount({ template: `<button>Delete</button>` }, { attachTo: document.body });
    const button = wrapper.element;
    const popup = mount(UConfirmPopup, { attachTo: document.body });
    let rejected = false;

    confirmationEventBus.emit("confirm", { message: "Delete?", target: button, reject: () => (rejected = true) });
    await popup.vm.$nextTick();

    const rejectButton = document.querySelector(".u-confirmpopup-footer button") as HTMLButtonElement;
    rejectButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await popup.vm.$nextTick();

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    popup.unmount();
    wrapper.unmount();
  });

  it("hides when clicking outside the popup and target", async () => {
    const wrapper = mount(
      { template: `<div><button class="trigger">Delete</button><div class="outside">Outside</div></div>` },
      { attachTo: document.body }
    );
    const button = wrapper.find(".trigger").element;
    const popup = mount(UConfirmPopup, { attachTo: document.body });

    confirmationEventBus.emit("confirm", { message: "Delete?", target: button });
    await popup.vm.$nextTick();
    expect(document.querySelector(".u-confirmpopup")).not.toBeNull();

    wrapper.find(".outside").element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await popup.vm.$nextTick();
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    popup.unmount();
    wrapper.unmount();
  });

  it("rejects and hides on Escape", async () => {
    const wrapper = mount({ template: `<button>Delete</button>` }, { attachTo: document.body });
    const button = wrapper.element;
    const popup = mount(UConfirmPopup, { attachTo: document.body });
    let rejected = false;

    confirmationEventBus.emit("confirm", { message: "Delete?", target: button, reject: () => (rejected = true) });
    await popup.vm.$nextTick();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    await popup.vm.$nextTick();

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    popup.unmount();
    wrapper.unmount();
  });

  it("only responds to confirmations matching its own group key", async () => {
    const wrapper = mount({ template: `<button>Delete</button>` }, { attachTo: document.body });
    const button = wrapper.element;
    const popup = mount(UConfirmPopup, { props: { group: "secondary" }, attachTo: document.body });

    confirmationEventBus.emit("confirm", { message: "Wrong group", target: button, key: "other" });
    await popup.vm.$nextTick();
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    popup.unmount();
    wrapper.unmount();
  });
});
