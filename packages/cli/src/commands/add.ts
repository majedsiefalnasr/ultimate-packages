import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { detectFramework } from "../detect-framework.js";
import { matchCompatibility, type CompatibilityEntry } from "../compatibility.js";
import { installPackage } from "../install-package.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Walks upward from `startDir` until a directory containing `marker` is
 * found. Mirrors `init.ts`'s own `findUp` exactly (kept as a private,
 * per-file copy rather than a shared helper module — the brief scopes this
 * task to `add`/`theme`/`doctor` only and introducing a new shared
 * infrastructure module is outside that scope; each command file staying
 * self-contained also matches `init.ts`'s own existing precedent).
 */
function findUp(startDir: string, marker: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, marker))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`add: could not locate "${marker}" above ${startDir}`);
    }
    dir = parent;
  }
}

const CLI_PACKAGE_ROOT = findUp(__dirname, "package.json");
const CLI_PACKAGE_JSON_PATH = join(CLI_PACKAGE_ROOT, "package.json");
const MANIFEST_PATH = join(CLI_PACKAGE_ROOT, "..", "..", "docs", "architecture", "compatibility-manifest.json");

export interface AddResult {
  exitCode: number;
  message: string;
}

interface FrameworkPackageJsonShape {
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

/**
 * Implements `ultimate add <package>` per spec §7.1: runs the same
 * framework-detection + compatibility check `init` runs (refusing exactly
 * as `init` does on any mismatch), then installs `packageName` via
 * `installPackage` (Task 5's own tested module — imported, never
 * reimplemented). `add`'s own exit code is always `installPackage`'s real
 * exit code, passed through verbatim — a failed install is never swallowed
 * as a false success.
 */
export async function runAdd(projectDir: string, packageName: string): Promise<AddResult> {
  // Step 1: detect/validate framework (same refusal as init).
  const framework = detectFramework(projectDir);
  if (framework === null) {
    return {
      exitCode: 1,
      message:
        "add requires an existing, already-scaffolded Angular/React/Vue project " +
        "(an angular.json or a recognizable framework dependency in package.json).",
    };
  }

  const packageJsonPath = join(projectDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as FrameworkPackageJsonShape;
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const frameworkVersion = toPlainVersion(dependencies[FRAMEWORK_DEPENDENCY_NAMES[framework]] ?? "");

  // Step 2: resolve compatibility (same refusal as init).
  const manifest = readManifest();
  const cliVersion = readCliVersion();
  const result = matchCompatibility({ framework, frameworkVersion, cliVersion }, manifest);

  if (!result.matched) {
    return {
      exitCode: 1,
      message: `add: no compatible Ultimate package found for this project (${result.reason}).`,
    };
  }

  // Step 3: install the requested package (exit code passed through as-is).
  const installResult = await installPackage(projectDir, packageName);
  if (installResult.exitCode !== 0) {
    return {
      exitCode: installResult.exitCode,
      message: `add: failed to install ${packageName} (exit code ${installResult.exitCode}).`,
    };
  }

  return {
    exitCode: 0,
    message: `add: installed ${packageName}.`,
  };
}
