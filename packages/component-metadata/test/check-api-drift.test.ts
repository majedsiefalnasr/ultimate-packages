import { afterEach, describe, it, expect, vi } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ComponentMetadata } from "@ultimate/component-schema";
import {
  diffApi,
  driftProblems,
  extractApi,
  extractSources,
  runDriftCheck,
} from "../scripts/check-api-drift.mjs";
import sourceMap from "../scripts/source-map.json";
import { BUTTON_METADATA } from "../src/records/button";

function writeFixture(fileName: string, contents: string): string {
  const path = join(mkdtempSync(join(tmpdir(), "api-drift-")), fileName);
  writeFileSync(path, contents);
  return path;
}

describe("diffApi against the real Button sources", () => {
  it("returns [] for the Button record, excluding React's inherited ButtonHTMLAttributes", () => {
    const extracted = extractSources(sourceMap.Button);
    expect(extracted.react.props).not.toContain("onClick");
    expect(extracted.react.props).not.toContain("type");
    expect(diffApi(BUTTON_METADATA, extracted)).toEqual([]);
  });

  it("reports a record prop the source does not declare as missing-in-source", () => {
    const seeded: ComponentMetadata = structuredClone(BUTTON_METADATA);
    seeded.api?.react?.props.push({ name: "ghostProp", type: "string", required: false });
    expect(diffApi(seeded, extractSources(sourceMap.Button))).toEqual([
      { framework: "react", kind: "missing-in-source", name: "ghostProp" },
    ]);
  });
});

describe("extractApi on seeded source fixtures", () => {
  it("reports a source prop the record does not declare as missing-in-record", () => {
    const fixture = writeFixture(
      "button.tsx",
      [
        "import * as React from 'react';",
        "export interface UButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {",
        "  label?: string;",
        "  unrecordedProp?: boolean;",
        "}",
      ].join("\n")
    );
    const record: ComponentMetadata = structuredClone(BUTTON_METADATA);
    if (record.api?.react)
      record.api.react.props = [{ name: "label", type: "string", required: false }];
    expect(diffApi(record, { react: extractApi("react", fixture) })).toEqual([
      { framework: "react", kind: "missing-in-record", name: "unrecordedProp" },
    ]);
  });

  it("ng: reads input/input.required/model fields as props, honours alias, and drops native passthrough outputs", () => {
    const fixture = writeFixture(
      "thing.ts",
      [
        "export class UThing {",
        "  label = input<string>();",
        "  id = input.required<string>();",
        "  value = model(0);",
        "  inner = input(false, { alias: 'uThing' });",
        "  onClick = output<MouseEvent>();",
        "  onShow = output<void>();",
        "  helper = computed(() => 1);",
        "}",
      ].join("\n")
    );
    expect(extractApi("ng", fixture)).toEqual({
      props: ["label", "id", "value", "uThing"],
      events: ["onShow"],
    });
  });

  it("react: treats on* members as callback-prop events and includes extended same-file interfaces", () => {
    const fixture = writeFixture(
      "thing.tsx",
      [
        "interface UThingBase { base?: string }",
        "export interface UThingProps extends UThingBase, Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {",
        "  label?: string;",
        "  onChange?: (value: string) => void;",
        "}",
      ].join("\n")
    );
    expect(extractApi("react", fixture)).toEqual({
      props: ["label", "base"],
      events: ["onChange"],
    });
  });

  it("vue: reads props/emits keys from defineComponent and .vue default exports, dropping native passthrough emits", () => {
    const base = writeFixture(
      "base-thing.ts",
      "export const B = defineComponent({ props: { label: { type: String } }, emits: ['page'] });"
    );
    const sfc = writeFixture(
      "Thing.vue",
      [
        "<template><div /></template>",
        "<script>",
        "export default { props: { lazy: Boolean }, emits: { 'lazy-load': null, focus: null } };",
        "</script>",
      ].join("\n")
    );
    expect(extractApi("vue", base)).toEqual({ props: ["label"], events: ["page"] });
    expect(extractApi("vue", sfc)).toEqual({ props: ["lazy"], events: ["lazy-load"] });
  });

  it("vue: reads a directive's *BindingValue interface as its props", () => {
    const fixture = writeFixture(
      "thing.ts",
      "export interface ThingBindingValue { value: string; disabled?: boolean }"
    );
    expect(extractApi("vue", fixture)).toEqual({ props: ["value", "disabled"], events: [] });
  });
});

describe("extractApi rejects Vue options it cannot read", () => {
  const vueFixture = (options: string) =>
    writeFixture("thing.ts", `export const T = defineComponent({ name: "UThing", ${options} });`);

  it("throws, naming the file and component, when props is an identifier", () => {
    const fixture = vueFixture("props: sharedProps");
    expect(() => extractApi("vue", fixture)).toThrow(
      `[drift] \`props\` of UThing in ${fixture} is not an object or array literal`
    );
  });

  it("throws, naming the file and component, when emits is a call", () => {
    const fixture = vueFixture("emits: makeEmits()");
    expect(() => extractApi("vue", fixture)).toThrow(
      `[drift] \`emits\` of UThing in ${fixture} is not an object or array literal`
    );
  });

  it("throws on a spread in an object-literal props initializer", () => {
    const fixture = vueFixture("props: { ...sharedProps, label: String }");
    expect(() => extractApi("vue", fixture)).toThrow(
      `[drift] spread in \`props\` of UThing in ${fixture} cannot be read`
    );
  });

  it("throws on a spread in an array-literal emits initializer", () => {
    const fixture = writeFixture("thing.ts", "export default { emits: [...shared, 'page'] };");
    expect(() => extractApi("vue", fixture)).toThrow(
      `[drift] spread in \`emits\` of <unnamed component> in ${fixture} cannot be read`
    );
  });
});

describe("driftProblems and runDriftCheck", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports no problems and exits 0 for the Button record against its sources", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(runDriftCheck([BUTTON_METADATA], { Button: sourceMap.Button })).toBe(0);
    expect(log).toHaveBeenCalledWith("[drift] OK: 1 record(s) match their sources");
  });

  it("reports an orphan source-map entry, a record without an entry and missing files", () => {
    const orphan = { ...structuredClone(BUTTON_METADATA), name: "Orphan" };
    const missing = { ...structuredClone(BUTTON_METADATA), name: "Missing" };
    expect(
      driftProblems([orphan, missing], {
        Ghost: sourceMap.Button,
        Missing: { ng: ["packages/ng/src/missing/missing.ts"] },
      })
    ).toEqual([
      "source-map.json entry Ghost has no metadata record",
      "Orphan: no source-map.json entry",
      "Missing: source file(s) not found: packages/ng/src/missing/missing.ts",
    ]);
  });

  it("prints each drift problem and exits 1", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const seeded: ComponentMetadata = structuredClone(BUTTON_METADATA);
    seeded.api?.react?.props.push({ name: "ghostProp", type: "string", required: false });
    expect(runDriftCheck([seeded], { Button: sourceMap.Button })).toBe(1);
    expect(error.mock.calls.map(([line]) => line)).toEqual([
      "[drift] Button react missing-in-source: ghostProp",
      "[drift] FAILED: 1 problem(s)",
    ]);
  });
});
