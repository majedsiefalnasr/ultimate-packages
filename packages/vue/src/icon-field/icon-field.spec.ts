import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UIconField, UInputIcon } from "./index";

describe("UIconField", () => {
  it("projects its default slot content (icon + input)", () => {
    const wrapper = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<UInputIcon>search</UInputIcon><input type="text" />' },
    });
    expect(wrapper.findComponent(UInputIcon).exists()).toBe(true);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("applies the u-icon-field root class", () => {
    const wrapper = mount(UIconField);
    expect(wrapper.classes()).toContain("u-icon-field");
  });

  it("positions the icon leading/trailing via DOM order — root has no per-position class", () => {
    const leading = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<UInputIcon>search</UInputIcon><input type="text" />' },
    });
    const trailing = mount(UIconField, {
      global: { components: { UInputIcon } },
      slots: { default: '<input type="text" /><UInputIcon>search</UInputIcon>' },
    });
    expect(trailing.classes().sort()).toEqual(leading.classes().sort());
    expect(leading.element.firstElementChild?.classList.contains("u-input-icon")).toBe(true);
    expect(trailing.element.lastElementChild?.classList.contains("u-input-icon")).toBe(true);
  });

  it("passes native attributes and class through to the root div", () => {
    const wrapper = mount(UIconField, {
      attrs: { id: "field", class: "mine", style: "color: red;" },
    });
    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.attributes("id")).toBe("field");
    expect(wrapper.classes()).toContain("mine");
    expect(wrapper.classes()).toContain("u-icon-field");
    expect((wrapper.element as HTMLElement).style.color).toBe("red");
  });

  it("applies root pt attributes and keeps the root class", () => {
    const wrapper = mount(UIconField, {
      props: { pt: { root: { id: "icon-field-root", class: "extra-root" } } },
    });
    expect(wrapper.attributes("id")).toBe("icon-field-root");
    expect(wrapper.classes()).toContain("u-icon-field");
    expect(wrapper.classes()).toContain("extra-root");
    expect(wrapper.attributes("data-pc-name")).toBe("iconfield");
    expect(wrapper.attributes("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UIconField, {
      props: { unstyled: true, pt: { root: { class: "extra-root" } } },
    });
    expect(wrapper.classes()).not.toContain("u-icon-field");
    expect(wrapper.classes()).toContain("extra-root");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { iconfield: { icon: { color: "red" } } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UIconField, { props: { dt: { icon: { color: "blue" } } } });
    const [attr] = wrapper.element
      .getAttributeNames()
      .filter((name: string) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-iconfield"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-iconfield-icon-color:blue;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-iconfield"]`)).toBeNull();
  });

  it("provides itself as $parentInstance to descendants", () => {
    const Probe = defineComponent({
      inject: { $parentInstance: { default: undefined } },
      render() {
        return h("i", { "data-probe": this.$parentInstance ? "yes" : "no" });
      },
    });
    const wrapper = mount(UIconField, { slots: { default: () => h(Probe) } });
    expect(wrapper.find("i").attributes("data-probe")).toBe("yes");
  });
});

describe("UInputIcon", () => {
  it("renders its default slot and applies the u-input-icon root class", () => {
    const wrapper = mount(UInputIcon, { slots: { default: "search" } });
    expect(wrapper.classes()).toContain("u-input-icon");
    expect(wrapper.text()).toBe("search");
  });

  it("is aria-hidden by default", () => {
    const wrapper = mount(UInputIcon);
    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });

  it("lets an aria-hidden attribute replace the default", () => {
    const wrapper = mount(UInputIcon, { attrs: { "aria-hidden": "false" } });
    expect(wrapper.attributes("aria-hidden")).toBe("false");
  });

  it("passes native attributes and class through to the root span", () => {
    const wrapper = mount(UInputIcon, { attrs: { id: "icon", class: "mine" } });
    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.attributes("id")).toBe("icon");
    expect(wrapper.classes()).toContain("mine");
    expect(wrapper.classes()).toContain("u-input-icon");
  });

  it("applies root pt attributes, keeps the root class and lets pt replace aria-hidden", () => {
    const wrapper = mount(UInputIcon, {
      props: {
        pt: { root: { id: "icon-root", class: "extra-icon", "aria-hidden": "false" } },
      },
    });
    expect(wrapper.attributes("id")).toBe("icon-root");
    expect(wrapper.classes()).toContain("u-input-icon");
    expect(wrapper.classes()).toContain("extra-icon");
    expect(wrapper.attributes("aria-hidden")).toBe("false");
    expect(wrapper.attributes("data-pc-name")).toBe("inputicon");
    expect(wrapper.attributes("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate class", () => {
    const wrapper = mount(UInputIcon, {
      props: { unstyled: true, pt: { root: { class: "extra-icon" } } },
    });
    expect(wrapper.classes()).not.toContain("u-input-icon");
    expect(wrapper.classes()).toContain("extra-icon");
  });
});
