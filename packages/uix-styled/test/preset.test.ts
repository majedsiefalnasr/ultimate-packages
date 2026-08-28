import { describe, it, expect } from "vitest";
import definePreset from "../src/actions/definePreset";

describe("definePreset", () => {
  it("deep-merges multiple preset objects into one", () => {
    const base = { primitive: { blue: { 500: "#3B82F6" } } };
    const override = { primitive: { blue: { 500: "#2563EB" } } };
    const result = definePreset(base, override);
    expect(result.primitive.blue["500"]).toBe("#2563EB");
  });

  it("preserves keys not present in the override", () => {
    const base = {
      primitive: { blue: { 500: "#3B82F6" }, green: { 500: "#10B981" } },
    };
    const override = { primitive: { blue: { 500: "#2563EB" } } };
    const result = definePreset(base, override);
    expect(result.primitive.green["500"]).toBe("#10B981");
  });
});
