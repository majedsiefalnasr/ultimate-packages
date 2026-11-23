import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { style } from "../src/avatar";

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
const CLICKABLE_RULE = /\.u-avatar-clickable\s*\{\s*cursor:\s*pointer;\s*\}/;

describe("uix-styles/avatar", () => {
  it("matches the upstream avatar module after the p- to u- rename, plus one clickable rule", () => {
    const upstream = normalize(fixture.modules.avatar.replace(/\bp-avatar/g, "u-avatar"));
    expect(style).toMatch(CLICKABLE_RULE);
    expect(normalize(style.replace(CLICKABLE_RULE, ""))).toBe(upstream);
  });

  it("exports a style string with Ultimate-renamed classes, no leftover .p-avatar", () => {
    expect(style).toContain(".u-avatar");
    expect(style).toContain(".u-avatar-group");
    expect(style).not.toContain(".p-avatar");
  });

  it("offsets stacked avatars with logical, tokenized, size-specific margins", () => {
    expect(style).toContain("margin-inline-start: dt('avatar.group.offset')");
    expect(style).toContain("margin-inline-start: dt('avatar.lg.group.offset')");
    expect(style).toContain("margin-inline-start: dt('avatar.xl.group.offset')");
    expect(style).not.toMatch(/margin-left/);
  });
});
