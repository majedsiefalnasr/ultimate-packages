// @vitest-environment node
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { createBaseComponent } from "../base/base-component";
import { vueCoreStyleSheet } from "./vue-style-sheet";

describe("Vue styling server contract (GAP-078)", () => {
  it("server render emits no <style> and registers nothing (client-only injection)", async () => {
    expect(typeof document).toBe("undefined");
    const Probe = {
      extends: createBaseComponent({
        componentName: "ssr-contract-probe",
        styleModule: {
          css: ".ssr-contract-probe{color:red}",
          classes: { root: "u-ssr-contract-probe" },
        },
      }),
      render: () => h("span", { class: "ssr-contract-probe" }, "x"),
    };
    const html = await renderToString(createSSRApp(Probe));
    expect(html).not.toContain("<style");
    expect(vueCoreStyleSheet.has("ssr-contract-probe")).toBe(false);
    // GAP-098: the per-component box-model rule is client-only too.
    expect(vueCoreStyleSheet.has("u-box-model:ssr-contract-probe")).toBe(false);
  });
});
