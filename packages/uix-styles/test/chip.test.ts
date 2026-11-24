import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { style } from "../src/chip";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../themes/test/fixtures/primeuix-styles-g3a.json"
    ),
    "utf8"
  )
) as { modules: Record<string, string> };

const normalize = (css: string) => css.replace(/\s+/g, " ").trim();
const LABEL_RULE = /\.u-chip-label\s*\{\s*line-height:\s*1\.5;\s*padding:\s*0\.25rem 0;\s*\}/;

describe("uix-styles/chip", () => {
  it("matches the upstream chip module after the p- to u- rename, plus one retained label rule", () => {
    const upstream = normalize(fixture.modules.chip.replace(/\bp-chip/g, "u-chip"));
    expect(style).toMatch(LABEL_RULE);
    expect(normalize(style.replace(LABEL_RULE, ""))).toBe(upstream);
  });

  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura chip tokens", () => {
    expect(style).toContain("dt('chip.background')");
    expect(style).toContain("dt('chip.padding.x')");
    expect(style).toContain("dt('chip.image.width')");
    expect(style).toContain("dt('chip.remove.icon.focus.ring.color')");
    expect(style).toContain("dt('chip.transition.duration')");
  });

  it("styles the five parts the components emit", () => {
    for (const selector of [
      ".u-chip {",
      ".u-chip-icon {",
      ".u-chip-image {",
      ".u-chip-label {",
      ".u-chip-remove-icon {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("has no hard-coded colours or --u-chip fallbacks", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/--u-chip/);
    expect(style).not.toMatch(/\.p-chip/);
  });
});
