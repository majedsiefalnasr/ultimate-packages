import { describe, it, expect } from "vitest";
import { auraPreset } from "../src/presets/aura";
import {
  collectReferences,
  definedVariableNames,
  malformedReferences,
  unresolvedReferences,
  variableNameFor,
} from "./utils/token-paths";

describe("token-paths test helper", () => {
  it("maps references to the engine's variable names, kebab-casing camelCase paths", () => {
    expect(variableNameFor("form.field.background")).toBe("--u-form-field-background");
    expect(variableNameFor("overlay.popover.borderRadius")).toBe(
      "--u-overlay-popover-border-radius"
    );
    expect(variableNameFor("surface.0")).toBe("--u-surface-0");
  });

  it("defines primitive, shared semantic and per-mode semantic variables", () => {
    const { light, dark } = definedVariableNames();
    for (const set of [light, dark]) {
      expect(set.has("--u-emerald-500")).toBe(true); // primitive
      expect(set.has("--u-border-radius-sm")).toBe(true); // primitive.borderRadius.sm
      expect(set.has("--u-form-field-background")).toBe(true); // colorScheme-split semantic
      expect(set.has("--u-focus-ring-width")).toBe(true); // shared semantic
    }
  });

  it("collects references with their location", () => {
    expect(collectReferences({ root: { a: "{x.y}", b: "1px {z}" }, n: 1 })).toEqual([
      { location: "root.a", reference: "x.y" },
      { location: "root.b", reference: "z" },
    ]);
  });

  it("reports references that do not resolve", () => {
    expect(unresolvedReferences({ root: { a: "{no.such.token}" } })).toEqual([
      "root.a: {no.such.token} undefined in light+dark",
    ]);
  });

  it("flags unbalanced braces", () => {
    expect(malformedReferences({ a: "{ok.ref}", b: "{broken" })).toEqual(["b: {broken"]);
  });

  it("resolves every reference in the existing proof-set modules (validates the helper)", () => {
    for (const name of ["button", "checkbox", "dialog", "menu", "tooltip"]) {
      expect(unresolvedReferences(auraPreset.components[name]), name).toEqual([]);
    }
  });
});
