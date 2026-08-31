import { describe, it, expect, afterEach } from "vitest";
import { vueCoreStyleSheet, registerComponentStyle } from "./vue-style-sheet";

describe("VueStyleSheet adapter", () => {
  afterEach(() => {
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registerComponentStyle injects a real <style> element into document.head", () => {
    registerComponentStyle("styling-test-component", {
      css: ".u-styling-test { color: red; }",
      classes: {},
    });
    const styleEl = document.head.querySelector('style[data-u-style="styling-test-component"]');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain(".u-styling-test");
  });

  it("registering the same componentName twice does not inject a second <style> element", () => {
    registerComponentStyle("styling-test-dedup", { css: ".u-dedup {}", classes: {} });
    registerComponentStyle("styling-test-dedup", { css: ".u-dedup {}", classes: {} });
    const matches = document.head.querySelectorAll('style[data-u-style="styling-test-dedup"]');
    expect(matches.length).toBe(1);
  });

  it("vueCoreStyleSheet.createStyleElement returns undefined when document is unavailable (SSR guard)", () => {
    const originalDocument = globalThis.document;
    // @ts-expect-error simulating SSR
    delete globalThis.document;
    try {
      expect(vueCoreStyleSheet.createStyleElement({ name: "ssr-test", css: "" })).toBeUndefined();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
