/**
 * F7 (gap-closing spec #167, ticket #174): every style registration name an
 * Ultimate component passes to `registerThemeVariables` defines its Aura
 * preset key's variables where the preset has one. The names are read from
 * the product source of each framework, so a new component is covered
 * without editing this file.
 *
 * BUILD-FRESHNESS NOTE: `@ultimate/uix-styled` resolves to its prebuilt
 * `dist/`; rebuild it before running this file after editing its `src/`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { StyleSheet, registerThemeVariables } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";

const packagesDir = join(process.cwd(), "..");
const NAME_PATTERN = /(?:componentName\s*(?::|=)|registerComponentStyle\()\s*"([^"]+)"/g;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx|vue)$/.test(file))
    .filter((file) => !/\.(spec|test|stories|d)\.[a-z]+$/.test(file))
    .map((file) => join(directory, file));
}

function registrationNames(framework: "ng" | "react" | "vue"): string[] {
  const names = new Set<string>();
  for (const file of sourceFiles(join(packagesDir, framework, "src"))) {
    for (const match of readFileSync(file, "utf8").matchAll(NAME_PATTERN)) {
      names.add(match[1]);
    }
  }
  return [...names].sort();
}

const auraKeys = new Set(Object.keys(auraPreset.components ?? {}));

function flatKey(name: string): string {
  return name.replaceAll("-", "");
}

function variablesCss(name: string): string {
  const sheet = new StyleSheet();
  registerThemeVariables(sheet, name);
  return sheet.get(`${name}-variables`)?.css ?? "";
}

describe("style registration names against Aura keys (F7)", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("finds the registration names of every framework", () => {
    expect(registrationNames("react").length).toBeGreaterThan(80);
    expect(registrationNames("ng").length).toBeGreaterThan(80);
    expect(registrationNames("vue").length).toBeGreaterThan(80);
  });

  it("defines the Aura variables for every React name whose flat key exists", () => {
    const missing = registrationNames("react").filter(
      (name) => auraKeys.has(flatKey(name)) && variablesCss(name) === ""
    );

    expect(missing).toEqual([]);
  });

  it("defines the flat key's variables for each hyphenated React name that has one", () => {
    const kebab = registrationNames("react").filter((name) => name.includes("-"));
    const withAuraKey = kebab.filter((name) => auraKeys.has(flatKey(name)));

    expect(withAuraKey.length).toBeGreaterThan(0);
    for (const name of withAuraKey) {
      expect(variablesCss(name), name).toContain(`--u-${flatKey(name)}-`);
    }
  });

  it.each(["ng", "vue"] as const)(
    "leaves %s registration unchanged: a name defines variables only when it is itself an Aura key",
    (framework) => {
      for (const name of registrationNames(framework)) {
        expect(variablesCss(name) !== "", name).toBe(auraKeys.has(name));
      }
    }
  );

  it.each(["ng", "vue"] as const)(
    "%s has no hyphenated name whose flattened form is an Aura key (nothing newly resolves)",
    (framework) => {
      const newlyResolved = registrationNames(framework).filter(
        (name) => name.includes("-") && auraKeys.has(flatKey(name))
      );

      expect(newlyResolved).toEqual([]);
    }
  );
});
