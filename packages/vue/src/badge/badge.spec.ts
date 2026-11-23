import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UBadge } from "./index";

describe("UBadge", () => {
  it("renders its value prop as text content when no default slot is given", () => {
    const wrapper = mount(UBadge, { props: { value: "5" } });
    expect(wrapper.text()).toBe("5");
  });

  it("renders default slot content instead of the value prop when provided", () => {
    const wrapper = mount(UBadge, {
      props: { value: "5" },
      slots: { default: "custom" },
    });
    expect(wrapper.text()).toBe("custom");
  });

  it("applies the u-badge root class", () => {
    const wrapper = mount(UBadge);
    expect(wrapper.classes()).toContain("u-badge");
  });

  it("applies u-badge-circle for a single-character value", () => {
    const wrapper = mount(UBadge, { props: { value: "5" } });
    expect(wrapper.classes()).toContain("u-badge-circle");
  });

  it("applies u-badge-dot when value is unset and no default slot is given", () => {
    const wrapper = mount(UBadge);
    expect(wrapper.classes()).toContain("u-badge-dot");
  });

  it("does not apply u-badge-dot when a default slot is given, even without a value", () => {
    const wrapper = mount(UBadge, { slots: { default: "x" } });
    expect(wrapper.classes()).not.toContain("u-badge-dot");
  });

  it("applies a severity modifier class", () => {
    const wrapper = mount(UBadge, { props: { value: "Active", severity: "success" } });
    expect(wrapper.classes()).toContain("u-badge-success");
  });

  it("applies a size modifier class", () => {
    const wrapper = mount(UBadge, { props: { value: "99+", size: "large" } });
    expect(wrapper.classes()).toContain("u-badge-lg");
  });

  it("passes native attributes and class through to the root span", () => {
    const wrapper = mount(UBadge, {
      props: { value: "5" },
      attrs: { id: "b", class: "mine", style: "color: red;" },
    });
    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.attributes("id")).toBe("b");
    expect(wrapper.classes()).toContain("mine");
    expect(wrapper.classes()).toContain("u-badge");
    expect((wrapper.element as HTMLElement).style.color).toBe("red");
  });

  it("pt.root attributes and classes reach the root", () => {
    const wrapper = mount(UBadge, {
      props: { value: "5", pt: { root: { "data-test": "x", class: "extra" } } },
    });
    expect(wrapper.attributes("data-test")).toBe("x");
    expect(wrapper.classes()).toContain("extra");
    expect(wrapper.classes()).toContain("u-badge");
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UBadge, { props: { value: "5", unstyled: true } });
    expect(wrapper.classes()).not.toContain("u-badge");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { badge: { height: "1.5rem" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UBadge, { props: { value: "5", dt: { height: "3rem" } } });
    const [attr] = wrapper.element
      .getAttributeNames()
      .filter((name: string) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-badge"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-badge-height:3rem;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-badge"]`)).toBeNull();
  });
});
