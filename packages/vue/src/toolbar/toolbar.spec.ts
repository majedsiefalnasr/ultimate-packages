import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UToolbar } from "./index";

describe("UToolbar", () => {
  it("has role=toolbar", () => {
    const wrapper = mount(UToolbar);
    expect(wrapper.attributes("role")).toBe("toolbar");
  });

  it("renders default slot content", () => {
    const wrapper = mount(UToolbar, { slots: { default: "Plain content" } });
    expect(wrapper.text()).toContain("Plain content");
  });

  it("renders start/center/end slots", () => {
    const wrapper = mount(UToolbar, {
      slots: { start: "Start", center: "Center", end: "End" },
    });
    expect(wrapper.find(".u-toolbar-start").text()).toBe("Start");
    expect(wrapper.find(".u-toolbar-center").text()).toBe("Center");
    expect(wrapper.find(".u-toolbar-end").text()).toBe("End");
  });

  it("does not render an end wrapper when the end slot is not provided", () => {
    const wrapper = mount(UToolbar, { slots: { start: "Start" } });
    expect(wrapper.find(".u-toolbar-end").exists()).toBe(false);
  });

  it("sets aria-labelledby when provided", () => {
    const wrapper = mount(UToolbar, { props: { ariaLabelledby: "actions-heading" } });
    expect(wrapper.attributes("aria-labelledby")).toBe("actions-heading");
  });

  it("falls through id, class and other attributes to the root", () => {
    const wrapper = mount(UToolbar, {
      attrs: { id: "main-toolbar", class: "custom", "data-test": "x" },
    });
    expect(wrapper.attributes("id")).toBe("main-toolbar");
    expect(wrapper.attributes("data-test")).toBe("x");
    expect(wrapper.classes()).toContain("custom");
    expect(wrapper.classes()).toContain("u-toolbar");
  });

  it("pt reaches the root and each region", () => {
    const wrapper = mount(UToolbar, {
      props: {
        pt: {
          root: { "data-test": "root", class: "extra" },
          start: { "data-test": "start" },
          center: { "data-test": "center" },
          end: { "data-test": "end" },
        },
      },
      slots: { start: "S", center: "C", end: "E" },
    });
    expect(wrapper.attributes("data-test")).toBe("root");
    expect(wrapper.classes()).toContain("extra");
    for (const region of ["start", "center", "end"]) {
      expect(wrapper.find(`.u-toolbar-${region}`).attributes("data-test")).toBe(region);
    }
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UToolbar, { props: { unstyled: true }, slots: { start: "S" } });
    expect(wrapper.classes()).not.toContain("u-toolbar");
    expect(wrapper.find(".u-toolbar-start").exists()).toBe(false);
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { toolbar: { gap: "0.5rem" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UToolbar, { props: { dt: { gap: "2rem" } } });
    const [attr] = wrapper.element
      .getAttributeNames()
      .filter((name: string) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-toolbar"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-toolbar-gap:2rem;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-toolbar"]`)).toBeNull();
  });
});
