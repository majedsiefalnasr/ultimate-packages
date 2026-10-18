import { afterEach, describe, it, expect, vi } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ComponentMetadata } from "@ultimate/component-schema";
import {
  applyExclusions,
  collectDrift,
  diffApi,
  driftProblems,
  extractApi,
  extractSources,
  readExclusions,
  readSourceMap,
  runDriftCheck,
} from "../scripts/check-api-drift.mjs";
import sourceMap from "../scripts/source-map.json";
import { BUTTON_METADATA } from "../src/records/button";
import { ALL_COMPONENTS } from "../src/index";

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
      { framework: "react", kind: "missing-in-source", apiKind: "prop", name: "ghostProp" },
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
      { framework: "react", kind: "missing-in-record", apiKind: "prop", name: "unrecordedProp" },
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

describe("diffApi apiKind", () => {
  it("tags an event mismatch with apiKind event", () => {
    const seeded: ComponentMetadata = structuredClone(BUTTON_METADATA);
    seeded.api?.vue?.events.push({
      semanticId: "ghost",
      frameworkName: "ghost-event",
      mechanism: "emit",
    });
    expect(diffApi(seeded, extractSources(sourceMap.Button))).toEqual([
      { framework: "vue", kind: "missing-in-source", apiKind: "event", name: "ghost-event" },
    ]);
  });
});

describe("applyExclusions (Spec W2-B4-R3 Amendment A1)", () => {
  const COMPONENTS = ["Dialog", "Table"];
  const afterHide = {
    component: "Dialog",
    framework: "vue",
    kind: "missing-in-record",
    apiKind: "event",
    name: "after-hide",
  };
  const exclusion = (overrides: Record<string, unknown> = {}) => ({
    component: "Dialog",
    framework: "vue",
    apiKind: "event",
    name: "after-hide",
    rationale: "Deliberately unmodeled (YAGNI).",
    source: "packages/component-metadata/src/records/dialog.ts:46-53",
    ...overrides,
  });

  it("suppresses exactly its own item and keeps every other problem", () => {
    const other = { ...afterHide, name: "role", apiKind: "prop" };
    expect(applyExclusions([afterHide, other], [exclusion()], COMPONENTS)).toEqual({
      remaining: [other],
      stale: [],
      invalid: [],
    });
  });

  it("does not suppress the same name under a different component, framework or apiKind", () => {
    const sameNameElsewhere = [
      { ...afterHide, component: "Table" },
      { ...afterHide, framework: "ng" },
      { ...afterHide, apiKind: "prop" },
    ];
    const result = applyExclusions(sameNameElsewhere, [exclusion()], COMPONENTS);
    expect(result.remaining).toEqual(sameNameElsewhere);
    expect(result.stale).toEqual([exclusion()]);
    expect(result.invalid).toEqual([]);
  });

  it("never suppresses a missing-in-source item", () => {
    const missingInSource = { ...afterHide, kind: "missing-in-source" };
    const result = applyExclusions([missingInSource], [exclusion()], COMPONENTS);
    expect(result.remaining).toEqual([missingInSource]);
    expect(result.stale).toEqual([exclusion()]);
  });

  it("never suppresses a structural problem", () => {
    const structural = { component: "Dialog", kind: "no-entry" };
    const result = applyExclusions([structural], [exclusion()], COMPONENTS);
    expect(result.remaining).toEqual([structural]);
    expect(result.stale).toEqual([exclusion()]);
  });

  it("reports an exclusion that matches no current drift item as stale", () => {
    expect(applyExclusions([], [exclusion()], COMPONENTS)).toEqual({
      remaining: [],
      stale: [exclusion()],
      invalid: [],
    });
  });

  it.each([
    ["an unknown component", exclusion({ component: "Ghost" }), /unknown component "Ghost"/],
    ["an unknown framework", exclusion({ framework: "svelte" }), /unknown framework "svelte"/],
    ["an unknown apiKind", exclusion({ apiKind: "slot" }), /unknown apiKind "slot"/],
    [
      "a missing field",
      { ...exclusion(), rationale: undefined },
      /"rationale" must be a non-empty string/,
    ],
    ["an empty field", exclusion({ source: "" }), /"source" must be a non-empty string/],
    ["an unexpected field", exclusion({ kind: "missing-in-source" }), /unexpected field "kind"/],
    ["a wildcard name", exclusion({ name: "*" }), /wildcard/],
    ["a wildcard component", exclusion({ component: "Dia*" }), /wildcard/],
    [
      "a source without file:line or ADR",
      exclusion({ source: "dialog.ts" }),
      /file:line or an ADR/,
    ],
    ["a non-object entry", "Dialog vue after-hide", /must be an object/],
  ])("rejects %s as invalid without suppressing anything", (_label, entry, message) => {
    const result = applyExclusions([afterHide], [entry], COMPONENTS);
    expect(result.remaining).toEqual([afterHide]);
    expect(result.stale).toEqual([]);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0]).toMatch(message);
  });

  it("accepts an ADR citation as a source", () => {
    const result = applyExclusions([afterHide], [exclusion({ source: "ADR-058" })], COMPONENTS);
    expect(result).toEqual({ remaining: [], stale: [], invalid: [] });
  });

  it("rejects a duplicate entry, so one entry suppresses one item", () => {
    const result = applyExclusions([afterHide], [exclusion(), exclusion()], COMPONENTS);
    expect(result.remaining).toEqual([]);
    expect(result.invalid).toEqual([
      "exclusion #2 (Dialog vue event after-hide): duplicates an earlier entry",
    ]);
  });
});

describe("runDriftCheck with exclusions", () => {
  afterEach(() => vi.restoreAllMocks());

  // Button's real React source declares `label`; dropping it from the record
  // seeds one missing-in-record prop item.
  function buttonWithoutLabel(): ComponentMetadata {
    const seeded: ComponentMetadata = structuredClone(BUTTON_METADATA);
    if (seeded.api?.react)
      seeded.api.react.props = seeded.api.react.props.filter((p) => p.name !== "label");
    return seeded;
  }
  const labelExclusion = {
    component: "Button",
    framework: "react",
    apiKind: "prop",
    name: "label",
    rationale: "Seeded test exclusion.",
    source: "packages/component-metadata/src/records/button.ts:1",
  };

  it("exits 0 when the only mismatch is excluded", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(
      runDriftCheck([buttonWithoutLabel()], { Button: sourceMap.Button }, [labelExclusion])
    ).toBe(0);
    expect(log).toHaveBeenCalledWith(
      "[drift] OK: 1 record(s) match their sources (1 documented exclusion(s) applied)"
    );
  });

  it("exits 1 on an unexcluded mismatch", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(runDriftCheck([buttonWithoutLabel()], { Button: sourceMap.Button }, [])).toBe(1);
    expect(error.mock.calls.map(([line]) => line)).toEqual([
      "[drift] Button react missing-in-record: label",
      "[drift] FAILED: 1 problem(s)",
    ]);
  });

  it("exits 1 on a stale exclusion and on an invalid one", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const invalid = { ...labelExclusion, framework: "svelte" };
    expect(
      runDriftCheck([BUTTON_METADATA], { Button: sourceMap.Button }, [labelExclusion, invalid])
    ).toBe(1);
    expect(error.mock.calls.map(([line]) => line)).toEqual([
      "[drift] stale exclusion Button react prop label: matches no missing-in-record item",
      '[drift] exclusion #2 (Button svelte prop label): unknown framework "svelte"',
      "[drift] FAILED: 2 problem(s)",
    ]);
  });

  it("collectDrift returns structured items with their component", () => {
    expect(collectDrift([buttonWithoutLabel()], { Button: sourceMap.Button })).toEqual([
      {
        component: "Button",
        framework: "react",
        kind: "missing-in-record",
        apiKind: "prop",
        name: "label",
      },
    ]);
  });
});

describe("the committed records and exclusion list", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pass the drift check: every mismatch is fixed or explicitly, validly excluded", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(runDriftCheck(ALL_COMPONENTS, readSourceMap(), readExclusions())).toBe(0);
    expect(error).not.toHaveBeenCalled();
  });
});
