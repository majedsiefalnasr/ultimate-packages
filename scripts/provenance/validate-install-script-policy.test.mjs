import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-install-script-policy.mjs");
const REPO_ROOT = process.cwd();

function runScript(cwd) {
  return spawnSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// A minimal, valid pnpm-lock.yaml fixture whose top-level `packages:`
// section resolves exactly "esbuild@0.28.2".
const FIXTURE_LOCKFILE = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    devDependencies: {}

packages:

  esbuild@0.28.2:
    resolution: {integrity: sha512-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000==}
    engines: {node: '>=18'}
`;

// --- Real repository state ----------------------------------------------

test("passes against current main's real .npmrc and pnpm-workspace.yaml", () => {
  const result = runScript(REPO_ROOT);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);
});

// --- Scratch fixtures -----------------------------------------------------

test("fails when onlyBuiltDependencies names a package not present in pnpm-lock.yaml", () => {
  const workDir = makeWorkDir("install-script-policy-fail-");
  writeFileSync(
    join(workDir, "pnpm-workspace.yaml"),
    `packages:\n  - "packages/*"\n\nonlyBuiltDependencies:\n  - "totally-not-a-real-dependency"\n`
  );
  writeFileSync(join(workDir, "pnpm-lock.yaml"), FIXTURE_LOCKFILE);

  const result = runScript(workDir);

  assert.equal(
    result.status,
    1,
    "expected the script to fail (exit code 1) on an orphaned onlyBuiltDependencies entry"
  );
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /onlyBuiltDependencies/);
  assert.match(result.stderr, /totally-not-a-real-dependency/);

  rmSync(workDir, { recursive: true, force: true });
});

test("passes when onlyBuiltDependencies only names packages that resolve in pnpm-lock.yaml", () => {
  const workDir = makeWorkDir("install-script-policy-pass-resolves-");
  writeFileSync(
    join(workDir, "pnpm-workspace.yaml"),
    `packages:\n  - "packages/*"\n\nonlyBuiltDependencies:\n  - "esbuild"\n`
  );
  writeFileSync(join(workDir, "pnpm-lock.yaml"), FIXTURE_LOCKFILE);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

test("passes against a scratch fixture with no pnpm-workspace.yaml build-approval fields at all", () => {
  const workDir = makeWorkDir("install-script-policy-pass-none-");
  mkdirSync(join(workDir, "packages"), { recursive: true });
  writeFileSync(join(workDir, "pnpm-workspace.yaml"), `packages:\n  - "packages/*"\n`);
  writeFileSync(join(workDir, ".npmrc"), `engine-strict=true\nsave-exact=true\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);
  assert.match(result.stdout, /no build-script allowlist\/ignorelist overrides present/);

  rmSync(workDir, { recursive: true, force: true });
});
