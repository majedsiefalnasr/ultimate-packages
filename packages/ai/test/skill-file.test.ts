import { describe, it, expect } from "vitest";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import {
  generateSkillFile,
  regenerateSkillFile,
  parseFrontmatter,
  startMarker,
  endMarker,
  SECTION_KEYS,
} from "../src/skill-file";

const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;

// SYNTHETIC fixture, not part of @ultimate/component-metadata's real
// ALL_COMPONENTS export. At the real repository baseline, NO component
// record has a populated top-level `guidance` block (confirmed during
// Task 2 and re-confirmed for Task 3 by reading
// packages/component-metadata/src/records/*.ts directly — Table only has
// `accessibility.guidance`, a different field, populated). The brief's
// original test used TABLE for this case, which is factually wrong against
// real data; this local object exercises the same
// non-empty-preferred-patterns code path without touching any file under
// packages/component-metadata/. Mirrors the SYNTHETIC_WITH_GUIDANCE fixture
// already established in packages/ai/test/render-section.test.ts (Task 2).
const SYNTHETIC_WITH_GUIDANCE: ComponentMetadata = {
  name: "SyntheticComponent",
  category: "Test",
  description:
    "A synthetic record with populated guidance, used only to exercise the non-empty preferred-patterns rendering path — no real v1 record has this field populated.",
  schemaVersion: "1.0.0",
  metadataVersion: 1,
  packages: {},
  guidance: {
    usageNotes: "Use this component when a synthetic test scenario calls for it.",
    antiPatterns: ["Do not use this in production — it is a test fixture."],
  },
};

describe("SECTION_KEYS", () => {
  it("is exactly the 5 v1 section keys, in this exact order", () => {
    expect(SECTION_KEYS).toEqual([
      "preferred-patterns",
      "allowed-apis",
      "anti-patterns",
      "accessibility-guidance",
      "related-components",
    ]);
  });
});

describe("startMarker / endMarker", () => {
  it("produces the exact spec §6.3.3 marker syntax", () => {
    expect(startMarker("preferred-patterns")).toBe(
      '<!-- ultimate:generated:start section="preferred-patterns" -->'
    );
    expect(endMarker("preferred-patterns")).toBe(
      '<!-- ultimate:generated:end section="preferred-patterns" -->'
    );
  });
});

describe("generateSkillFile", () => {
  it("includes a YAML frontmatter block with component/metadataVersion/frameworks", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const parsed = parseFrontmatter(content);
    expect(parsed).toEqual({
      component: "Button",
      metadataVersion: 1,
      frameworks: ["ng", "react", "vue"],
    });
  });

  it("includes exactly 5 marker pairs, each present, in the fixed order", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      expect(content).toContain(startMarker(key));
      expect(content).toContain(endMarker(key));
    }
    // Order check: preferred-patterns' start must appear before allowed-apis' start.
    expect(content.indexOf(startMarker("preferred-patterns"))).toBeLessThan(
      content.indexOf(startMarker("allowed-apis"))
    );
  });

  it("gets an empty preferred-patterns marker pair for Button (guidance.usageNotes absent)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const start =
      content.indexOf(startMarker("preferred-patterns")) + startMarker("preferred-patterns").length;
    const end = content.indexOf(endMarker("preferred-patterns"));
    expect(content.slice(start, end).trim()).toBe("");
  });

  it("gets a non-empty preferred-patterns marker pair for a component with guidance.usageNotes populated (synthetic fixture — no real v1 record has this field populated)", () => {
    const content = generateSkillFile(SYNTHETIC_WITH_GUIDANCE, ["ng", "react", "vue"]);
    const start =
      content.indexOf(startMarker("preferred-patterns")) + startMarker("preferred-patterns").length;
    const end = content.indexOf(endMarker("preferred-patterns"));
    expect(content.slice(start, end).trim().length).toBeGreaterThan(0);
  });

  it("never emits an examples marker pair — Examples has no v1 data model", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(content).not.toContain('section="examples"');
  });

  it("is deterministic — generating the same component twice produces byte-identical output", () => {
    const first = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const second = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(first).toBe(second);
  });

  // The following 4 tests pin down the exact heading/marker structure —
  // added in response to Plan Review round 1's finding that the original
  // heading-placement logic misplaced or omitted headings for some
  // sections. Each test fails loudly (not silently, via manual inspection)
  // if that regresses.

  const EXPECTED_HEADINGS: Record<string, string> = {
    "preferred-patterns": "## Preferred patterns",
    "allowed-apis": "## Allowed/recommended APIs",
    "anti-patterns": "## Anti-patterns",
    "accessibility-guidance": "## Accessibility guidance",
    "related-components": "## Related components",
  };

  it("gives every one of the 5 generated sections its own expected heading", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      expect(content).toContain(EXPECTED_HEADINGS[key]);
    }
  });

  it("places each section's heading immediately before that section's own start marker, with nothing but whitespace between them", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      const heading = EXPECTED_HEADINGS[key];
      const headingIndex = content.indexOf(heading);
      const markerIndex = content.indexOf(startMarker(key));
      expect(headingIndex).toBeGreaterThan(-1);
      expect(markerIndex).toBeGreaterThan(headingIndex);
      const between = content.slice(headingIndex + heading.length, markerIndex);
      expect(between.trim()).toBe("");
    }
  });

  it("emits the 5 heading/marker blocks in the exact approved order (preferred-patterns, allowed-apis, anti-patterns, accessibility-guidance, related-components)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const headingPositions = SECTION_KEYS.map((key) => content.indexOf(EXPECTED_HEADINGS[key]));
    for (let i = 1; i < headingPositions.length; i++) {
      expect(headingPositions[i]).toBeGreaterThan(headingPositions[i - 1]);
    }
  });

  it("never emits an 'Examples' heading — Examples has no marker and no heading in v1", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(content).not.toMatch(/##\s*Examples/i);
  });
});

describe("regenerateSkillFile", () => {
  it("preserves hand-authored content outside marker pairs, verbatim", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const handAuthored = original.replace(
      "## When to use\n",
      "## When to use\nUse Button whenever a clickable action is needed.\n"
    );
    const result = regenerateSkillFile(handAuthored, BUTTON, ["ng", "react", "vue"]);
    expect("content" in result).toBe(true);
    if (!("content" in result)) return;
    expect(result.content).toContain("Use Button whenever a clickable action is needed.");
  });

  it("rewrites metadataVersion in the frontmatter to match the current record on regeneration", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const staleVersion = original.replace("metadataVersion: 1", "metadataVersion: 0");
    const result = regenerateSkillFile(staleVersion, BUTTON, ["ng", "react", "vue"]);
    expect("content" in result).toBe(true);
    if (!("content" in result)) return;
    const parsed = parseFrontmatter(result.content);
    expect(parsed?.metadataVersion).toBe(1);
  });

  it("refuses to regenerate a file with a missing required marker (both start and end absent), returning a structured error", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const broken = original
      .replace(startMarker("anti-patterns"), "")
      .replace(endMarker("anti-patterns"), "");
    const result = regenerateSkillFile(broken, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("missing required generated section");
    expect(result.error).toContain("anti-patterns");
  });

  it("refuses to regenerate a file with a duplicate marker, returning a structured error", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const duplicated =
      original + `\n${startMarker("anti-patterns")}\n${endMarker("anti-patterns")}\n`;
    const result = regenerateSkillFile(duplicated, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("duplicate generated section");
  });

  it("refuses to regenerate a file with only a start marker (end truly absent), classifying it as unmatched — not missing", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const broken = original.replace(endMarker("anti-patterns"), "");
    const result = regenerateSkillFile(broken, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("unmatched marker for section");
    expect(result.error).not.toContain("missing required generated section");
  });

  it("refuses to regenerate a file with only an end marker (start truly absent), classifying it as unmatched", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const broken = original.replace(startMarker("anti-patterns"), "");
    const result = regenerateSkillFile(broken, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("unmatched marker for section");
  });

  it("refuses to regenerate a file with a nested marker pair, returning a structured error", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    // Relocate the existing preferred-patterns start+end pair (each marker
    // still occurs exactly once overall) to sit strictly inside
    // allowed-apis's own start/end range, producing a genuine nesting
    // violation without duplicating any marker.
    const ppStart = startMarker("preferred-patterns");
    const ppEnd = endMarker("preferred-patterns");
    const ppStartIndex = original.indexOf(ppStart);
    const ppEndIndex = original.indexOf(ppEnd) + ppEnd.length;
    const preferredPatternsBlock = original.slice(ppStartIndex, ppEndIndex);
    const withoutBlock = original.slice(0, ppStartIndex) + original.slice(ppEndIndex);
    const nested = withoutBlock.replace(
      startMarker("allowed-apis"),
      `${startMarker("allowed-apis")}\n${preferredPatternsBlock}\n`
    );
    const result = regenerateSkillFile(nested, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("nested generated block");
  });
});

describe("parseFrontmatter", () => {
  it("returns undefined for content with no frontmatter block", () => {
    expect(parseFrontmatter("no frontmatter here")).toBeUndefined();
  });

  // The following tests pin down the exact type contract added in Plan
  // Review round 2's correction pass: metadataVersion must be a positive
  // integer, not merely typeof "number" (which would silently accept
  // 1.5, 0, or -1); frameworks must be an array of strings, not an array
  // of arbitrary values.

  it("returns undefined when metadataVersion is a non-integer number (e.g. 1.5)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 1.5"
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("returns undefined when metadataVersion is zero or negative", () => {
    const zeroContent = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 0"
    );
    expect(parseFrontmatter(zeroContent)).toBeUndefined();

    const negativeContent = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: -1"
    );
    expect(parseFrontmatter(negativeContent)).toBeUndefined();
  });

  it("returns undefined when metadataVersion is a string, not a number", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      'metadataVersion: "1"'
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("returns undefined when frameworks contains a non-string element", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "frameworks: [ng, react, vue]",
      "frameworks: [ng, react, 42]"
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("accepts a well-formed frontmatter block with a valid positive-integer metadataVersion", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const parsed = parseFrontmatter(content);
    expect(parsed).toEqual({
      component: "Button",
      metadataVersion: 1,
      frameworks: ["ng", "react", "vue"],
    });
  });
});
