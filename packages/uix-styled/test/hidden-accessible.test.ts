import { describe, expect, it, vi } from "vitest";
import {
  StyleSheet,
  HIDDEN_ACCESSIBLE_KEY,
  hiddenAccessibleCss,
  registerHiddenAccessible,
} from "../src/index";

describe("registerHiddenAccessible (GAP-074)", () => {
  it("adds the shared rule once under the reserved key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerHiddenAccessible(sheet);
    registerHiddenAccessible(sheet);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss);
    expect(sheet.has(HIDDEN_ACCESSIBLE_KEY)).toBe(true);
  });

  it("is PrimeNG 21.1.9's .p-hidden-accessible rule renamed to u-, with no u-hidden-focusable rule", () => {
    for (const decl of [
      "border: 0",
      "clip: rect(0 0 0 0)",
      "height: 1px",
      "margin: -1px",
      "overflow: hidden",
      "padding: 0",
      "position: absolute",
      "width: 1px",
      "transform: scale(0)",
    ]) {
      expect(hiddenAccessibleCss).toContain(decl);
    }
    expect(hiddenAccessibleCss).toContain(".u-hidden-accessible input");
    expect(hiddenAccessibleCss).not.toContain("p-hidden-accessible");
    expect(hiddenAccessibleCss).not.toContain("hidden-focusable");
  });
});
