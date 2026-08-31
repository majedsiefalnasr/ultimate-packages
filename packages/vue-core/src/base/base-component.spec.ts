import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseComponent } from "./base-component";

describe("createBaseComponent", () => {
  it("cx() resolves a string class-name slot unchanged", () => {
    const Base = createBaseComponent({
      componentName: "test-component",
      styleModule: { css: "", classes: { label: () => "u-test-label" } },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ cx("label") }}</div>`,
    });
    expect(wrapper.text()).toBe("u-test-label");
  });

  it("cx() resolves a function class-name slot with params", () => {
    const Base = createBaseComponent({
      componentName: "test-component-2",
      styleModule: {
        css: "",
        classes: { root: (params) => ["u-test-root", { "u-test-active": !!params?.active }] },
      },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div :class="cx('root', { active: true })" />`,
    });
    expect(wrapper.classes()).toContain("u-test-active");
  });

  it("cx() returns undefined for a slot key not present in classes", () => {
    const Base = createBaseComponent({
      componentName: "test-component-3",
      styleModule: { css: "", classes: {} },
    });
    const wrapper = mount({
      extends: Base,
      template: `<div>{{ cx("missing") === undefined ? "yes" : "no" }}</div>`,
    });
    expect(wrapper.text()).toBe("yes");
  });
});
