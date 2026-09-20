import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UPanel } from "./index";

describe("UPanel", () => {
  it("renders the header text and default slot content", () => {
    const wrapper = mount(UPanel, {
      props: { header: "Info" },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".u-panel-title").text()).toBe("Info");
    expect(wrapper.find(".body").text()).toBe("Content");
  });

  it("does not render a toggle button when toggleable is false", () => {
    const wrapper = mount(UPanel, { props: { header: "Info" } });
    expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(false);
  });

  it("toggles content visibility when the toggle button is clicked", async () => {
    const wrapper = mount(UPanel, {
      props: { header: "Info", toggleable: true },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".body").exists()).toBe(true);
    await wrapper.findComponent({ name: "UButton" }).trigger("click");
    expect(wrapper.find(".body").exists()).toBe(false);
  });

  it("starts collapsed when collapsed=true, and expands on toggle", async () => {
    const wrapper = mount(UPanel, {
      props: { header: "Info", toggleable: true, collapsed: true },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".body").exists()).toBe(false);
    await wrapper.findComponent({ name: "UButton" }).trigger("click");
    expect(wrapper.find(".body").exists()).toBe(true);
  });

  it("emits update:collapsed, before-toggle, and after-toggle when toggled", async () => {
    const wrapper = mount(UPanel, { props: { header: "Info", toggleable: true } });
    await wrapper.findComponent({ name: "UButton" }).trigger("click");
    expect(wrapper.emitted("update:collapsed")).toEqual([[true]]);
    expect(wrapper.emitted("before-toggle")).toHaveLength(1);
    expect(wrapper.emitted("after-toggle")).toHaveLength(1);
  });

  it("hides the header entirely when showHeader is false", () => {
    const wrapper = mount(UPanel, { props: { header: "Info", showHeader: false } });
    expect(wrapper.find(".u-panel-header").exists()).toBe(false);
  });

  it("renders a footer slot when provided", () => {
    const wrapper = mount(UPanel, {
      props: { header: "Info" },
      slots: { footer: '<span class="footer-text">Footer text</span>' },
    });
    expect(wrapper.find(".footer-text").text()).toBe("Footer text");
  });
});
