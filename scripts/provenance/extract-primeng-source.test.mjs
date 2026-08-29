import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

function makeFixtureTarball(dir) {
  const root = join(dir, "primeng-testsha");
  const buttonDir = join(root, "packages", "primeng", "src", "button");
  const otherDir = join(root, "packages", "primeng", "src", "other");
  mkdirSync(buttonDir, { recursive: true });
  mkdirSync(otherDir, { recursive: true });
  writeFileSync(join(buttonDir, "button.ts"), "export class Button {}\n");
  writeFileSync(join(otherDir, "other.ts"), "export class Other {}\n");

  const tarballPath = join(dir, "fixture.tar.gz");
  execFileSync("tar", ["czf", tarballPath, "-C", dir, "primeng-testsha"]);
  return tarballPath;
}

test("extracts only the requested src subdirectory", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-primeng-"));
  const outputDir = join(workDir, "out");
  try {
    const tarballPath = makeFixtureTarball(workDir);

    execFileSync("node", [
      "scripts/provenance/extract-primeng-source.mjs",
      tarballPath,
      "button",
      outputDir,
    ]);

    const extracted = readFileSync(join(outputDir, "button.ts"), "utf8");
    assert.equal(extracted, "export class Button {}\n");
    assert.equal(existsSync(join(outputDir, "other.ts")), false);
    assert.equal(existsSync(join(outputDir, "..", "other")), false);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});

test("is idempotent — re-running overwrites with identical content", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-primeng-idempotent-"));
  const outputDir = join(workDir, "out");
  try {
    const tarballPath = makeFixtureTarball(workDir);
    execFileSync("node", ["scripts/provenance/extract-primeng-source.mjs", tarballPath, "button", outputDir]);
    execFileSync("node", ["scripts/provenance/extract-primeng-source.mjs", tarballPath, "button", outputDir]);

    const extracted = readFileSync(join(outputDir, "button.ts"), "utf8");
    assert.equal(extracted, "export class Button {}\n");
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});
