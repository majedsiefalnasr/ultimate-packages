// scripts/provenance/validate-mcp-boundary.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-mcp-boundary.mjs");

function runScript(cwd) {
  return spawnSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// --- Check 1: reverse-direction, framework packages never import @ultimate/mcp ---

test("passes when packages/ng*/src has no @ultimate/mcp import", () => {
  const workDir = makeWorkDir("mcp-boundary-check1-pass-");
  const srcDir = join(workDir, "packages", "ng", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { Button } from "@ultimate/ng-core";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/react*-shaped fixture's src imports @ultimate/mcp", () => {
  const workDir = makeWorkDir("mcp-boundary-check1-fail-");
  const srcDir = join(workDir, "packages", "react", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { searchComponents } from "@ultimate/mcp";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on reverse-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/vue*-shaped fixture's package.json declares @ultimate/mcp in dependencies", () => {
  const workDir = makeWorkDir("mcp-boundary-check2-fail-");
  const pkgDir = join(workDir, "packages", "vue");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/vue", dependencies: { "@ultimate/mcp": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on reverse-direction package.json violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 3: forward-direction, @ultimate/mcp never depends on cli/ng/react/vue/themes ---

test("passes when packages/mcp/package.json declares only the permitted Ultimate dependencies (component-metadata, component-schema)", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-pass-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({
      name: "@ultimate/mcp",
      dependencies: {
        "@ultimate/component-metadata": "workspace:*",
        "@ultimate/component-schema": "workspace:*",
        "@modelcontextprotocol/sdk": "^1.30.0",
        zod: "^3.25.0 || ^4.0.0",
      },
    })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's package.json declares @ultimate/cli in dependencies (the specific edge spec §5.2/§8.1 forbids)", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-fail-cli-deps-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/mcp", dependencies: { "@ultimate/cli": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction dependencies violation (mcp -> cli)");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"dependencies"/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's package.json declares @ultimate/themes in devDependencies", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-fail-devdeps-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/mcp", devDependencies: { "@ultimate/themes": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction devDependencies violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"devDependencies"/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 4: forward-direction, source imports ---

test("passes when packages/mcp/src has no forbidden cli/framework/themes import", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-pass-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(srcDir, "index.ts"),
    `import { ALL_COMPONENTS } from "@ultimate/component-metadata";\n`
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's src imports @ultimate/cli (the specific edge spec §5.2 forbids)", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-fail-cli-import-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "manifest.ts"), `import { matchCompatibility } from "@ultimate/cli";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction source-import violation (mcp -> cli)");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's src imports @ultimate/vue", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-fail-vue-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { something } from "@ultimate/vue";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);

  rmSync(workDir, { recursive: true, force: true });
});
