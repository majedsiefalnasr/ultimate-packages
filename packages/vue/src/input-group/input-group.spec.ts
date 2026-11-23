import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UInputGroup, UInputGroupAddon } from "./index";

describe("UInputGroup", () => {
  it("projects addons and an input via its default slot", () => {
    const wrapper = mount(UInputGroup, {
      global: { components: { UInputGroupAddon } },
      slots: {
        default:
          '<UInputGroupAddon>$</UInputGroupAddon><input type="text" /><UInputGroupAddon>.00</UInputGroupAddon>',
      },
    });
    expect(wrapper.findAllComponents(UInputGroupAddon)).toHaveLength(2);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("applies the u-input-group root class", () => {
    const wrapper = mount(UInputGroup);
    expect(wrapper.classes()).toContain("u-input-group");
  });
});

describe("UInputGroupAddon", () => {
  it("renders slot content and applies the u-input-group-addon root class", () => {
    const wrapper = mount(UInputGroupAddon, { slots: { default: "$" } });
    expect(wrapper.classes()).toContain("u-input-group-addon");
    expect(wrapper.text()).toBe("$");
  });
});

describe("UInputGroup pass-through, attributes, unstyled and dt", () => {
  it("applies root pt attributes and keeps the root class", () => {
    const wrapper = mount(UInputGroup, {
      props: { pt: { root: { id: "group-root", class: "extra-root" } } },
    });
    expect(wrapper.attributes("id")).toBe("group-root");
    expect(wrapper.classes()).toContain("u-input-group");
    expect(wrapper.classes()).toContain("extra-root");
    expect(wrapper.attributes("data-pc-name")).toBe("inputgroup");
    expect(wrapper.attributes("data-pc-section")).toBe("root");
  });

  it("passes native attributes and class through to the root div", () => {
    const wrapper = mount(UInputGroup, { attrs: { id: "ig", class: "mine" } });
    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.attributes("id")).toBe("ig");
    expect(wrapper.classes()).toContain("mine");
    expect(wrapper.classes()).toContain("u-input-group");
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UInputGroup, {
      props: { unstyled: true, pt: { root: { class: "extra-root" } } },
    });
    expect(wrapper.classes()).not.toContain("u-input-group");
    expect(wrapper.classes()).toContain("extra-root");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { inputgroup: { color: "red" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UInputGroup, { props: { dt: { color: "blue" } } });
    const [attr] = wrapper.element
      .getAttributeNames()
      .filter((name: string) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-inputgroup"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-inputgroup-color:blue;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-inputgroup"]`)).toBeNull();
  });
});
