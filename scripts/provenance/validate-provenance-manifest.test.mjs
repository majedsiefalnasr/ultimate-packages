import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("validate-provenance.mjs fails when a source file has no manifest entry", () => {
  const workDir = mkdtempSync(join(tmpdir(), "manifest-gap-test-"));

  mkdirSync(join(workDir, "docs", "architecture", "provenance"), { recursive: true });
  writeFileSync(
    join(workDir, "docs", "architecture", "PROVENANCE.md"),
    [
      "## PrimeNG",
      "## PrimeVue",
      "## PrimeReact",
      "## @primeuix/utils",
      "## @primeuix/styled",
      "## @primeuix/styles",
      "## @primeuix/motion",
      "",
    ].join("\n")
  );
  writeFileSync(join(workDir, "docs", "architecture", "provenance", "uix-utils.json"), "[]\n");

  mkdirSync(join(workDir, "packages", "uix-utils", "src"), { recursive: true });
  writeFileSync(
    join(workDir, "packages", "uix-utils", "src", "orphan.ts"),
    "export const x = 1;\n"
  );

  const result = spawnSync(
    "node",
    [join(process.cwd(), "scripts/provenance/validate-provenance.mjs")],
    {
      cwd: workDir,
      encoding: "utf8",
    }
  );

  assert.equal(result.status, 1, "expected failure: orphan.ts has no manifest entry");

  rmSync(workDir, { recursive: true, force: true });
});
