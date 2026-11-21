import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { Theme } from "@ultimate/uix-styled";
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

  it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
    const styleModule = {
      css: ".u-test { color: dt('test.token.value'); }",
      classes: {},
    };
    registerComponentStyle("dt-test-component", styleModule);
    const styleEl = document.head.querySelector('style[data-u-style="dt-test-component"]');
    expect(styleEl?.textContent).toContain("var(--u-test-token-value");
    expect(styleEl?.textContent).not.toContain("dt(");
  });
});

describe("registerComponentStyle — box model (GAP-098)", () => {
  const keys = () =>
    Array.from(document.head.querySelectorAll("style[data-u-style]")).map((el) =>
      el.getAttribute("data-u-style")
    );

  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registers the component's scoped box-model rule immediately before its CSS", () => {
    registerComponentStyle("bm-drawer", {
      css: ".u-bm-drawer {}",
      classes: { root: "u-bm-drawer u-component", mask: "u-bm-drawer-mask" },
    });
    const all = keys();
    expect(all.indexOf("u-box-model:bm-drawer")).toBe(all.indexOf("bm-drawer") - 1);
    const rule = document.head.querySelector('style[data-u-style="u-box-model:bm-drawer"]');
    expect(rule?.textContent).toContain(
      ":where(.u-bm-drawer, .u-bm-drawer *, .u-bm-drawer-mask, .u-bm-drawer-mask *)"
    );
    expect(rule?.textContent).toContain("box-sizing: border-box;");
  });

  it("registers the box-model rule even when the component key already exists", () => {
    vueCoreStyleSheet.add("bm-existing", ".u-bm-existing {}");
    registerComponentStyle("bm-existing", {
      css: ".u-bm-existing {}",
      classes: { root: "u-bm-existing" },
    });
    expect(keys()).toContain("u-box-model:bm-existing");
  });

  it("registers nothing for an empty component name or a style module without scope roots (Amendment A1)", () => {
    registerComponentStyle("", { css: "", classes: {} });
    registerComponentStyle("bm-rootless", { css: ".x {}", classes: { header: "u-x" } });
    expect(keys().filter((k) => k?.startsWith("u-box-model:"))).toEqual([]);
  });
});

describe("registerComponentStyle — theme changes (A1)", () => {
  const options = { prefix: "u", darkModeSelector: "system", cssLayer: false };
  const presetOf = (color: string, radius: string) => ({
    primitive: { blue: { 500: color } },
    semantic: { primary: { color: "{blue.500}" } },
    components: { button: { borderRadius: radius } },
  });
  const styleModule = { css: ".u-button {}", classes: {} };

  beforeEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
    Theme.setTheme({ preset: presetOf("#3b82f6", "6px"), options });
  });

  const injectedCss = () =>
    Array.from(document.head.querySelectorAll("style[data-u-style]"))
      .map((el) => el.textContent ?? "")
      .join("\n");

  it("updates the variables of a registered component after Theme.setTheme, without a second <style>", () => {
    registerComponentStyle("button", styleModule);
    const count = document.head.querySelectorAll("style[data-u-style]").length;

    Theme.setTheme({ preset: presetOf("#ef4444", "12px"), options });

    expect(injectedCss()).toContain("--u-blue-500:#ef4444");
    expect(injectedCss()).toContain("--u-button-border-radius:12px");
    expect(injectedCss()).not.toContain("#3b82f6");
    expect(document.head.querySelectorAll("style[data-u-style]").length).toBe(count);
  });

  it("updates the variables of a registered component after Theme.setPreset", () => {
    registerComponentStyle("button", styleModule);

    Theme.setPreset(presetOf("#22c55e", "2px"));

    expect(injectedCss()).toContain("--u-blue-500:#22c55e");
    expect(injectedCss()).toContain("--u-button-border-radius:2px");
    expect(injectedCss()).not.toContain("#3b82f6");
  });

  it("updates the variable names of a registered component after Theme.setOptions", () => {
    registerComponentStyle("button", {
      css: ".u-button { border-radius: dt('button.border.radius'); }",
      classes: {},
    });

    Theme.setOptions({ ...options, prefix: "x" });

    expect(injectedCss()).toContain("--x-button-border-radius:6px");
    expect(injectedCss()).not.toContain("--u-button-border-radius");
    expect(injectedCss()).toContain("var(--x-button-border-radius");
  });

  it("updates the variables registered through additionalPresetKeys", () => {
    Theme.setTheme({
      preset: { components: { tooltip: { gap: "3px" } } },
      options,
    });
    registerComponentStyle("button", styleModule, ["tooltip"]);
    expect(injectedCss()).toContain("--u-tooltip-gap:3px");

    Theme.setPreset({ components: { tooltip: { gap: "9px" } } });

    expect(injectedCss()).toContain("--u-tooltip-gap:9px");
    expect(injectedCss()).not.toContain("--u-tooltip-gap:3px");
  });
});
