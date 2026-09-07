// packages/mcp/test/tools/get-component.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { getComponent } from "../../src/tools/get-component";

describe("getComponent", () => {
  it("without framework: returns the complete metadata record unmodified, across all frameworks it covers (spec §7.1)", () => {
    const real = ALL_COMPONENTS.find((c) => c.name === "Table")!;
    const result = getComponent({ name: "Table" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result).toEqual(real);
  });

  it("with framework: keeps every framework-neutral facet in full — name, category, description, accessibility, style, relationships, guidance, provenanceRef (spec §7.1's exact rule)", () => {
    const real = ALL_COMPONENTS.find((c) => c.name === "Table")!;
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.name).toBe(real.name);
    expect(result.category).toBe(real.category);
    expect(result.description).toBe(real.description);
    expect(result.accessibility).toEqual(real.accessibility);
    expect(result.style).toEqual(real.style);
    expect(result.relationships).toEqual(real.relationships);
    expect(result.guidance).toEqual(real.guidance);
    expect(result.provenanceRef).toEqual(real.provenanceRef);
  });

  it("with framework: narrows packages to exactly {ng: ...}, dropping react/vue entries", () => {
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(Object.keys(result.packages)).toEqual(["ng"]);
  });

  it("with framework: narrows api to exactly {ng: ...}, dropping react/vue entries", () => {
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(Object.keys(result.api ?? {})).toEqual(["ng"]);
  });

  it("returns a structured not-found error naming the known-8-component list for an unknown name (case 2)", () => {
    const result = getComponent({ name: "NotAComponent" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
    for (const component of ALL_COMPONENTS) {
      expect(result.message).toContain(component.name);
    }
  });

  it("never falls back to a partial-match on an unknown name — exact name match only", () => {
    const result = getComponent({ name: "Butto" }); // deliberately truncated "Button"
    expect("code" in result).toBe(true);
  });
});
