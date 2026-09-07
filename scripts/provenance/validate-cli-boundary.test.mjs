import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-cli-boundary.mjs");

function runScript(cwd) {
  return spawnSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// --- Check 1: reverse-direction, source imports -----------------------

test("passes when packages/ng*/src has no @ultimate/cli import", () => {
  const workDir = makeWorkDir("cli-boundary-check1-pass-");
  const srcDir = join(workDir, "packages", "ng", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { Button } from "@ultimate/ng-core";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/ng*-shaped fixture's src imports @ultimate/cli", () => {
  const workDir = makeWorkDir("cli-boundary-check1-fail-");
  const srcDir = join(workDir, "packages", "ng", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { doStuff } from "@ultimate/cli";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a reverse-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 2: reverse-direction, package.json --------------------------

test("passes when packages/react*/package.json has no @ultimate/cli dependency", () => {
  const workDir = makeWorkDir("cli-boundary-check2-pass-");
  const pkgDir = join(workDir, "packages", "react");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/react", dependencies: { "@ultimate/react-core": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/react*-shaped fixture's package.json declares @ultimate/cli in dependencies", () => {
  const workDir = makeWorkDir("cli-boundary-check2-fail-");
  const pkgDir = join(workDir, "packages", "react");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/react", dependencies: { "@ultimate/cli": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a reverse-direction package.json violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 3: forward-direction, package.json (dependencies + devDependencies) ---

test("passes when packages/cli/package.json has no forbidden framework/themes dependency", () => {
  const workDir = makeWorkDir("cli-boundary-check3-pass-");
  const pkgDir = join(workDir, "packages", "cli");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({
      name: "@ultimate/cli",
      dependencies: { "@ultimate/component-metadata": "workspace:*", "@ultimate/component-schema": "workspace:*" },
    })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/cli-shaped fixture's package.json declares @ultimate/themes in dependencies", () => {
  const workDir = makeWorkDir("cli-boundary-check3-fail-deps-");
  const pkgDir = join(workDir, "packages", "cli");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/cli", dependencies: { "@ultimate/themes": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a forward-direction dependencies violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"dependencies"/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/cli-shaped fixture's package.json declares @ultimate/themes in devDependencies", () => {
  const workDir = makeWorkDir("cli-boundary-check3-fail-devdeps-");
  const pkgDir = join(workDir, "packages", "cli");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/cli", devDependencies: { "@ultimate/themes": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a forward-direction devDependencies violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"devDependencies"/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 4: forward-direction, source imports ------------------------

test("passes when packages/cli/src has no forbidden framework/themes import", () => {
  const workDir = makeWorkDir("cli-boundary-check4-pass-");
  const srcDir = join(workDir, "packages", "cli", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { ALL_COMPONENTS } from "@ultimate/component-metadata";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/cli-shaped fixture's src imports @ultimate/vue", () => {
  const workDir = makeWorkDir("cli-boundary-check4-fail-");
  const srcDir = join(workDir, "packages", "cli", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { something } from "@ultimate/vue";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a forward-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});
