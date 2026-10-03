import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { createBaseComponent } from "../base/base-component";
import { vueCoreStyleSheet } from "./vue-style-sheet";

const Probe = {
  extends: createBaseComponent({
    componentName: "hidden-accessible-probe",
    styleModule: { css: ".hap {}", classes: {} },
  }),
  render: () => h("span", { class: "hap" }, "x"),
};

describe("shared u-hidden-accessible rule (GAP-074)", () => {
  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registers the shared u-hidden-accessible rule on mount, once, without a theme", () => {
    mount(Probe);
    mount(Probe);
    expect(vueCoreStyleSheet.has("u-hidden-accessible")).toBe(true);
    expect(
      document.head.querySelectorAll('style[data-u-style="u-hidden-accessible"]')
    ).toHaveLength(1);
  });
});
