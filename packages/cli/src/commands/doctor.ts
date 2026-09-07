import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_COMPONENTS } from "@ultimate/component-metadata";

import { detectFramework, type Framework } from "../detect-framework.js";
import { matchCompatibility, type CompatibilityEntry } from "../compatibility.js";

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
      throw new Error(`doctor: could not locate "${marker}" above ${startDir}`);
    }
    dir = parent;
  }
}

const CLI_PACKAGE_ROOT = findUp(__dirname, "package.json");
const CLI_PACKAGE_JSON_PATH = join(CLI_PACKAGE_ROOT, "package.json");
const MANIFEST_PATH = join(
  CLI_PACKAGE_ROOT,
  "..",
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

const FRAMEWORK_DEPENDENCY_NAMES: Record<Framework, string> = {
  angular: "@angular/core",
  react: "react",
  vue: "vue",
};

/**
 * `detectFramework`/`matchCompatibility` use `"angular"`, but
 * `ComponentMetadata.packages` (spec §5/`@ultimate/component-schema`) keys
 * its per-framework entries as `"ng"` for Angular (matching the real
 * `@ultimate/ng` package directory name) - this is the one place that
 * mapping must be bridged.
 */
const FRAMEWORK_TO_METADATA_KEY: Record<Framework, "ng" | "react" | "vue"> = {
  angular: "ng",
  react: "react",
  vue: "vue",
};

interface ProjectPackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

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

export interface DoctorComponentReport {
  name: string;
  packageName: string | null;
  installed: boolean;
  compatibility: "compatible" | "incompatible" | "unknown";
  compatibilityReason: string | null;
}

export interface DoctorResult {
  exitCode: number;
  framework: Framework | null;
  components: DoctorComponentReport[];
  /** Always "8 of 8 known components reported" for the current ALL_COMPONENTS set - never a broader, inventory-wide count. */
  summaryLine: string;
  message: string;
}

/**
 * Implements `ultimate doctor` per spec §7.2: reads the real, currently
 * 8-record `ALL_COMPONENTS` export from `@ultimate/component-metadata`
 * (no fabrication), detects the target framework, and for each record
 * reports whether that framework's `packages.<key>.packageName` is present
 * in the target's `package.json` dependencies plus a `matchCompatibility`
 * status line. Always closes with an exact "8 of 8 known components
 * reported" line — never implying coverage beyond the real proof set.
 */
export function runDoctor(projectDir: string): DoctorResult {
  const totalComponents = ALL_COMPONENTS.length;
  const summaryLine = `${totalComponents} of ${totalComponents} known components reported`;

  const framework = detectFramework(projectDir);

  if (framework === null) {
    const components: DoctorComponentReport[] = ALL_COMPONENTS.map((component) => ({
      name: component.name,
      packageName: null,
      installed: false,
      compatibility: "unknown",
      compatibilityReason: "no supported framework detected in this project",
    }));

    return {
      exitCode: 1,
      framework: null,
      components,
      summaryLine,
      message: `doctor: no supported framework detected (Angular/React/Vue). ${summaryLine}.`,
    };
  }

  const packageJsonPath = join(projectDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as ProjectPackageJsonShape;
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const frameworkVersion = toPlainVersion(
    dependencies[FRAMEWORK_DEPENDENCY_NAMES[framework]] ?? ""
  );

  const manifest = readManifest();
  const cliVersion = readCliVersion();
  const compatibilityResult = matchCompatibility(
    { framework, frameworkVersion, cliVersion },
    manifest
  );

  const metadataKey = FRAMEWORK_TO_METADATA_KEY[framework];

  const components: DoctorComponentReport[] = ALL_COMPONENTS.map((component) => {
    const packageInfo = component.packages[metadataKey];
    const packageName = packageInfo?.packageName ?? null;
    const installed = packageName !== null && packageName in dependencies;

    return {
      name: component.name,
      packageName,
      installed,
      compatibility: compatibilityResult.matched ? "compatible" : "incompatible",
      compatibilityReason: compatibilityResult.matched ? null : compatibilityResult.reason,
    };
  });

  const installedCount = components.filter((component) => component.installed).length;

  return {
    exitCode: 0,
    framework,
    components,
    summaryLine,
    message: `doctor: ${installedCount} of ${totalComponents} known components installed for ${framework}. ${summaryLine}.`,
  };
}

/** Renders a `DoctorResult` as a human-readable stdout report (spec §7.2). */
export function formatDoctorReport(result: DoctorResult): string {
  const lines: string[] = [];
  lines.push(`Framework: ${result.framework ?? "none detected"}`);
  lines.push("");

  for (const component of result.components) {
    const installedLabel = component.installed ? "installed" : "missing";
    const compatibilityLabel =
      component.compatibility === "unknown"
        ? "unknown"
        : component.compatibility === "compatible"
          ? "compatible"
          : `incompatible (${component.compatibilityReason})`;
    lines.push(`- ${component.name}: ${installedLabel}, ${compatibilityLabel}`);
  }

  lines.push("");
  lines.push(result.summaryLine);

  return lines.join("\n");
}
