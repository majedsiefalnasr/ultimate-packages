// packages/component-schema/test/metadata-version.test.ts
import { describe, it, expect } from "vitest";
import { nextMetadataVersion } from "../src/metadata-version";
import type { ComponentMetadata } from "../src/component-metadata";

const base: ComponentMetadata = {
  name: "Button", category: "Primitive", description: "A button.",
  schemaVersion: "1.0.0", metadataVersion: 1,
  packages: { ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/button/button.ts" } },
  api: { ng: { props: [{ name: "loading", type: "boolean", required: false }], events: [] } },
  guidance: { usageNotes: "Prefer text buttons for secondary actions." },
};

describe("nextMetadataVersion (spec §5.1 increment semantics — six required scenarios)", () => {
  it("1. increments by exactly 1 when a scalar field genuinely changes", () => {
    const changed = { ...base, description: "A clickable button." };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("2. increments by exactly 1 when nested content genuinely changes", () => {
    const changed = {
      ...base,
      api: { ng: { props: [{ name: "loading", type: "'true' | 'false'", required: false }], events: [] } },
    };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("3. does NOT increment when re-run against byte-identical content (no-op regeneration)", () => {
    const identical = { ...base };
    expect(nextMetadataVersion(base, identical)).toBe(1);
  });

  it("4. does NOT increment on a schemaVersion-only change with everything else identical", () => {
    const schemaBumpedOnly = { ...base, schemaVersion: "1.1.0" };
    expect(nextMetadataVersion(base, schemaBumpedOnly)).toBe(1);
  });

  it("5. increments by exactly 1 when a generated-fact field (api.ng.events) changes", () => {
    const changed = {
      ...base,
      api: { ng: { props: base.api!.ng!.props, events: [{ semanticId: "clicked", frameworkName: "click", mechanism: "output" as const }] } },
    };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("6. increments by exactly 1 when a human-authored guidance field changes — shares the same single version counter as generated facts, not a separate one", () => {
    const changed = { ...base, guidance: { usageNotes: "Prefer outlined buttons for secondary actions." } };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });
});
