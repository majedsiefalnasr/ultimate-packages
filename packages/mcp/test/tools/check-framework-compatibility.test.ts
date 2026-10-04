// packages/mcp/test/tools/check-framework-compatibility.test.ts
import { describe, it, expect } from "vitest";
import { checkFrameworkCompatibility } from "../../src/tools/check-framework-compatibility";

describe("checkFrameworkCompatibility", () => {
  it("returns compatible: true for a version satisfying the real manifest's angular frameworkVersionRange", () => {
    // Real manifest entry: angular frameworkVersionRange "^21.0.7" (Pre-flight #6).
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: "21.0.7" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(true);
  });

  it("returns compatible: false with a reason for a version below the real manifest's range floor", () => {
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: "20.0.0" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("returns compatible: true for a version satisfying react's multi-range union (^17||^18||^19, Pre-flight #6)", () => {
    const result = checkFrameworkCompatibility({ framework: "react", frameworkVersion: "18.2.0" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(true);
  });

  it("evaluates ONLY frameworkVersionRange — never claims to evaluate ultimateFrameworkPackage/uix/theme/metadataSchema/cli axes (spec §7.4's corrected terminology)", () => {
    const result = checkFrameworkCompatibility({ framework: "vue", frameworkVersion: "3.5.2" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // Structural check: result shape is exactly {compatible, reason?} — no
    // other axis fields (ultimateFrameworkPackageCompatible, uixCompatible,
    // etc.) exist anywhere on the return type.
    for (const key of Object.keys(result)) {
      expect(["compatible", "reason"]).toContain(key);
    }
  });

  it("reports Vue 3.5.2, the supported floor (ADR-050), as compatible", () => {
    const result = checkFrameworkCompatibility({ framework: "vue", frameworkVersion: "3.5.2" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(true);
  });

  it("reports Vue 3.5.1, below the supported floor (ADR-050), as incompatible with a reason", () => {
    const result = checkFrameworkCompatibility({ framework: "vue", frameworkVersion: "3.5.1" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("rejects an unknown framework value with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong value for the runtime check
    const result = checkFrameworkCompatibility({ framework: "svelte", frameworkVersion: "1.0.0" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });

  it("rejects a non-string frameworkVersion with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: 21 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
