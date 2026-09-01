import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
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
    expect(document.head.querySelector("style")?.textContent).toContain(".u-button");
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
    const styleEl = document.head.querySelector("style");
    expect(styleEl?.textContent).toContain("var(--u-test-token-value");
    expect(styleEl?.textContent).not.toContain("dt(");
  });
});
