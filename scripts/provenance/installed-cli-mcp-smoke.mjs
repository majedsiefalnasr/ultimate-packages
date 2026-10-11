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
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

export function mentionsManifestFailure(output) {
  return (
    /manifest_unreadable/.test(output) ||
    /(ENOENT|no such file)[^\n]*compatibility-manifest\.json/.test(output) ||
    /compatibility-manifest\.json[^\n]*(ENOENT|no such file)/.test(output)
  );
}

function runBin(consumerDir, bin, args) {
  const result = spawnSync(join(consumerDir, "node_modules", ".bin", bin), args, {
    cwd: consumerDir,
    encoding: "utf8",
  });
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function readDeps(consumerDir) {
  return JSON.parse(readFileSync(join(consumerDir, "package.json"), "utf8")).dependencies ?? {};
}

export function runCliChecks(consumerDir, consumer) {
  const results = [];
  const record = (check, ok, detail) => results.push({ check, ok, detail });

  const init = runBin(consumerDir, "ultimate", ["init"]);
  record(
    "init",
    init.status === 0 &&
      existsSync(join(consumerDir, "ultimate.config.json")) &&
      consumer.frameworkPackage in readDeps(consumerDir),
    init.output
  );

  const add = runBin(consumerDir, "ultimate", ["add", "@ultimate/uix-utils"]);
  record(
    "add @ultimate/uix-utils",
    add.status === 0 && "@ultimate/uix-utils" in readDeps(consumerDir),
    add.output
  );

  const theme = runBin(consumerDir, "ultimate", ["theme", "aura"]);
  record(
    "theme aura",
    theme.status === 0 &&
      "@ultimate/themes" in readDeps(consumerDir) &&
      (existsSync(join(consumerDir, "ultimate-theme.ts")) ||
        existsSync(join(consumerDir, "ultimate-theme.js"))),
    theme.output
  );

  const doctor = runBin(consumerDir, "ultimate", ["doctor"]);
  record(
    "doctor",
    doctor.status === 0 && /(\d+) of \1 known components reported/.test(doctor.output),
    doctor.output
  );

  const generate = runBin(consumerDir, "ultimate", ["generate", "Button"]);
  record(
    "generate Button",
    generate.status === 0 && generate.output.trim().length > 0,
    generate.output
  );

  const all = [init, add, theme, doctor, generate].map((r) => r.output).join("\n");
  record("no manifest failure in CLI output", !mentionsManifestFailure(all), "");
  return results;
}

export async function runMcpChecks(consumerDir) {
  const require = createRequire(join(REPO_ROOT, "packages", "mcp", "package.json"));
  const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

  const results = [];
  const transport = new StdioClientTransport({
    command: join(consumerDir, "node_modules", ".bin", "ultimate-mcp"),
    args: [],
    cwd: consumerDir,
  });
  const client = new Client({ name: "gap-131-smoke", version: "1.0.0" });
  try {
    await client.connect(transport);
    results.push({ check: "mcp initialize", ok: true, detail: "" });

    const call = async (framework, frameworkVersion) => {
      const res = await client.callTool({
        name: "check_framework_compatibility",
        arguments: { framework, frameworkVersion },
      });
      const text = res.content?.[0]?.text ?? "";
      return { isError: res.isError === true, text, body: text ? JSON.parse(text) : {} };
    };

    for (const consumer of CONSUMERS) {
      const r = await call(consumer.framework, consumer.mcpVersion);
      results.push({
        check: `mcp ${consumer.framework} ${consumer.mcpVersion} compatible`,
        ok: !r.isError && r.body.compatible === true,
        detail: r.text,
      });
    }
    const out = await call("react", "16.0.0");
    results.push({
      check: "mcp react 16.0.0 incompatible (manifest-derived reason)",
      ok:
        !out.isError &&
        out.body.compatible === false &&
        typeof out.body.reason === "string" &&
        !mentionsManifestFailure(out.text),
      detail: out.text,
    });
  } catch (error) {
    results.push({ check: "mcp session", ok: false, detail: String(error?.stack ?? error) });
  } finally {
    await client.close().catch(() => {});
  }
  return results;
}

export async function runSmoke() {
  const packDir = mkdtempSync(join(tmpdir(), "gap-131-pack-"));
  const workDir = mkdtempSync(join(tmpdir(), "gap-131-consumers-"));
  let passed = true;
  try {
    const tarballs = packSmokeMembers(packDir);
    for (const consumer of CONSUMERS) {
      const consumerDir = createConsumer(workDir, consumer, tarballs);
      if (consumer.framework === "react") probeOverride(consumerDir);
      const results = runCliChecks(consumerDir, consumer);
      if (consumer.framework === "react") results.push(...(await runMcpChecks(consumerDir)));
      for (const r of results) {
        console.log(
          `[installed-smoke] ${r.ok ? "PASS" : "FAIL"} ${consumer.framework} :: ${r.check}`
        );
        if (!r.ok && r.detail)
          console.log(
            r.detail
              .trim()
              .split("\n")
              .map((l) => `    ${l}`)
              .join("\n")
          );
        if (!r.ok) passed = false;
      }
    }
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  }
  return passed;
}

function isMainModule() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMainModule()) {
  if (process.argv.includes("--probe-only")) {
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
  } else {
    runSmoke()
      .then((passed) => {
        console.log(`[installed-smoke] ${passed ? "OK" : "FAIL"}`);
        process.exitCode = passed ? 0 : 1;
      })
      .catch((error) => {
        console.error(`[installed-smoke] FAIL: ${error.stack ?? error}`);
        process.exitCode = 1;
      });
  }
}
