import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Framework = "angular" | "react" | "vue";

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Frameworks checked in priority order: the first match wins. */
const FRAMEWORK_PACKAGE_NAMES: ReadonlyArray<{ framework: Framework; packageName: string }> = [
  { framework: "angular", packageName: "@angular/core" },
  { framework: "react", packageName: "react" },
  { framework: "vue", packageName: "vue" },
];

/**
 * Detects which framework (Angular/React/Vue) a target project uses by
 * reading only that project's own `package.json` `dependencies` /
 * `devDependencies` — never guessing beyond what's declared.
 *
 * Returns `null` (never throws) when no known framework dependency is
 * found, or when `package.json` is missing or malformed. If more than one
 * framework dependency is present, the first match in priority order
 * (angular -> react -> vue) is returned.
 */
export function detectFramework(projectDir: string): Framework | null {
  const packageJsonPath = join(projectDir, "package.json");

  let packageJson: PackageJsonShape;
  try {
    const raw = readFileSync(packageJsonPath, "utf-8");
    packageJson = JSON.parse(raw) as PackageJsonShape;
  } catch {
    return null;
  }

  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  for (const { framework, packageName } of FRAMEWORK_PACKAGE_NAMES) {
    if (packageName in dependencies) {
      return framework;
    }
  }

  return null;
}
