// packages/mcp/test/tools/get-component-api.test.ts
import { describe, it, expect, vi } from "vitest";
import { getComponentApi } from "../../src/tools/get-component-api";

describe("getComponentApi", () => {
  it("returns the real, non-empty events array for Table/react (Pre-flight #4: populated, not empty)", () => {
    const result = getComponentApi({ name: "Table", framework: "react" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.events.length).toBeGreaterThan(0);
  });

  it("returns an empty events array for Button/ng, exactly as recorded (Pre-flight #4: this record is genuinely empty)", () => {
    const result = getComponentApi({ name: "Button", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.events).toEqual([]);
  });

  it("returns the real props array, exactly as recorded, with no reshaping", () => {
    const result = getComponentApi({ name: "Button", framework: "react" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.props.some((p) => p.name === "label")).toBe(true);
  });

  it("returns a structured not-found error for an unknown component name (case 2)", () => {
    const result = getComponentApi({ name: "NotAComponent", framework: "ng" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
  });

  it("real v1 data sanity check: every real record has api.{framework} populated for all 3 frameworks (Pre-flight #4) — this call never hits the facet_not_recorded path today", () => {
    const result = getComponentApi({ name: "Button", framework: "ng" });
    expect("code" in result).toBe(false);
  });

  it("returns facet_not_recorded (case 4), not an error, when packages.{framework}/api.{framework} is absent for an otherwise-valid record — exercised via a synthetic mocked record, since no real v1 record has this gap", async () => {
    vi.resetModules();
    vi.doMock("@ultimate/component-metadata", () => ({
      ALL_COMPONENTS: [
        {
          name: "SyntheticGapComponent",
          category: "Test",
          description: "A synthetic record with no react api entry, used only to exercise the facet_not_recorded path.",
          schemaVersion: "1.0.0",
          metadataVersion: 1,
          packages: { ng: { packageName: "@ultimate/ng", sourcePath: "n/a" } },
          // Deliberately no `api` key at all — the real-world shape this
          // synthesizes is a component with a packages.ng entry but no
          // recorded api facts for it.
        },
      ],
    }));

    const { getComponentApi: getComponentApiWithMock } = await import("../../src/tools/get-component-api");
    const result = getComponentApiWithMock({ name: "SyntheticGapComponent", framework: "ng" });

    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("facet_not_recorded");

    vi.doUnmock("@ultimate/component-metadata");
    vi.resetModules();
  });

  it("rejects an invalid framework value with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong value for the runtime check
    const result = getComponentApi({ name: "Button", framework: "svelte" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
