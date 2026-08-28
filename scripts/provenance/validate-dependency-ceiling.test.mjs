import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("validate-dependency-ceiling.mjs catches a forbidden @primeuix dependency in a packages/uix* package.json", () => {
  const workDir = mkdtempSync(join(tmpdir(), "ceiling-gap-test-"));
  const pkgDir = join(workDir, "packages", "uix-fake");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/uix-fake", dependencies: { "@primeuix/utils": "0.8.1" } })
  );

  const result = spawnSync(
    "node",
    [join(process.cwd(), "scripts/provenance/validate-dependency-ceiling.mjs")],
    {
      cwd: workDir,
      encoding: "utf8",
    }
  );

  assert.equal(
    result.status,
    1,
    "expected the script to fail (exit code 1) on a ceiling violation"
  );
  assert.match(result.stderr, /VIOLATION/);

  rmSync(workDir, { recursive: true, force: true });
});
