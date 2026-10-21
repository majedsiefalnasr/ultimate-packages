// scripts/provenance/coverage-measure.test.mjs
//
// `coverage:measure` must run every package's coverage and still fail when any
// package fails. Without --no-bail, pnpm stops at the first failing package, so
// the packages after it are never measured and their old reports stay on disk
// (the cause of the 8.6% and 11.3% readings, see the coverage freshness Spec).
//
// The test runs the real command from the repository's package.json in a
// temporary pnpm workspace, so it checks the script itself, not a copy of it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";

const rootPackageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8")
);
const measureCommand = rootPackageJson.scripts["coverage:measure"];

const pnpmAvailable = spawnSync("pnpm", ["--version"], { encoding: "utf8" }).status === 0;
const skip = pnpmAvailable ? false : "pnpm is not available on PATH";

function makeWorkspace(scripts) {
  const root = mkdtempSync(join(tmpdir(), "coverage-measure-"));
  writeFileSync(join(root, "pnpm-workspace.yaml"), 'packages:\n  - "packages/*"\n');
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "root", private: true }));
  for (const [name, script] of Object.entries(scripts)) {
    mkdirSync(join(root, "packages", name), { recursive: true });
    writeFileSync(
      join(root, "packages", name, "package.json"),
      JSON.stringify({ name, version: "1.0.0", scripts: { "test:coverage": script } })
    );
  }
  return root;
}

// Runs the root script's command in the temporary workspace. The command is
// "pnpm -r ... run test:coverage", so it works unchanged outside the repository.
// True when a package printed `marker` as output. pnpm also echoes the command
// itself (`name test:coverage$ echo MARKER`), which must not count as a run, so
// only lines of the form `packages/<name> test:coverage: <marker>` match.
function ranPackage(output, name, marker) {
  const line = new RegExp(`^packages/${name} test:coverage: ${marker}$`, "m");
  return line.test(output);
}

function runMeasure(root) {
  assert.match(measureCommand, /^pnpm /, "coverage:measure is expected to be a pnpm command");
  const args = measureCommand.replace(/^pnpm /, "").split(/\s+/);
  const result = spawnSync("pnpm", args, { cwd: root, encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
}

test(
  "coverage:measure runs every package after one fails, then exits non-zero naming it",
  { skip },
  () => {
    const root = makeWorkspace({
      a: "echo RAN-A",
      b: "echo RAN-B-FAILING && exit 3",
      c: "sleep 1 && echo RAN-C",
    });
    try {
      const { status, output } = runMeasure(root);
      assert.notEqual(status, 0, output);
      assert.ok(ranPackage(output, "a", "RAN-A"), output);
      assert.ok(ranPackage(output, "b", "RAN-B-FAILING"), output);
      assert.ok(
        ranPackage(output, "c", "RAN-C"),
        `the package after the failing one must still run\n${output}`
      );
      assert.match(output, /b@1\.0\.0/, "the failing package must be named");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
);

test("coverage:measure exits 0 when every package passes", { skip }, () => {
  const root = makeWorkspace({ a: "echo RAN-A", b: "echo RAN-B" });
  try {
    const { status, output } = runMeasure(root);
    assert.equal(status, 0, output);
    assert.ok(ranPackage(output, "a", "RAN-A"), output);
    assert.ok(ranPackage(output, "b", "RAN-B"), output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("coverage:measure still skips a package with no test:coverage script", { skip }, () => {
  const root = makeWorkspace({ a: "echo RAN-A" });
  mkdirSync(join(root, "packages", "bare"), { recursive: true });
  writeFileSync(
    join(root, "packages", "bare", "package.json"),
    JSON.stringify({ name: "bare", version: "1.0.0" })
  );
  try {
    const { status, output } = runMeasure(root);
    assert.equal(status, 0, output);
    assert.ok(ranPackage(output, "a", "RAN-A"), output);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
