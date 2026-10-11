// scripts/provenance/installed-cli-mcp-smoke.mjs
//
// GAP-131 installed-package smoke harness (Spec
// docs/superpowers/specs/2026-10-11-gap-131-installed-compatibility-manifest-design.md
// §6.2). Packs @ultimate/cli, @ultimate/mcp and the packages their commands
// install, installs them into Angular, React and Vue pnpm consumers, and runs
// the published binaries. pnpm only (OQ-1). The bare-name override behaviour
// is probed before it is relied on (OQ-2).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPackageDependenciesFromDisk,
  packageRoot,
  packOne,
  toScopedName,
  topologicalSort,
} from "./pack-install-integrity.mjs";
import { getTransitiveClosure } from "./workspace-graph.mjs";

export const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");

export const CONSUMERS = [
  {
    framework: "angular",
    frameworkPackage: "@ultimate/ng",
    mcpVersion: "21.2.22",
    dependencies: {
      "@angular/common": "^21.2.22",
      "@angular/core": "^21.2.22",
      "@angular/forms": "^21.2.22",
      "@angular/platform-browser": "^21.2.22",
      "@angular/router": "^21.2.22",
      "@angular/cdk": "^21.0.0",
      rxjs: "^7.8.1",
    },
  },
  {
    framework: "react",
    frameworkPackage: "@ultimate/react",
    mcpVersion: "18.3.1",
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
  },
  {
    framework: "vue",
    frameworkPackage: "@ultimate/vue",
    mcpVersion: "3.5.13",
    dependencies: { vue: "^3.5.13" },
  },
];

/** Packages the consumers depend on directly or that CLI commands install. */
export const SMOKE_ROOTS = [
  "@ultimate/cli",
  "@ultimate/mcp",
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
  "@ultimate/uix-utils",
];

export function buildConsumerPackageJson(consumer, tarballByName) {
  const overrides = {};
  for (const [name, tarball] of tarballByName) overrides[name] = `file:${tarball}`;
  return {
    name: `gap-131-smoke-${consumer.framework}`,
    version: "1.0.0",
    private: true,
    dependencies: {
      ...consumer.dependencies,
      "@ultimate/cli": `file:${tarballByName.get("@ultimate/cli")}`,
      "@ultimate/mcp": `file:${tarballByName.get("@ultimate/mcp")}`,
    },
    pnpm: { overrides },
  };
}

/** Packs every member of the union closure of SMOKE_ROOTS, dependencies first. */
export function packSmokeMembers(packDestDir) {
  const members = new Set();
  for (const root of SMOKE_ROOTS) {
    members.add(root);
    for (const dep of getTransitiveClosure(root)) members.add(toScopedName(dep));
  }
  const sorted = topologicalSort([...members], getPackageDependenciesFromDisk);
  const tarballByName = new Map();
  for (const member of sorted) tarballByName.set(member, packOne(member, packDestDir));
  return tarballByName;
}

/** Creates and installs one consumer. Installs WITH a lockfile (Spec §6.2, AC-8). */
export function createConsumer(parentDir, consumer, tarballByName) {
  const consumerDir = join(parentDir, consumer.framework);
  mkdirSync(consumerDir);
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(buildConsumerPackageJson(consumer, tarballByName), null, 2)
  );
  execFileSync("pnpm", ["install"], { cwd: consumerDir, stdio: "inherit" });
  if (!existsSync(join(consumerDir, "pnpm-lock.yaml"))) {
    throw new Error(
      `AC-8: ${consumer.framework} consumer has no pnpm-lock.yaml; the CLI would fall back to npm`
    );
  }
  return consumerDir;
}

/**
 * OQ-2: verifies that `pnpm add <bare name>` (the CLI's install form,
 * packages/cli/src/install-package.ts) resolves an unpublished @ultimate
 * package through pnpm.overrides instead of the registry.
 */
export function probeOverride(consumerDir) {
  const name = "@ultimate/uix-utils";
  const result = spawnSync("pnpm", ["add", name], { cwd: consumerDir, encoding: "utf8" });
  const installed = join(consumerDir, "node_modules", "@ultimate", "uix-utils", "package.json");
  const expectedVersion = JSON.parse(
    readFileSync(join(packageRoot(name), "package.json"), "utf8")
  ).version;
  const ok =
    result.status === 0 &&
    existsSync(installed) &&
    JSON.parse(readFileSync(installed, "utf8")).version === expectedVersion;
  if (!ok) {
    throw new Error(
      `OQ-2: pnpm add ${name} did not resolve through pnpm.overrides (exit ${result.status}).\n` +
        `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
}

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

if (isMainModule() && process.argv.includes("--probe-only")) {
  const packDir = mkdtempSync(join(tmpdir(), "gap-131-pack-"));
  const workDir = mkdtempSync(join(tmpdir(), "gap-131-consumers-"));
  try {
    const tarballs = packSmokeMembers(packDir);
    const consumerDir = createConsumer(workDir, CONSUMERS[1], tarballs);
    probeOverride(consumerDir);
    console.log("[installed-smoke] OQ-2 probe OK: bare pnpm add resolved through pnpm.overrides");
  } catch (error) {
    console.error(`[installed-smoke] ${error.message}`);
    process.exitCode = 1;
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  }
}
