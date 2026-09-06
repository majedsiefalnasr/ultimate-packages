// packages/component-schema/test/validate.test.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "../src/validate";

// Read the ACTUAL docs/architecture/provenance/ng.json file to extract a
// genuinely-real ultimateDestination value — this test only proves the
// validator's real-file cross-check works if it uses real ground truth,
// never a hand-rolled fixture (see task brief note on this test).
const __dirname = dirname(fileURLToPath(import.meta.url));
const provenancePath = resolve(__dirname, "../../../docs/architecture/provenance/ng.json");
const provenanceEntries = JSON.parse(readFileSync(provenancePath, "utf-8")) as {
  ultimateDestination: string;
}[];
const REAL_ULTIMATE_DESTINATION = provenanceEntries[0].ultimateDestination;

function valid(): unknown {
  return {
    name: "Button", category: "Primitive", description: "A button.",
    schemaVersion: "1.0.0", metadataVersion: 1,
    packages: { ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/button/button.ts" } },
    api: { ng: { props: [], events: [] } },
    provenanceRef: { package: "ng", ultimateDestinations: [REAL_ULTIMATE_DESTINATION] },
  };
}

describe("validateComponentMetadata — accepts unknown, proves the shape at runtime (spec §13)", () => {
  it("accepts a well-formed record and narrows it to ComponentMetadata", () => {
    const result = validateComponentMetadata(valid(), [valid()]);
    expect(result.valid).toBe(true);
  });

  it("rejects null, arrays, and primitives outright (input is not even an object)", () => {
    expect(validateComponentMetadata(null, []).valid).toBe(false);
    expect(validateComponentMetadata([], []).valid).toBe(false);
    expect(validateComponentMetadata("Button", []).valid).toBe(false);
    expect(validateComponentMetadata(42, []).valid).toBe(false);
  });

  it("rejects a record missing a required top-level field", () => {
    const record = valid() as Record<string, unknown>;
    delete record.category;
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a required top-level field with the wrong runtime type (e.g. name as a number)", () => {
    const record = { ...(valid() as Record<string, unknown>), name: 42 };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects an unrecognized top-level field (strict mode)", () => {
    const record = { ...(valid() as Record<string, unknown>), unknownField: "surprise" };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a schemaVersion this validator's SCHEMA_VERSION doesn't recognize (exact-match in v1)", () => {
    const record = { ...(valid() as Record<string, unknown>), schemaVersion: "2.0.0" };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects metadataVersion 0, a negative number, a non-integer, and a string", () => {
    for (const bad of [0, -1, 1.5, "1"]) {
      const record = { ...(valid() as Record<string, unknown>), metadataVersion: bad };
      expect(validateComponentMetadata(record, [record]).valid, `metadataVersion=${JSON.stringify(bad)} should be rejected`).toBe(false);
    }
  });

  it("rejects an api.<framework> entry with no matching packages.<framework> entry", () => {
    const record = { ...(valid() as Record<string, unknown>), api: { react: { props: [], events: [] } } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed PropFact (missing required 'required' boolean)", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = { props: [{ name: "loading", type: "boolean" }], events: [] };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects an EventFact with an invalid mechanism value (not one of output/callback-prop/emit)", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = {
      props: [],
      events: [{ semanticId: "sort-changed", frameworkName: "sortFieldChange", mechanism: "signal" }],
    };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed accessibility block (verifiedRoles not an array of strings)", () => {
    const record = { ...(valid() as Record<string, unknown>), accessibility: { verifiedRoles: "row" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed style block (missing required componentName)", () => {
    const record = { ...(valid() as Record<string, unknown>), style: { styleModuleRef: "@ultimate/uix-styles/button" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed relationships block (dependsOn not an array)", () => {
    const record = { ...(valid() as Record<string, unknown>), relationships: { dependsOn: "Paginator" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed provenanceRef (package not one of the allowed literals)", () => {
    const record = { ...(valid() as Record<string, unknown>), provenanceRef: { package: "primeng", ultimateDestinations: [] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed guidance block (antiPatterns not an array of strings)", () => {
    const record = { ...(valid() as Record<string, unknown>), guidance: { antiPatterns: "don't do this" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a provenanceRef pointing at a path not present in the real provenance JSON", () => {
    const record = { ...(valid() as Record<string, unknown>), provenanceRef: { package: "ng", ultimateDestinations: ["packages/ng/src/nonexistent.ts"] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects two records sharing the same name (duplicate identity)", () => {
    const a = valid();
    const b = valid();
    expect(validateComponentMetadata(a, [a, b]).valid).toBe(false);
  });

  it("rejects a relationships.dependsOn entry that doesn't match any real record name (dangling reference)", () => {
    const record = { ...(valid() as Record<string, unknown>), relationships: { dependsOn: ["NonexistentComponent"] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("accepts a valid relationships.dependsOn entry that matches a real sibling record (Table -> Paginator/Scroller case)", () => {
    const paginator = { ...(valid() as Record<string, unknown>), name: "Paginator" };
    const scroller = { ...(valid() as Record<string, unknown>), name: "Scroller" };
    const table = { ...(valid() as Record<string, unknown>), name: "Table", relationships: { dependsOn: ["Paginator", "Scroller"] } };
    expect(validateComponentMetadata(table, [paginator, scroller, table]).valid).toBe(true);
  });

  it("rejects an accessibility block with an unrecognized extra key (strict mode)", () => {
    const record = { ...(valid() as Record<string, unknown>), accessibility: { verifiedRoles: ["row"], bogusKey: "surprise" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a relationships block with an unrecognized extra key (strict mode)", () => {
    const record = { ...(valid() as Record<string, unknown>), relationships: { bogusKey: "surprise" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a guidance block with an unrecognized extra key (strict mode)", () => {
    const record = { ...(valid() as Record<string, unknown>), guidance: { usageNotes: "Use for primary actions.", bogusKey: "surprise" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a PropFact with a wrong-type optional 'default' or 'description' field", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = { props: [{ name: "loading", type: "boolean", required: false, default: 42 }], events: [] };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects an EventFact with a wrong-type optional 'payloadDescription' field", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = {
      props: [],
      events: [{ semanticId: "sort-changed", frameworkName: "sortFieldChange", mechanism: "output", payloadDescription: 42 }],
    };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });
});
