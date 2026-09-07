import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Orchestrator/build-tool boundary verification (spec §4).
 *
 * `@ultimate/cli` is an orchestrator: it detects a consumer project's
 * framework and package manager, copies/generates component source, and
 * shells out to install a dependency. It must never grow into a build-tool
 * replacement (bundling, transpiling, or otherwise duplicating what
 * webpack/vite/esbuild/rollup/the framework compilers already do for the
 * consumer project), and its one subprocess call site must stay
 * injection-safe (array-form `spawn`, never a shell-interpreting `exec`).
 *
 * Both checks use Node's `fs` directly (no shell `grep` subprocess) so this
 * test stays hermetic and cross-platform, and both scan `src/` only —
 * `tsup.config.ts` legitimately imports `tsup`'s own `defineConfig` to
 * build this package, which is out of scope for a check about what the
 * *published CLI* imports.
 */

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));

const BUNDLER_PACKAGES = [
  "@angular/compiler",
  "@babel/core",
  "vite",
  "webpack",
  "rollup",
  "esbuild",
];

function walkTsFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("packages/cli boundary (spec §4: orchestrator, not a build-tool replacement)", () => {
  const srcFiles = walkTsFiles(SRC_DIR);

  it("scans a non-empty src/ tree (sanity check — a passing scan of zero files would prove nothing)", () => {
    expect(srcFiles.length).toBeGreaterThan(0);
  });

  it("never imports a bundler/compiler-class package from src/", () => {
    const violations: Array<{ file: string; pkgName: string }> = [];

    for (const file of srcFiles) {
      const content = readFileSync(file, "utf8");
      for (const pkgName of BUNDLER_PACKAGES) {
        const escaped = pkgName.replace(/[/]/g, "\\/");
        const importedFrom = new RegExp(`from\\s+["']${escaped}(["'/])`);
        const bareImport = new RegExp(`import\\s+["']${escaped}(["'/])`);
        const required = new RegExp(`require\\(["']${escaped}(["'/])`);
        const dynamicImport = new RegExp(`import\\(["']${escaped}(["'/])`);

        if (
          importedFrom.test(content) ||
          bareImport.test(content) ||
          required.test(content) ||
          dynamicImport.test(content)
        ) {
          violations.push({ file, pkgName });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("never invokes child_process.exec (the shell-interpreting variant) anywhere in src/", () => {
    // Literal substring match on exactly what the brief asks for. Kept
    // narrow so it can't accidentally flag `execSync`, `spawn`, or
    // unrelated identifiers ending in "exec".
    const forbiddenCall = ["child_process", ".", "exec", "("].join("");
    const violations = srcFiles.filter((file) =>
      readFileSync(file, "utf8").includes(forbiddenCall)
    );

    expect(violations).toEqual([]);
  });

  it("packages/cli/src/install-package.ts — the only file in this codebase that shells out — uses spawn exclusively", () => {
    const installPackagePath = join(SRC_DIR, "install-package.ts");
    expect(statSync(installPackagePath).isFile()).toBe(true);

    const content = readFileSync(installPackagePath, "utf8");
    expect(content).toMatch(/\bspawn\b/);
    expect(content).not.toContain("child_process.exec(");
    expect(content).not.toMatch(/\bexecSync\b/);
  });
});
