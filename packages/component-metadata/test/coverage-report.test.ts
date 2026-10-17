import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentMetadata } from "@ultimate/component-schema";
import {
  coverageReport,
  exitCodeFor,
  parseArgs,
  NON_COMPONENT_SUBPATHS,
  shippedComponents,
  unlistedDirs,
} from "../scripts/coverage-report.mjs";
import { BUTTON_METADATA } from "../src/records/button";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../scripts/coverage-report.mjs");
const DIST = resolve(dirname(SCRIPT), "../dist/index.mjs");

const NONE = { ng: [], react: [], vue: [] };

// BUTTON_METADATA plus the accessibility and guidance facts it does not carry yet.
const COMPLETE: ComponentMetadata = {
  ...structuredClone(BUTTON_METADATA),
  accessibility: { verifiedRoles: ["button"] },
  guidance: { usageNotes: "Use for actions." },
};

describe("shippedComponents", () => {
  it("lists exports subpaths, excluding '.', './package.json' and non-component entries, normalised", () => {
    const names = shippedComponents({
      exports: {
        ".": {},
        "./package.json": "./package.json",
        "./button": {},
        "./radio-button": {},
        "./ripple": {},
        "./style-class": {},
      },
    });
    expect(names).toEqual(["button", "radiobutton"]);
  });

  it("excludes every entry of NON_COMPONENT_SUBPATHS", () => {
    const exports = Object.fromEntries([...NON_COMPONENT_SUBPATHS, "./badge"].map((s) => [s, {}]));
    const barrel = [...NON_COMPONENT_SUBPATHS]
      .filter((subpath) => subpath.startsWith("./") && subpath !== "./package.json")
      .map((subpath) => `export * from "${subpath}";`)
      .join("\n");
    expect(shippedComponents({ exports }, barrel)).toEqual(["badge"]);
  });

  it("includes components shipped only through the root barrel (ng button)", () => {
    const barrel = [
      'export * from "@ultimate/ng/badge";',
      'export * from "./button";',
      'export { UDialog } from "./dialog";',
      'export * from "./select-button";',
      'export * from "./ripple";',
    ].join("\n");
    const names = shippedComponents({ exports: { ".": {}, "./badge": {} } }, barrel);
    expect(names).toEqual(["badge", "button", "dialog", "selectbutton"]);
  });

  it("does not duplicate a component present in both exports and the barrel", () => {
    const names = shippedComponents(
      { exports: { "./card": {} } },
      'export * from "./card";\nexport * from "./card";'
    );
    expect(names).toEqual(["card"]);
  });
});

describe("unlistedDirs", () => {
  it("lists directories in neither the denominator nor the exclusions", () => {
    expect(
      unlistedDirs(["button", "ripple", "mystery", "radio-button"], ["button", "radiobutton"])
    ).toEqual(["mystery"]);
  });
});

describe("coverageReport", () => {
  it("lists a shipped component without a record as lacking record, skill and stories", () => {
    const { missing } = coverageReport({
      shipped: ["button", "badge"],
      records: [COMPLETE],
      skills: ["button"],
      stories: { ng: ["button"], react: ["button"], vue: ["button"] },
    });
    const badge = missing.filter((entry) => entry.component === "badge");
    expect(badge.length).toBeGreaterThan(0);
    for (const entry of badge) expect(entry.lacks).toEqual(["record", "skill", "stories"]);
    expect(missing.some((entry) => entry.component === "button")).toBe(false);
  });

  it("reports per framework when shipped is keyed by framework", () => {
    const { missing } = coverageReport({
      shipped: { ng: ["badge"], react: [], vue: ["badge"] },
      records: [],
      skills: [],
      stories: { ng: ["badge"], react: [], vue: [] },
    });
    expect(missing).toEqual([
      { component: "badge", framework: "ng", lacks: ["record", "skill"] },
      { component: "badge", framework: "vue", lacks: ["record", "skill", "stories"] },
    ]);
  });

  it("lists guidance for a record without guidance", () => {
    const record: ComponentMetadata = structuredClone(COMPLETE);
    delete record.guidance;
    const { missing } = coverageReport({
      shipped: { ng: ["button"], react: [], vue: [] },
      records: [record],
      skills: ["button"],
      stories: { ng: ["button"], react: [], vue: [] },
    });
    expect(missing).toEqual([{ component: "button", framework: "ng", lacks: ["guidance"] }]);
  });

  it("lists accessibility for a record without accessibility", () => {
    const record: ComponentMetadata = structuredClone(COMPLETE);
    delete record.accessibility;
    const { missing } = coverageReport({
      shipped: { ng: ["button"], react: [], vue: [] },
      records: [record],
      skills: ["button"],
      stories: { ng: ["button"], react: [], vue: [] },
    });
    expect(missing).toEqual([{ component: "button", framework: "ng", lacks: ["accessibility"] }]);
  });

  it("lists api only for the framework whose api entry is absent", () => {
    const record: ComponentMetadata = structuredClone(COMPLETE);
    delete record.api?.vue;
    const { missing } = coverageReport({
      shipped: { ng: ["button"], react: ["button"], vue: ["button"] },
      records: [record],
      skills: ["button"],
      stories: { ng: ["button"], react: ["button"], vue: ["button"] },
    });
    expect(missing).toEqual([{ component: "button", framework: "vue", lacks: ["api"] }]);
  });

  it("matches record names case-insensitively with hyphens stripped", () => {
    const record: ComponentMetadata = { ...structuredClone(COMPLETE), name: "RadioButton" };
    const { missing } = coverageReport({
      shipped: { ng: ["radiobutton"], react: [], vue: [] },
      records: [record],
      skills: ["radiobutton"],
      stories: { ng: ["radiobutton"], react: [], vue: [] },
    });
    expect(missing).toEqual([]);
  });

  it("reports nothing when everything is covered", () => {
    expect(
      coverageReport({ shipped: NONE, records: [], skills: [], stories: NONE }).missing
    ).toEqual([]);
  });
});

describe("exit codes", () => {
  const some = { missing: [{ component: "badge", framework: "ng", lacks: ["record"] }] };

  it("report mode exits 0 even with missing entries", () => {
    expect(exitCodeFor(some, parseArgs([]))).toBe(0);
  });

  it("--enforce exits 1 when missing is non-empty and 0 when empty", () => {
    expect(exitCodeFor(some, parseArgs(["--enforce"]))).toBe(1);
    expect(exitCodeFor({ missing: [] }, parseArgs(["--enforce"]))).toBe(0);
  });

  it("rejects an unknown flag", () => {
    expect(() => parseArgs(["--bogus"])).toThrow(/unknown/i);
  });

  it("the CLI exits 2 with usage on an unknown flag", () => {
    const result = spawnSync(process.execPath, [SCRIPT, "--bogus"], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/usage/i);
  });

  it.skipIf(!existsSync(DIST))("the CLI exits 0 in report mode against the repository", () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/ng/);
  });

  it.skipIf(!existsSync(DIST))("the CLI --enforce exits 1 while gaps remain", () => {
    const result = spawnSync(process.execPath, [SCRIPT, "--enforce"], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/FAILED/);
  });
});
