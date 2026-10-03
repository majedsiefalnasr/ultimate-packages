import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Theme } from "@ultimate/uix-styled";
import { reactCoreStyleSheet } from "./react-style-sheet";
import { useComponentStyle } from "./use-component-style";

describe("ReactStyleSheet", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("createStyleElement injects a real <style> element into document.head", () => {
    reactCoreStyleSheet.add("test-component", ".u-test { color: red; }");
    const styleEl = document.head.querySelector("style");
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain(".u-test");
  });
});

describe("useComponentStyle", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the style module once per component name on mount", () => {
    renderHook(() => useComponentStyle("test-button", { css: ".u-button {}", classes: {} }));
    expect(reactCoreStyleSheet.has("test-button")).toBe(true);
    const texts = [...document.head.querySelectorAll("style")].map((el) => el.textContent);
    expect(texts.some((t) => t?.includes(".u-button"))).toBe(true);
  });

  it("does not re-register (no duplicate <style> tags) on re-render", () => {
    const { rerender } = renderHook(() =>
      useComponentStyle("test-button-2", { css: ".u-button-2 {}", classes: {} })
    );
    rerender();
    rerender();
    const matching = [...document.head.querySelectorAll("style")].filter((el) =>
      el.textContent?.includes(".u-button-2")
    );
    expect(matching).toHaveLength(1);
  });

  it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
    const styleModule = {
      css: ".u-test { color: dt('test.token.value'); }",
      classes: {},
    };
    renderHook(() => useComponentStyle("dt-test-component", styleModule));
    const styleEl = [...document.head.querySelectorAll("style")].find((el) =>
      el.textContent?.includes("--u-test-token-value")
    );
    expect(styleEl?.textContent).toContain("var(--u-test-token-value");
    expect(styleEl?.textContent).not.toContain("dt(");
  });
});

/**
 * The `dt()` tests above prove token REFERENCES resolve. These prove the
 * matching custom-property DEFINITIONS are injected too — without them every
 * `var(--u-*)` reference resolves to nothing and components render unstyled
 * (the Phase 5 final-review Critical finding). React-side counterpart to
 * `packages/themes/test/dark-mode.test.ts`'s Vue-side coverage.
 */
describe("useComponentStyle theme variable definitions", () => {
  const preset = {
    primitive: { blue: { 500: "#3b82f6" } },
    semantic: { primary: { color: "{blue.500}" } },
    components: { button: { borderRadius: "6px" } },
  };

  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    Theme.setTheme({
      preset,
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  function injectedCss(): string {
    return Array.from(document.head.querySelectorAll("style"))
      .map((el) => el.textContent ?? "")
      .join("\n");
  }

  it("injects common (primitive + semantic) and per-component variable DEFINITIONS on mount", () => {
    renderHook(() => useComponentStyle("button", { css: ".u-button {}", classes: {} }));

    const css = injectedCss();
    expect(css).toContain("--u-blue-500:"); // primitive tier
    expect(css).toContain("--u-primary-color:"); // semantic tier
    expect(css).toContain("--u-button-border-radius:"); // per-component tier
  });

  it("injects no duplicate <style> elements across repeated and multi-component mounts", () => {
    renderHook(() => useComponentStyle("button", { css: ".u-button {}", classes: {} }));
    const afterFirst = document.head.querySelectorAll("style").length;

    renderHook(() => useComponentStyle("button", { css: ".u-button {}", classes: {} }));
    expect(document.head.querySelectorAll("style").length).toBe(afterFirst);

    // A different component does NOT re-inject the shared common tier. It
    // adds only its structural CSS here (+1, not +2): this test preset
    // defines no `dialog` component, so its variable block is empty and
    // StyleSheet.add()'s isNotEmpty() guard skips it.
    renderHook(() => useComponentStyle("dialog", { css: ".u-dialog {}", classes: {} }));
    expect(document.head.querySelectorAll("style").length).toBe(afterFirst + 1);
  });
});
