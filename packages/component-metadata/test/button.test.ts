import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { BUTTON_METADATA } from "../src/records/button";
import { ALL_COMPONENTS } from "../src/index";

describe("Button metadata record (ground truth: packages/{ng,react,vue}/src/button/*)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(BUTTON_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("has an empty events array in every framework (no custom events, native click passthrough only — confirmed against real source)", () => {
    expect(BUTTON_METADATA.api?.ng?.events).toEqual([]);
    expect(BUTTON_METADATA.api?.react?.events).toEqual([]);
    expect(BUTTON_METADATA.api?.vue?.events).toEqual([]);
  });

  it("records real, framework-native prop names, not a normalized universal name", () => {
    const ngPropNames = BUTTON_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("loading");
    expect(ngPropNames).toContain("raised");
  });

  it("has componentName 'button' in its style block (verified real convergence across all 3 frameworks)", () => {
    expect(BUTTON_METADATA.style?.componentName).toBe("button");
  });
});
