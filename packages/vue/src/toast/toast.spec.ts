import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { toastEventBus } from "@ultimate/vue-core";
import { UToast } from "./index";

describe("UToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    toastEventBus.emit("remove-all");
  });

  it("shows a message queued via toastEventBus.emit('add', ...)", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { severity: "info", summary: "Saved", detail: "Your changes were saved." });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".u-toast-summary").text()).toBe("Saved");
    expect(wrapper.find(".u-toast-detail").text()).toBe("Your changes were saved.");
    wrapper.unmount();
  });

  it("applies the severity class", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { severity: "error", summary: "Failed" });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".u-toast-message").classes()).toContain("u-toast-message-error");
    wrapper.unmount();
  });

  it("auto-dismisses after the default life elapses", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "Bye" });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-toast-message").exists()).toBe(true);

    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-toast-message").exists()).toBe(false);
    wrapper.unmount();
  });

  it("does not auto-dismiss a sticky message", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "Persistent", sticky: true });
    await wrapper.vm.$nextTick();
    vi.advanceTimersByTime(10000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".u-toast-message").exists()).toBe(true);
    wrapper.unmount();
  });

  it("dismisses manually via the close button, removing only that message (queue-identity)", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "First", sticky: true });
    toastEventBus.emit("add", { summary: "Second", sticky: true });
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll(".u-toast-close-button");
    expect(buttons.length).toBe(2);
    await buttons[0].trigger("click");

    const summaries = wrapper.findAll(".u-toast-summary");
    expect(summaries.length).toBe(1);
    expect(summaries[0].text()).toBe("Second");
    wrapper.unmount();
  });

  it("stacks multiple queued messages in order", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "One", sticky: true });
    toastEventBus.emit("add", { summary: "Two", sticky: true });
    toastEventBus.emit("add", { summary: "Three", sticky: true });
    await wrapper.vm.$nextTick();

    const summaries = wrapper.findAll(".u-toast-summary");
    expect(summaries.map((s) => s.text())).toEqual(["One", "Two", "Three"]);
    wrapper.unmount();
  });

  it("only accepts messages matching its own group", async () => {
    const wrapper = mount(UToast, { props: { group: "secondary" } });
    toastEventBus.emit("add", { summary: "Wrong group" });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-toast-message").exists()).toBe(false);

    toastEventBus.emit("add", { summary: "Right group", group: "secondary" });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-toast-summary").text()).toBe("Right group");
    wrapper.unmount();
  });

  it("clears all messages when toastEventBus.emit('remove-all') is called", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "A", sticky: true });
    toastEventBus.emit("add", { summary: "B", sticky: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".u-toast-message").length).toBe(2);

    toastEventBus.emit("remove-all");
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".u-toast-message").length).toBe(0);
    wrapper.unmount();
  });

  it("applies the position class", () => {
    const wrapper = mount(UToast, { props: { position: "bottom-left" } });
    expect(wrapper.find(".u-toast").classes()).toContain("u-toast-bottom-left");
    wrapper.unmount();
  });

  it("does not render a close button when closable is false", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { summary: "No close", closable: false, sticky: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".u-toast-close-button").exists()).toBe(false);
    wrapper.unmount();
  });

  it("renders the upstream-aligned message structure (GAP-064 G3-A A2)", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { severity: "warn", summary: "S", detail: "D" });
    await wrapper.vm.$nextTick();

    const content = wrapper.find(".u-toast-message > .u-toast-message-content").element;
    const [text, container, ...rest] = Array.from(content.children) as HTMLElement[];
    expect(rest).toHaveLength(0);
    expect(text.className).toBe("u-toast-message-text");
    expect(Array.from(text.children, (c) => c.className)).toEqual(["u-toast-summary", "u-toast-detail"]);
    expect(container.tagName).toBe("DIV");
    expect(container.classList).toHaveLength(0);
    expect(Array.from(container.children, (c) => c.className)).toEqual(["u-toast-close-button"]);
    wrapper.unmount();
  });

  it("omits the close-button container for a non-closable message (GAP-064 G3-A A2)", async () => {
    const wrapper = mount(UToast);
    toastEventBus.emit("add", { severity: "info", summary: "S", closable: false });
    await wrapper.vm.$nextTick();

    const content = wrapper.find(".u-toast-message > .u-toast-message-content").element;
    expect(Array.from(content.children, (c) => c.className)).toEqual(["u-toast-message-text"]);
    expect(Array.from(content.children[0].children, (c) => c.className)).toEqual(["u-toast-summary"]);
    wrapper.unmount();
  });
});
