import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { detectFramework } from "../detect-framework.js";
import { matchCompatibility, type CompatibilityEntry } from "../compatibility.js";
import { installPackage } from "../install-package.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Walks upward from `startDir` until a directory containing `marker` is
 * found, returning that directory. Used to locate `packages/cli`'s own
 * root (identified by its `package.json`) without hardcoding a fixed
 * `../..`-depth that would silently break if this module's location
 * relative to `packages/cli/` ever changes — e.g. tsup bundles an entry
 * point (such as `bin.ts`) into a single flat file, so a module imported
 * from `src/commands/init.ts` at test-time may end up co-located directly
 * under `dist/` (one level shallower) once bundled. Throws if `marker` is
 * never found before reaching the filesystem root.
 */
function findUp(startDir: string, marker: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, marker))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`init: could not locate "${marker}" above ${startDir}`);
    }
    dir = parent;
  }
}

/** `packages/cli`'s own package root, identified by its `package.json`. */
const CLI_PACKAGE_ROOT = findUp(__dirname, "package.json");

/** This package's own `package.json`, read for `cliVersion` (spec §6.5). */
const CLI_PACKAGE_JSON_PATH = join(CLI_PACKAGE_ROOT, "package.json");

/**
 * Repo-root-relative location of the compatibility manifest (spec §6.4).
 * `packages/cli`'s own root is two levels under the repo root
 * (`packages/cli/`), which holds regardless of whether this module runs
 * from its source location (`src/commands/init.ts`) or a tsup-bundled
 * output (e.g. inlined into `dist/bin.mjs`) — both are located via
 * `findUp` from `package.json`, not a hardcoded traversal depth from
 * `__dirname` itself.
 */
const MANIFEST_PATH = join(
  CLI_PACKAGE_ROOT,
  "..",
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json",
);

export interface InitResult {
  exitCode: number;
  message: string;
}

interface FrameworkPackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Framework -> the package.json dependency name that carries its version. */
const FRAMEWORK_DEPENDENCY_NAMES: Record<"angular" | "react" | "vue", string> = {
  angular: "@angular/core",
  react: "react",
  vue: "vue",
};

/**
 * Strips a leading semver range operator (`^`, `~`, `>=`, etc.) from a
 * `package.json` dependency version string, leaving a plain `x.y.z` that
 * `matchCompatibility` can parse. `package.json` dependency versions are
 * conventionally range specifiers, not plain versions, so this conversion
 * is required before calling the resolver.
 */
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

/**
 * Implements `ultimate init` per spec §7.1: an **existing-project-only**
 * command that detects the target's framework, validates compatibility via
 * the manifest (Task 1) + resolver (Task 6), installs the resolved
 * `@ultimate/*` framework package (via `installPackage`, this task's own
 * shared infrastructure), and writes `ultimate.config.json` — in that exact
 * order, never scaffolding a new project on the target's behalf.
 */
export async function runInit(projectDir: string): Promise<InitResult> {
  // Step 1: detect/validate framework.
  const framework = detectFramework(projectDir);
  if (framework === null) {
    return {
      exitCode: 1,
      message:
        "init requires an existing, already-scaffolded Angular/React/Vue project " +
        "(an angular.json or a recognizable framework dependency in package.json). " +
        "Creating a new project is not supported by init — use `ultimate create` instead.",
    };
  }

  const packageJsonPath = join(projectDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as FrameworkPackageJsonShape;
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const frameworkVersion = toPlainVersion(dependencies[FRAMEWORK_DEPENDENCY_NAMES[framework]] ?? "");

  // Step 2: resolve the compatible Ultimate framework package.
  const manifest = readManifest();
  const cliVersion = readCliVersion();
  const result = matchCompatibility({ framework, frameworkVersion, cliVersion }, manifest);

  if (!result.matched) {
    return {
      exitCode: 1,
      message: `init: no compatible Ultimate package found for this project (${result.reason}).`,
    };
  }

  const ultimatePackageName = result.entry.ultimateFrameworkPackage.name;

  // Step 3: install the resolved package.
  const installResult = await installPackage(projectDir, ultimatePackageName);
  if (installResult.exitCode !== 0) {
    return {
      exitCode: installResult.exitCode,
      message: `init: failed to install ${ultimatePackageName} (exit code ${installResult.exitCode}).`,
    };
  }

  // Step 4: create/update ultimate.config.json.
  const config = {
    framework,
    ultimatePackage: ultimatePackageName,
    themePreset: null,
  };
  writeFileSync(join(projectDir, "ultimate.config.json"), `${JSON.stringify(config, null, 2)}\n`, "utf-8");

  return {
    exitCode: 0,
    message: `init: installed ${ultimatePackageName} and wrote ultimate.config.json.`,
  };
}
