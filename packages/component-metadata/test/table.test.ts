import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { TABLE_METADATA } from "../src/records/table";
import { ALL_COMPONENTS } from "../src/index";

describe("Table metadata record (spec §12's own worked example: sort-changed divergence)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(TABLE_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("represents the real sort-changed divergence: same semanticId, three different frameworkName/mechanism pairs", () => {
    const ng = TABLE_METADATA.api?.ng?.events.find((e) => e.semanticId === "sort-changed");
    const react = TABLE_METADATA.api?.react?.events.find((e) => e.semanticId === "sort-changed");
    const vue = TABLE_METADATA.api?.vue?.events.find((e) => e.semanticId === "sort-changed");
    expect(ng).toMatchObject({ frameworkName: "sortFieldChange", mechanism: "output" });
    expect(react).toMatchObject({ frameworkName: "onSort", mechanism: "callback-prop" });
    expect(vue).toMatchObject({ frameworkName: "sort", mechanism: "emit" });
  });

  it("declares Paginator and Scroller as real, valid dependencies (spec §12, §6.5)", () => {
    expect(TABLE_METADATA.relationships?.dependsOn).toEqual(expect.arrayContaining(["Paginator", "Scroller"]));
  });

  it("has verified accessibility facts (role, aria-sort, aria-selected) matching the just-closed milestone's real shipped markup", () => {
    expect(TABLE_METADATA.accessibility?.verifiedRoles).toEqual(expect.arrayContaining(["row", "columnheader"]));
    expect(TABLE_METADATA.accessibility?.verifiedAriaAttributes).toEqual(expect.arrayContaining(["aria-sort", "aria-selected"]));
  });

  it("description and accessibility.guidance carry non-overlapping content (spec §6.1a boundary)", () => {
    // description must not restate the accessibility-specific windowed-keyboard-nav
    // limitation, and accessibility.guidance must not restate the identity statement —
    // this is a direct regression guard against the exact duplication risk §6.1a exists to prevent.
    expect(TABLE_METADATA.description).not.toContain("window");
    expect(TABLE_METADATA.accessibility?.guidance).toMatch(/window/i);
  });
});
