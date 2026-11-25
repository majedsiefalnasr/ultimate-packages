import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { style } from "../src/knob";

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

describe("uix-styles/knob", () => {
  it("matches the upstream knob module after the p- to u- rename", () => {
    const upstream = normalize(fixture.modules.knob.replace(/\bp-knob/g, "u-knob"));
    expect(normalize(style)).toBe(upstream);
  });

  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura knob tokens", () => {
    expect(style).toContain("dt('knob.transition.duration')");
    expect(style).toContain("dt('knob.focus.ring.shadow')");
    expect(style).toContain("dt('knob.focus.ring.width')");
    expect(style).toContain("dt('knob.focus.ring.style')");
    expect(style).toContain("dt('knob.focus.ring.color')");
    expect(style).toContain("dt('knob.focus.ring.offset')");
  });

  it("styles the parts the components emit", () => {
    for (const selector of [
      ".u-knob-range {",
      ".u-knob-value {",
      ".u-knob-text {",
      ".u-knob svg {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("animates the value arc with a prefixed keyframe", () => {
    expect(style).toContain("animation-name: u-knob-dash-frame;");
    expect(style).toContain("@keyframes u-knob-dash-frame");
  });

  it("has no hard-coded colours, --u-knob fallbacks or p- selectors", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/--u-knob/);
    expect(style).not.toMatch(/\.p-knob/);
  });
});
