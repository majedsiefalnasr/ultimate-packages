import { describe, it, expect } from "vitest";
import { auraPreset } from "../src/presets/aura";

describe("Ultimate Aura-derived preset", () => {
  it("has a primitive tier with real color-ramp values", () => {
    expect(auraPreset.primitive).toBeDefined();
    expect(typeof auraPreset.primitive.blue?.[500]).toBe("string");
    expect(auraPreset.primitive.blue?.[500]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("has a semantic tier with light/dark colorScheme", () => {
    expect(auraPreset.semantic.colorScheme.light).toBeDefined();
    expect(auraPreset.semantic.colorScheme.dark).toBeDefined();
  });

  it("has component token objects for all five proof-set components", () => {
    expect(auraPreset.components.button).toBeDefined();
    expect(auraPreset.components.checkbox).toBeDefined();
    expect(auraPreset.components.dialog).toBeDefined();
    expect(auraPreset.components.menu).toBeDefined();
    expect(auraPreset.components.tooltip).toBeDefined();
  });

  it("button component tokens have light/dark colorScheme with real values, not placeholders", () => {
    const button = auraPreset.components.button;
    expect(button.colorScheme.light.root?.primary?.background).toBeDefined();
    expect(button.colorScheme.light.root?.primary?.background).not.toBe("");
    expect(button.colorScheme.dark.root?.primary?.background).toBeDefined();
  });
});
