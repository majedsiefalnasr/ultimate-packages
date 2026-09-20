import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UFieldset } from "./index";

describe("UFieldset", () => {
  it("renders the legend text and default slot content", () => {
    const wrapper = mount(UFieldset, {
      props: { legend: "Info" },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".u-fieldset-legend-label").text()).toBe("Info");
    expect(wrapper.find(".body").text()).toBe("Content");
  });

  it("does not render a toggle button when toggleable is false", () => {
    const wrapper = mount(UFieldset, { props: { legend: "Info" } });
    expect(wrapper.find(".u-fieldset-toggle-button").exists()).toBe(false);
  });

  it("renders content by default when toggleable, and hides it once toggled", async () => {
    const wrapper = mount(UFieldset, {
      props: { legend: "Info", toggleable: true },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".body").exists()).toBe(true);
    await wrapper.find(".u-fieldset-toggle-button").trigger("click");
    expect(wrapper.find(".body").exists()).toBe(false);
  });

  it("starts collapsed when collapsed=true, and expands on toggle", async () => {
    const wrapper = mount(UFieldset, {
      props: { legend: "Info", toggleable: true, collapsed: true },
      slots: { default: '<p class="body">Content</p>' },
    });
    expect(wrapper.find(".body").exists()).toBe(false);
    await wrapper.find(".u-fieldset-toggle-button").trigger("click");
    expect(wrapper.find(".body").exists()).toBe(true);
  });

  it("emits update:collapsed and toggle when toggled", async () => {
    const wrapper = mount(UFieldset, { props: { legend: "Info", toggleable: true } });
    await wrapper.find(".u-fieldset-toggle-button").trigger("click");
    expect(wrapper.emitted("update:collapsed")).toEqual([[true]]);
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("toggles on Enter and Space keydown on the toggle button", async () => {
    const wrapper = mount(UFieldset, {
      props: { legend: "Info", toggleable: true },
      slots: { default: '<p class="body">Content</p>' },
    });
    await wrapper.find(".u-fieldset-toggle-button").trigger("keydown", { code: "Enter" });
    expect(wrapper.find(".body").exists()).toBe(false);
  });

  it("sets aria-expanded and aria-controls on the toggle button", () => {
    const wrapper = mount(UFieldset, { props: { legend: "Info", toggleable: true } });
    const button = wrapper.find(".u-fieldset-toggle-button");
    expect(button.attributes("aria-expanded")).toBe("true");
    expect(button.attributes("aria-controls")).toBeTruthy();
  });
});
