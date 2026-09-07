import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "npm" | "yarn" | "pnpm";

/** Lockfiles checked in priority order: the first match wins. */
const LOCKFILE_PACKAGE_MANAGERS: ReadonlyArray<{
  lockfile: string;
  packageManager: PackageManager;
}> = [
  { lockfile: "pnpm-lock.yaml", packageManager: "pnpm" },
  { lockfile: "yarn.lock", packageManager: "yarn" },
  { lockfile: "package-lock.json", packageManager: "npm" },
];

/**
 * Detects which package manager a **target/consumer** project uses (spec
 * §8.1's disambiguation — this is never about this monorepo's own pnpm-only
 * dev tooling), by checking for that project's own lockfile.
 *
 * Checked in priority order: `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` ->
 * `yarn`, `package-lock.json` -> `npm`. Defaults to `npm` when none of the
 * three lockfiles is present, since npm is the only package manager
 * guaranteed present in any Node.js environment (bundled with Node itself).
 */
export function detectPackageManager(projectDir: string): PackageManager {
  for (const { lockfile, packageManager } of LOCKFILE_PACKAGE_MANAGERS) {
    if (existsSync(join(projectDir, lockfile))) {
      return packageManager;
    }
  }

  return "npm";
}
