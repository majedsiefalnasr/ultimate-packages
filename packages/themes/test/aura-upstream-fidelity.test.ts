import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { auraPreset } from "../src/presets/aura";
import fixture from "./fixtures/aura-upstream-tokens.json";

/**
 * Upstream-fidelity snapshot: `fixtures/aura-upstream-tokens.json` holds the
 * `@primeuix/themes@2.0.3` Aura token object for every ported module (see its
 * `_meta`). Every registered module must deep-equal its fixture entry, so a
 * transcription drift fails in CI without needing `.vendor-extracted/`.
 */

const PROOF_SET = ["button", "checkbox", "dialog", "menu", "tooltip"];

const upstream = fixture.modules as Record<string, unknown>;
const upstreamKeys = Object.keys(upstream);

describe("Aura upstream fidelity (committed fixture)", () => {
  it("records its source package and generation method", () => {
    expect(fixture._meta.source).toContain("@primeuix/themes@2.0.3");
    expect(fixture._meta.source).toContain("MIT");
    expect(fixture._meta.method).toBeTruthy();
  });

  it("covers every registered module except the hand-ported proof set", () => {
    const expected = Object.keys(auraPreset.components)
      .filter((k) => !PROOF_SET.includes(k))
      .sort();
    expect([...upstreamKeys].sort()).toEqual(expected);
  });

  it.each(upstreamKeys)("%s deep-equals the upstream snapshot", (key) => {
    expect(auraPreset.components[key]).toEqual(upstream[key]);
  });

  // The fixture itself is checked against the readable vendored source where
  // it exists (`.vendor-extracted/` is gitignored, so this skips in CI).
  const vendorRoot = join(__dirname, "..", "..", "..", ".vendor-extracted/themes/src/presets/aura");
  describe.skipIf(!existsSync(vendorRoot))("fixture vs .vendor-extracted source", () => {
    it.each(upstreamKeys)("%s fixture matches the vendored source", async (key) => {
      const vendored = await import(/* @vite-ignore */ join(vendorRoot, key, "index.ts"));
      expect(upstream[key]).toEqual(vendored.default);
    });
  });
});
