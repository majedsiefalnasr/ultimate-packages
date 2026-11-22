import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { createBaseComponent } from "./base-component";
import { vueCoreStyleSheet } from "../styling/vue-style-sheet";

/**
 * F15: per-instance `unstyled` and `dt`. Oracle: PrimeVue 4.5.5
 * `BaseComponent.vue` (`isUnstyled`, `cx`, `_loadScopedThemeStyles`).
 */
const styleModule = {
  css: ".u-dtdemo { color: dt('dtdemo.color'); }",
  classes: { root: () => "u-dtdemo" },
};

function demo(name = "dtdemo") {
  return defineComponent({
    extends: createBaseComponent({ componentName: name, styleModule }),
    template: `<div :class="cx('root')"><slot /></div>`,
  });
}

function scopedAttrs(element: Element): string[] {
  return element.getAttributeNames().filter((name) => name.startsWith("pc"));
}

function styleKeys(): string[] {
  return Array.from(document.head.querySelectorAll("style[data-u-style]")).map(
    (el) => el.getAttribute("data-u-style") ?? ""
  );
}

beforeAll(() => {
  Theme.setTheme({
    preset: { components: { dtdemo: { color: "#111111" } } },
    options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
  });
});

afterEach(() => {
  vueCoreStyleSheet.clear();
  document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
});

describe("createBaseComponent — unstyled", () => {
  it("leaves unstyled undefined when the prop is not passed", () => {
    const wrapper = mount(demo());
    expect(wrapper.vm.unstyled).toBeUndefined();
  });

  it("resolves classes when styled", () => {
    const wrapper = mount(demo());
    expect(wrapper.classes()).toContain("u-dtdemo");
  });

  it("makes cx() return undefined when unstyled", () => {
    const wrapper = mount(demo(), { props: { unstyled: true } });
    expect(wrapper.classes()).not.toContain("u-dtdemo");
    expect(wrapper.classes()).toEqual([]);
  });

  it("lets unstyled=false keep the classes", () => {
    const wrapper = mount(demo(), { props: { unstyled: false } });
    expect(wrapper.classes()).toContain("u-dtdemo");
  });

  it("registers no component css and no theme variables when unstyled", () => {
    mount(demo(), { props: { unstyled: true } });
    expect(styleKeys()).not.toContain("dtdemo");
    expect(styleKeys()).not.toContain("dtdemo-variables");
    expect(styleKeys()).not.toContain("u-common-variables");
    expect(styleKeys()).not.toContain("u-base");
  });

  it("still registers the shared base rules when unstyled", () => {
    mount(demo(), { props: { unstyled: true } });
    expect(styleKeys()).toContain("u-hidden-accessible");
  });

  it("registers the styles when a styled instance mounts", () => {
    mount(demo());
    expect(styleKeys()).toContain("dtdemo");
    expect(styleKeys()).toContain("dtdemo-variables");
    expect(styleKeys()).toContain("u-base");
  });

  it("registers the styles and restores the classes when unstyled turns off", async () => {
    const wrapper = mount(demo(), { props: { unstyled: true } });
    expect(styleKeys()).not.toContain("dtdemo");

    await wrapper.setProps({ unstyled: false });

    expect(styleKeys()).toContain("dtdemo");
    expect(wrapper.classes()).toContain("u-dtdemo");
  });

  it("drops the classes when unstyled turns on", async () => {
    const wrapper = mount(demo());
    await wrapper.setProps({ unstyled: true });
    expect(wrapper.classes()).not.toContain("u-dtdemo");
  });
});

describe("createBaseComponent — dt", () => {
  it("leaves dt undefined and adds no scoped attribute or style by default", () => {
    const wrapper = mount(demo());
    expect(wrapper.vm.dt).toBeUndefined();
    expect(scopedAttrs(wrapper.element)).toEqual([]);
    expect(styleKeys().filter((key) => key.startsWith("pc"))).toEqual([]);
  });

  it("scopes the dt variables to the instance through an attribute selector", () => {
    const wrapper = mount(demo(), { props: { dt: { color: "#ff0000" } } });

    const [attr] = scopedAttrs(wrapper.element);
    expect(attr).toMatch(/^pc[A-Za-z0-9_]+$/);
    const scoped = document.head.querySelector(`style[data-u-style="${attr}-dtdemo"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-dtdemo-color:#ff0000;}`);
  });

  it("keeps two instances apart", () => {
    const first = mount(demo(), { props: { dt: { color: "#ff0000" } } });
    const second = mount(demo(), { props: { dt: { color: "#00ff00" } } });

    expect(scopedAttrs(first.element)[0]).not.toBe(scopedAttrs(second.element)[0]);
    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(2);
  });

  it("rewrites the scoped style in place when dt changes", async () => {
    const wrapper = mount(demo(), { props: { dt: { color: "#ff0000" } } });
    const [attr] = scopedAttrs(wrapper.element);

    await wrapper.setProps({ dt: { color: "#0000ff" } });

    const scoped = document.head.querySelectorAll(`style[data-u-style="${attr}-dtdemo"]`);
    expect(scoped).toHaveLength(1);
    expect(scoped[0].textContent).toContain("--u-dtdemo-color:#0000ff");
  });

  it("removes the scoped style and attribute when dt is cleared", async () => {
    const wrapper = mount(demo(), { props: { dt: { color: "#ff0000" } } });
    const [attr] = scopedAttrs(wrapper.element);

    await wrapper.setProps({ dt: undefined });

    expect(document.head.querySelector(`style[data-u-style="${attr}-dtdemo"]`)).toBeNull();
    expect(wrapper.element.hasAttribute(attr)).toBe(false);
  });

  it("starts scoping when dt is set after mount", async () => {
    const wrapper = mount(demo());

    await wrapper.setProps({ dt: { color: "#ff0000" } });

    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(1);
  });

  it("removes the scoped style when the instance unmounts", () => {
    const wrapper = mount(demo(), { props: { dt: { color: "#ff0000" } } });
    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(1);

    wrapper.unmount();

    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(0);
  });

  it("follows a theme change", async () => {
    mount(demo(), { props: { dt: { color: "#ff0000" } } });

    Theme.setTheme({
      preset: { components: { dtdemo: { color: "#222222" } } },
      options: { prefix: "k", darkModeSelector: "system", cssLayer: false },
    });
    await nextTick();

    const scoped = Array.from(document.head.querySelectorAll("style[data-u-style$='-dtdemo']"));
    expect(scoped[0].textContent).toContain("--k-dtdemo-color:#ff0000");
  });

  it("applies dt on an unstyled instance too", () => {
    const wrapper = mount(demo(), { props: { unstyled: true, dt: { color: "#ff0000" } } });
    const [attr] = scopedAttrs(wrapper.element);
    expect(styleKeys()).toContain(`${attr}-dtdemo`);
  });
});
