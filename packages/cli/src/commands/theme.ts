import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { detectFramework } from "../detect-framework.js";
import { matchCompatibility, type CompatibilityEntry } from "../compatibility.js";
import { installPackage } from "../install-package.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Mirrors `init.ts`'s own `findUp` exactly (see `add.ts` for rationale). */
function findUp(startDir: string, marker: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, marker))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`theme: could not locate "${marker}" above ${startDir}`);
    }
    dir = parent;
  }
}

const CLI_PACKAGE_ROOT = findUp(__dirname, "package.json");
const CLI_PACKAGE_JSON_PATH = join(CLI_PACKAGE_ROOT, "package.json");
const MANIFEST_PATH = join(CLI_PACKAGE_ROOT, "..", "..", "docs", "architecture", "compatibility-manifest.json");

/**
 * The only currently-valid preset name (spec §7.1 / this task's brief):
 * `@ultimate/themes` ships exactly one preset, `auraPreset`, mapped to the
 * literal string `"aura"`. Read from this single constant so `theme` does
 * not silently drift if a second preset is ever added to `@ultimate/themes`
 * later — v1 does not invent a preset-discovery mechanism.
 */
const VALID_PRESETS = ["aura"] as const;
type ValidPreset = (typeof VALID_PRESETS)[number];

const THEMES_PACKAGE_NAME = "@ultimate/themes";

export interface ThemeResult {
  exitCode: number;
  message: string;
}

interface ProjectPackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const FRAMEWORK_DEPENDENCY_NAMES: Record<"angular" | "react" | "vue", string> = {
  angular: "@angular/core",
  react: "react",
  vue: "vue",
};

function toPlainVersion(rangeOrVersion: string): string {
  const match = /(\d+\.\d+\.\d+)/.exec(rangeOrVersion);
  return match ? match[1] : rangeOrVersion;
}

function readCliVersion(): string {
  const raw = readFileSync(CLI_PACKAGE_JSON_PATH, "utf-8");
  const parsed = JSON.parse(raw) as { version: string };
  return parsed.version;
}

function readManifest(): CompatibilityEntry[] {
  const raw = readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw) as CompatibilityEntry[];
}

function isValidPreset(preset: string): preset is ValidPreset {
  return (VALID_PRESETS as readonly string[]).includes(preset);
}

/** The exact snippet `theme` writes/ensures is present in the theme-entry file. */
const THEME_ENTRY_SNIPPET = 'import { applyUltimateTheme } from "@ultimate/themes";\napplyUltimateTheme();\n';

/**
 * Writes (creating if absent) `THEME_ENTRY_SNIPPET` into the theme-entry
 * file, inserting only if the file doesn't already contain the
 * `applyUltimateTheme()` call (idempotent re-run, per this task's brief).
 */
function ensureThemeEntryFile(filePath: string): void {
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, "utf-8");
    if (existing.includes("applyUltimateTheme()")) {
      return;
    }
    writeFileSync(filePath, `${existing}\n${THEME_ENTRY_SNIPPET}`, "utf-8");
    return;
  }
  writeFileSync(filePath, THEME_ENTRY_SNIPPET, "utf-8");
}

/**
 * Implements `ultimate theme <preset>` per spec §7.1 and this task's brief:
 * validates the preset name against the single real preset `@ultimate/themes`
 * ships (`"aura"`), runs the same compatibility check `init`/`add` run,
 * installs `@ultimate/themes` only if not already a target dependency (via
 * `installPackage`, Task 5's own module), updates `ultimate.config.json`
 * (same shape/file `init` writes) with `themePreset: "aura"`, and writes a
 * dedicated `ultimate-theme.ts`/`.js` entry file — never editing the
 * target's own bootstrap file. Does not compile CSS itself; that is
 * `applyUltimateTheme()`'s own responsibility entirely.
 */
export async function runTheme(projectDir: string, preset: string): Promise<ThemeResult> {
  // Step 1: validate the preset name before doing anything else - no
  // partial write of any kind occurs on this path.
  if (!isValidPreset(preset)) {
    return {
      exitCode: 1,
      message: `theme: unknown preset "${preset}" - the only valid preset in v1 is "aura".`,
    };
  }

  // Step 2: detect/validate framework + compatibility (same refusal as init/add).
  const framework = detectFramework(projectDir);
  if (framework === null) {
    return {
      exitCode: 1,
      message:
        "theme requires an existing, already-scaffolded Angular/React/Vue project " +
        "(an angular.json or a recognizable framework dependency in package.json).",
    };
  }

  const packageJsonPath = join(projectDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as ProjectPackageJsonShape;
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const frameworkVersion = toPlainVersion(dependencies[FRAMEWORK_DEPENDENCY_NAMES[framework]] ?? "");

  const manifest = readManifest();
  const cliVersion = readCliVersion();
  const result = matchCompatibility({ framework, frameworkVersion, cliVersion }, manifest);

  if (!result.matched) {
    return {
      exitCode: 1,
      message: `theme: no compatible Ultimate package found for this project (${result.reason}).`,
    };
  }

  // Step 3: install @ultimate/themes only if not already present.
  const themesAlreadyPresent = THEMES_PACKAGE_NAME in dependencies;
  if (!themesAlreadyPresent) {
    const installResult = await installPackage(projectDir, THEMES_PACKAGE_NAME);
    if (installResult.exitCode !== 0) {
      return {
        exitCode: installResult.exitCode,
        message: `theme: failed to install ${THEMES_PACKAGE_NAME} (exit code ${installResult.exitCode}).`,
      };
    }
  }

  // Step 4: update ultimate.config.json (same file/shape init writes).
  const configPath = join(projectDir, "ultimate.config.json");
  const existingConfig = existsSync(configPath)
    ? (JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>)
    : { framework, ultimatePackage: result.entry.ultimateFrameworkPackage.name, themePreset: null };
  const updatedConfig = { ...existingConfig, themePreset: preset };
  writeFileSync(configPath, `${JSON.stringify(updatedConfig, null, 2)}\n`, "utf-8");

  // Step 5: write the dedicated theme-entry file (never the target's own
  // bootstrap file), .ts if the target has a root tsconfig.json, else .js.
  const hasTsConfig = existsSync(join(projectDir, "tsconfig.json"));
  const themeEntryFileName = hasTsConfig ? "ultimate-theme.ts" : "ultimate-theme.js";
  ensureThemeEntryFile(join(projectDir, themeEntryFileName));

  return {
    exitCode: 0,
    message:
      `theme: applied the "aura" preset. Import "./${themeEntryFileName.replace(/\.(ts|js)$/, "")}" ` +
      "once, before mounting any Ultimate component.",
  };
}
