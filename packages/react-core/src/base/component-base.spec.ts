import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useComponentBase } from "./component-base";
import { reactCoreStyleSheet } from "../styling/react-style-sheet";

describe("useComponentBase", () => {
  it("cx() resolves a string class-name slot unchanged", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component",
        styleModule: { css: "", classes: { label: () => "u-test-label" } },
      })
    );
    expect(result.current.cx("label")).toBe("u-test-label");
  });

  it("cx() resolves a function class-name slot with params", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component-2",
        styleModule: {
          css: "",
          classes: { root: (params) => ["u-test-root", { "u-test-active": !!params?.active }] },
        },
      })
    );
    expect(result.current.cx("root", { active: true })).toContain("u-test-active");
    expect(result.current.cx("root", { active: false })).not.toContain("u-test-active");
  });

  it("cx() returns undefined for a slot key not present in classes", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component-3",
        styleModule: { css: "", classes: {} },
      })
    );
    expect(result.current.cx("missing")).toBeUndefined();
  });

  it("registers the component's style with reactCoreStyleSheet on mount, injecting a real <style> element", () => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    renderHook(() =>
      useComponentBase({
        componentName: "test-component-4",
        styleModule: { css: ".u-test-4 { color: blue; }", classes: {} },
      })
    );
    expect(reactCoreStyleSheet.has("test-component-4")).toBe(true);
    const matching = [...document.head.querySelectorAll("style")].filter((el) =>
      el.textContent?.includes(".u-test-4")
    );
    expect(matching).toHaveLength(1);
  });
});
