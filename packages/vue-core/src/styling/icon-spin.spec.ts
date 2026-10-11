import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { createBaseComponent } from "../base/base-component";
import { vueCoreStyleSheet } from "./vue-style-sheet";

const Probe = {
  extends: createBaseComponent({
    componentName: "icon-spin-probe",
    styleModule: { css: ".isp {}", classes: {} },
  }),
  render: () => h("span", { class: "isp" }, "x"),
};

describe("shared u-icon-spin rule (GAP-124)", () => {
  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registers the shared u-icon-spin rule on mount, once", () => {
    mount(Probe);
    mount(Probe);
    expect(vueCoreStyleSheet.has("u-icon-spin")).toBe(true);
    const styles = document.head.querySelectorAll('style[data-u-style="u-icon-spin"]');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain("@keyframes u-icon-spin");
  });
});
