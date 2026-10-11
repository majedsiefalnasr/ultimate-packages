import { describe, expect, it, vi } from "vitest";
import {
  StyleSheet,
  ICON_SPIN_KEY,
  iconSpinCss,
  registerIconSpin,
  hiddenAccessibleCss,
} from "../src/index";

describe("registerIconSpin (GAP-124)", () => {
  it("adds the shared rule once under the reserved key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerIconSpin(sheet);
    registerIconSpin(sheet);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(ICON_SPIN_KEY, iconSpinCss);
    expect(ICON_SPIN_KEY).toBe("u-icon-spin");
  });

  it("is Prime's .p-icon-spin rule renamed to u-, plus an Ultimate reduced-motion stop", () => {
    expect(iconSpinCss).toContain("animation: u-icon-spin 2s infinite linear;");
    expect(iconSpinCss).toContain("transform: rotate(0deg);");
    expect(iconSpinCss).toContain("transform: rotate(359deg);");
    expect(iconSpinCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.u-icon-spin\s*\{\s*animation: none;\s*\}\s*\}/
    );
    expect(iconSpinCss).not.toContain("p-icon");
    expect(iconSpinCss).not.toContain("-webkit-");
  });

  it("equals the Spec 5.1 rule exactly, modulo whitespace", () => {
    const spec = `
      .u-icon-spin {
        animation: u-icon-spin 2s infinite linear;
      }

      @keyframes u-icon-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(359deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .u-icon-spin {
          animation: none;
        }
      }
    `;
    const normalise = (css: string) => css.replace(/\s+/g, " ").trim();
    expect(normalise(iconSpinCss)).toBe(normalise(spec));
  });

  it("selects only elements carrying .u-icon-spin", () => {
    const selectors = [...iconSpinCss.matchAll(/^\s*([^@{}\s][^{}]*?)\s*\{/gm)]
      .map((m) => m[1].trim())
      .filter((s) => !/^\d+%$/.test(s));
    expect(selectors).toEqual([".u-icon-spin", ".u-icon-spin"]);
  });

  it("is separate from the hidden-accessible rule", () => {
    expect(hiddenAccessibleCss).not.toContain("u-icon-spin");
  });
});
