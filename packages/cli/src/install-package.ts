import { spawn } from "node:child_process";

import { detectPackageManager, type PackageManager } from "./detect-package-manager.js";

export interface InstallResult {
  exitCode: number;
}

/** Install subcommand args (excluding the package name) per package manager. */
const INSTALL_ARGS: Record<PackageManager, string[]> = {
  npm: ["install"],
  yarn: ["add"],
  pnpm: ["add"],
};

/**
 * Installs `packageName` into the target project at `projectDir`, using
 * whichever package manager `detectPackageManager` resolves for that
 * project (spec §8.1 — the consumer project's package manager, never this
 * monorepo's own pnpm-only tooling).
 *
 * Invokes the resolved package manager via `child_process.spawn` with
 * array-form arguments only — never `exec`/a shell string — so an
 * unsanitized `packageName` can never be interpreted by a shell. This is
 * the only place in `@ultimate/cli` that shells out to a package manager.
 *
 * Resolves with the subprocess's real exit code (never swallowed); a
 * `null` exit code (e.g. the process was killed by a signal) is normalized
 * to `1` so callers always receive a definite non-zero/zero result.
 */
export function installPackage(projectDir: string, packageName: string): Promise<InstallResult> {
  const packageManager = detectPackageManager(projectDir);
  const args = [...INSTALL_ARGS[packageManager], packageName];

  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, args, {
      cwd: projectDir,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1 });
    });
  });
}
