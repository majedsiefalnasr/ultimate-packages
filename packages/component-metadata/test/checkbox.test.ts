import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { CHECKBOX_METADATA } from "../src/records/checkbox";
import { ALL_COMPONENTS } from "../src/index";

describe("Checkbox metadata record (ground truth: packages/ng/src/checkbox/checkbox.ts:29 doc comment confirms no output()s exist)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(CHECKBOX_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("has an empty ng events array, distinct reasoning from Button's (an explicit documented decision, not merely 'never added')", () => {
    expect(CHECKBOX_METADATA.api?.ng?.events).toEqual([]);
  });

  it("records the real 'binary' boolean prop", () => {
    const ngPropNames = CHECKBOX_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("binary");
  });
});
