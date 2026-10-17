import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { diffApi, extractApi, extractSources } from "../scripts/check-api-drift.mjs";
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
