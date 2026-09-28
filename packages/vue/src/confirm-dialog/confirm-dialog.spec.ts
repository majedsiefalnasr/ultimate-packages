import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { confirmationEventBus } from "@ultimate/vue-core";
import { UConfirmDialog } from "./index";

describe("UConfirmDialog", () => {
  afterEach(() => {
    confirmationEventBus.clear();
    document.querySelectorAll(".u-dialog").forEach((el) => el.remove());
  });

  it("renders nothing until a matching confirmation is requested", () => {
    mount(UConfirmDialog);
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("shows the dialog with message/header when confirmationEventBus emits confirm with no key", async () => {
    const wrapper = mount(UConfirmDialog, { attachTo: document.body });
    confirmationEventBus.emit("confirm", { message: "Delete this item?", header: "Confirm" });
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".u-dialog")).not.toBeNull();
    expect(document.querySelector(".u-confirmdialog-message")?.textContent).toBe("Delete this item?");
    expect(document.querySelector(".u-dialog-title")?.textContent).toBe("Confirm");

    wrapper.unmount();
  });

  it("invokes accept() and hides when the accept button is clicked", async () => {
    const wrapper = mount(UConfirmDialog, { attachTo: document.body });
    let accepted = false;
    confirmationEventBus.emit("confirm", { message: "Proceed?", accept: () => (accepted = true) });
    await wrapper.vm.$nextTick();

    const buttons = document.querySelectorAll(".u-confirmdialog-footer button");
    (buttons[buttons.length - 1] as HTMLButtonElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();

    wrapper.unmount();
  });

  it("invokes reject() and hides when the reject button is clicked", async () => {
    const wrapper = mount(UConfirmDialog, { attachTo: document.body });
    let rejected = false;
    confirmationEventBus.emit("confirm", { message: "Proceed?", reject: () => (rejected = true) });
    await wrapper.vm.$nextTick();

    const rejectButton = document.querySelector(".u-confirmdialog-footer button") as HTMLButtonElement;
    rejectButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();

    wrapper.unmount();
  });

  it("renders role=alertdialog on the composed UDialog's root element (Spec §5.2, GAP-049)", async () => {
    const wrapper = mount(UConfirmDialog, { attachTo: document.body });
    confirmationEventBus.emit("confirm", { message: "Proceed?" });
    await wrapper.vm.$nextTick();

    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });

  it("only responds to confirmations matching its own group key", async () => {
    const wrapper = mount(UConfirmDialog, { props: { group: "secondary" }, attachTo: document.body });

    confirmationEventBus.emit("confirm", { message: "For a different dialog", key: "other" });
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-dialog")).toBeNull();

    confirmationEventBus.emit("confirm", { message: "For this dialog", key: "secondary" });
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    wrapper.unmount();
  });

  it("hides when confirmationEventBus emits close", async () => {
    const wrapper = mount(UConfirmDialog, { attachTo: document.body });
    confirmationEventBus.emit("confirm", { message: "Proceed?" });
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    confirmationEventBus.emit("close");
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-dialog")).toBeNull();

    wrapper.unmount();
  });
});
