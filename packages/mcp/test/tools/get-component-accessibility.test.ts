// packages/mcp/test/tools/get-component-accessibility.test.ts
import { describe, it, expect } from "vitest";
import { getComponentAccessibility } from "../../src/tools/get-component-accessibility";

describe("getComponentAccessibility", () => {
  it("returns Table's real, populated accessibility facet (Pre-flight #4: Table is the only real record with one)", () => {
    const result = getComponentAccessibility({ name: "Table" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.guidance).toBeDefined();
  });

  it("returns an explicit facet_not_recorded result, not a fabricated empty-but-implying-verified response, for a component with no accessibility facet (case 4)", () => {
    // Button has no accessibility facet at all (Pre-flight #4).
    const result = getComponentAccessibility({ name: "Button" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("facet_not_recorded");
  });

  it("returns a structured not-found error for an unknown component name (case 2)", () => {
    const result = getComponentAccessibility({ name: "NotAComponent" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
  });

  it("rejects a non-string name with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = getComponentAccessibility({ name: 42 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
