import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UInlineMessage } from "./index";

describe("UInlineMessage", () => {
  it("renders default slot content with default error severity", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Something went wrong" } });
    expect(wrapper.find(".u-inline-message").text()).toContain("Something went wrong");
    expect(wrapper.find(".u-inline-message").classes()).toContain("u-inline-message-error");
  });

  it("applies the severity class", () => {
    const wrapper = mount(UInlineMessage, { props: { severity: "success" }, slots: { default: "Saved" } });
    expect(wrapper.find(".u-inline-message").classes()).toContain("u-inline-message-success");
  });

  it("renders a default severity icon when no icon is provided", () => {
    const wrapper = mount(UInlineMessage, { props: { severity: "warn" }, slots: { default: "Careful" } });
    expect(wrapper.find(".pi-exclamation-triangle").exists()).toBe(true);
  });

  it("renders a custom icon override when provided", () => {
    const wrapper = mount(UInlineMessage, { props: { icon: "pi pi-star" }, slots: { default: "Custom" } });
    expect(wrapper.find(".pi-star").exists()).toBe(true);
  });

  it("has no close button — InlineMessage has no dismiss mechanism", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Hi" } });
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("remains rendered indefinitely — real source's sticky/life mechanism is dead code and is not ported", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UInlineMessage, { slots: { default: "Still here" } });
    expect(wrapper.find(".u-inline-message").exists()).toBe(true);
    vi.advanceTimersByTime(10000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-inline-message").exists()).toBe(true);
    vi.useRealTimers();
  });

  it("has role=alert for accessibility", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Alert text" } });
    expect(wrapper.find(".u-inline-message").attributes("role")).toBe("alert");
  });
});
