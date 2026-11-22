import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UTag } from "./index";

describe("UTag", () => {
  it("renders default slot content", () => {
    const wrapper = mount(UTag, { slots: { default: "New" } });
    expect(wrapper.find(".u-tag-label").text()).toBe("New");
  });

  it("falls back to the value prop when no slot content is provided", () => {
    const wrapper = mount(UTag, { props: { value: "Hot" } });
    expect(wrapper.find(".u-tag-label").text()).toBe("Hot");
  });

  it("applies severity class", () => {
    const wrapper = mount(UTag, { props: { severity: "danger" }, slots: { default: "Alert" } });
    expect(wrapper.find(".u-tag").classes()).toContain("u-tag-danger");
  });

  it("applies rounded class", () => {
    const wrapper = mount(UTag, { props: { rounded: true }, slots: { default: "Round" } });
    expect(wrapper.find(".u-tag").classes()).toContain("u-tag-rounded");
  });

  it("renders an icon when provided", () => {
    const wrapper = mount(UTag, { props: { icon: "pi pi-check" }, slots: { default: "Done" } });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });
});

// F15 pilot: per-instance `unstyled` and `dt` come from `createBaseComponent`
// (PrimeVue 4.5.5 BaseComponent `isUnstyled`/`cx`/`_loadScopedThemeStyles`).
describe("UTag — per-instance unstyled and dt (F15 pilot)", () => {
  it("renders without any u-tag class when unstyled", () => {
    const wrapper = mount(UTag, { props: { unstyled: true, severity: "danger", rounded: true } });
    expect(wrapper.find("span").classes()).toEqual([]);
    expect(wrapper.find(".u-tag-label").exists()).toBe(false);
    expect(wrapper.text()).toBe("");
  });

  it("keeps the content when unstyled", () => {
    const wrapper = mount(UTag, { props: { unstyled: true }, slots: { default: "Plain" } });
    expect(wrapper.text()).toBe("Plain");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { tag: { borderRadius: "4px" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UTag, { props: { dt: { borderRadius: "2rem" } } });

    const [attr] = wrapper
      .find("span")
      .element.getAttributeNames()
      .filter((name) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-tag"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-tag-border-radius:2rem;}`);

    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-tag"]`)).toBeNull();
  });
});
