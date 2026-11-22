import { describe, expect, it, vi } from "vitest";
import { StyleSheet, SHARED_BASE_KEY, registerSharedBase } from "../src/index";

describe("registerSharedBase (A6, ADR-081)", () => {
  it("adds the shared base module once under the reserved key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerSharedBase(sheet);
    registerSharedBase(sheet);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0]?.[0]).toBe(SHARED_BASE_KEY);
    expect(SHARED_BASE_KEY).toBe("u-base");
  });

  it("registers u-* rules only, with no p-* selector and no page-wide box-sizing", () => {
    const sheet = new StyleSheet();
    registerSharedBase(sheet);
    const css = sheet.get(SHARED_BASE_KEY)?.css ?? "";
    expect(css).toContain(".u-disabled");
    expect(css).toContain(".u-overlay-mask");
    expect(css).toContain("@keyframes u-animate-collapsible-expand");
    expect(css).not.toMatch(/\.p-|p-animate|\.pi\b/);
    expect(css).not.toMatch(/box-sizing/);
  });
});
