import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { ALL_COMPONENTS } from "../src/index";

describe("@ultimate/component-metadata package exports", () => {
  it("exports an ALL_COMPONENTS array", () => {
    expect(Array.isArray(ALL_COMPONENTS)).toBe(true);
  });
});

describe("whole-set validation (cross-record checks)", () => {
  it("every record in ALL_COMPONENTS is individually and cross-validated (no duplicate names, no dangling relationships)", () => {
    for (const record of ALL_COMPONENTS) {
      const result = validateComponentMetadata(record, ALL_COMPONENTS);
      expect(result.valid, `record ${record.name} failed: ${!result.valid ? result.errors.join("; ") : ""}`).toBe(true);
    }
  });

  it("contains exactly the 8 proof-set components, no more, no fewer (this plan's own scope boundary)", () => {
    const names = ALL_COMPONENTS.map((c) => c.name).sort();
    expect(names).toEqual(["Button", "Checkbox", "Dialog", "Menu", "Paginator", "Scroller", "Table", "Tooltip"]);
  });
});
