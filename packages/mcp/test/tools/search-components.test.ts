// packages/mcp/test/tools/search-components.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { searchComponents } from "../../src/tools/search-components";

describe("searchComponents", () => {
  it("matches case-insensitively against name (spec §7.1: exact v1 rule)", () => {
    const result = searchComponents({ query: "button" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("matches case-insensitively against category", () => {
    const result = searchComponents({ query: "primitive" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // Button's category is "Primitive" per the real record.
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("matches case-insensitively against description", () => {
    const buttonRecord = ALL_COMPONENTS.find((c) => c.name === "Button")!;
    const distinctiveWord = buttonRecord.description.split(" ").find((w) => w.length > 6)!;
    const result = searchComponents({ query: distinctiveWord.toUpperCase() });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("returns an empty array, never an error, when nothing matches", () => {
    const result = searchComponents({ query: "zzz-no-such-component-zzz" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches).toEqual([]);
  });

  it("restricts to components with a packages.{framework} entry when framework is supplied", () => {
    const result = searchComponents({ query: "", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // All 8 real records have an ng entry (Pre-flight #4) — every match returned.
    expect(result.matches.length).toBe(ALL_COMPONENTS.length);
  });

  it("returns matches in ALL_COMPONENTS's own array order — unranked, no fuzzy scoring (spec §7.1/§10)", () => {
    const result = searchComponents({ query: "" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.map((m) => m.name)).toEqual(ALL_COMPONENTS.map((c) => c.name));
  });

  it("each match includes exactly {name, category, description}", () => {
    const result = searchComponents({ query: "Button" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    const match = result.matches.find((m) => m.name === "Button")!;
    expect(Object.keys(match).sort()).toEqual(["category", "description", "name"]);
  });

  it("rejects a non-string query with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = searchComponents({ query: 42 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
