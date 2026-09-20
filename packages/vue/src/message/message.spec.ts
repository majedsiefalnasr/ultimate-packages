import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UMessage } from "./index";

describe("UMessage", () => {
  it("renders default slot content with default info severity", () => {
    const wrapper = mount(UMessage, { slots: { default: "Hello" } });
    expect(wrapper.find(".u-message").text()).toContain("Hello");
    expect(wrapper.find(".u-message").classes()).toContain("u-message-info");
  });

  it("applies the severity class", () => {
    const wrapper = mount(UMessage, { props: { severity: "error" }, slots: { default: "Oops" } });
    expect(wrapper.find(".u-message").classes()).toContain("u-message-error");
  });

  it("does not render a close button when closable is false", () => {
    const wrapper = mount(UMessage, { slots: { default: "Hi" } });
    expect(wrapper.find(".u-message-close-button").exists()).toBe(false);
  });

  it("closes and emits close when the close button is clicked", async () => {
    const wrapper = mount(UMessage, { props: { closable: true }, slots: { default: "Hi" } });
    const button = wrapper.find(".u-message-close-button");
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(wrapper.find(".u-message").exists()).toBe(false);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("auto-closes after the life delay elapses", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UMessage, { props: { life: 1000 }, slots: { default: "Bye" } });
    expect(wrapper.find(".u-message").exists()).toBe(true);
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-message").exists()).toBe(false);
    vi.useRealTimers();
  });

  it("renders a default severity icon when no icon is provided", () => {
    const wrapper = mount(UMessage, { props: { severity: "success" }, slots: { default: "Done" } });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });
});
