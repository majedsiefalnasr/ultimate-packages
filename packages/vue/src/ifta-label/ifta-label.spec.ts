import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UIftaLabel } from "./index";

describe("UIftaLabel", () => {
  it("projects its default slot content (input + label)", () => {
    const wrapper = mount(UIftaLabel, {
      slots: {
        default: '<input id="username" type="text" /><label for="username">Username</label>',
      },
    });
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("label").exists()).toBe(true);
  });

  it("applies the u-ifta-label root class", () => {
    const wrapper = mount(UIftaLabel);
    expect(wrapper.classes()).toContain("u-ifta-label");
  });

  it("label-position trigger is pure CSS (:has()) — root class list is stable regardless of child filled state", () => {
    const unfilled = mount(UIftaLabel, { slots: { default: '<input type="text" />' } });
    const filled = mount(UIftaLabel, {
      slots: { default: '<input type="text" class="p-filled" />' },
    });
    expect(filled.classes().sort()).toEqual(unfilled.classes().sort());
    expect(filled.find("input.p-filled").exists()).toBe(true);
  });

  it("passes native attributes and class through to the root span", () => {
    const wrapper = mount(UIftaLabel, {
      attrs: { id: "il", class: "mine", style: "color: red;" },
    });
    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.attributes("id")).toBe("il");
    expect(wrapper.classes()).toContain("mine");
    expect(wrapper.classes()).toContain("u-ifta-label");
    expect((wrapper.element as HTMLElement).style.color).toBe("red");
  });

  it("applies root pt attributes and keeps the root class", () => {
    const wrapper = mount(UIftaLabel, {
      props: { pt: { root: { id: "ifta-root", class: "extra-root" } } },
    });
    expect(wrapper.attributes("id")).toBe("ifta-root");
    expect(wrapper.classes()).toContain("u-ifta-label");
    expect(wrapper.classes()).toContain("extra-root");
    expect(wrapper.attributes("data-pc-name")).toBe("iftalabel");
    expect(wrapper.attributes("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate classes", () => {
    const wrapper = mount(UIftaLabel, {
      props: { unstyled: true, pt: { root: { class: "extra-root" } } },
    });
    expect(wrapper.classes()).not.toContain("u-ifta-label");
    expect(wrapper.classes()).toContain("extra-root");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { iftalabel: { color: "red" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const wrapper = mount(UIftaLabel, { props: { dt: { color: "blue" } } });
    const [attr] = wrapper.element
      .getAttributeNames()
      .filter((name: string) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-iftalabel"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-iftalabel-color:blue;}`);
    wrapper.unmount();
    expect(document.head.querySelector(`style[data-u-style="${attr}-iftalabel"]`)).toBeNull();
  });

  it("provides itself as $parentInstance to descendants", () => {
    const Probe = defineComponent({
      inject: { $parentInstance: { default: undefined } },
      render() {
        return h("i", { "data-probe": this.$parentInstance ? "yes" : "no" });
      },
    });
    const wrapper = mount(UIftaLabel, { slots: { default: () => h(Probe) } });
    expect(wrapper.find("i").attributes("data-probe")).toBe("yes");
  });
});
