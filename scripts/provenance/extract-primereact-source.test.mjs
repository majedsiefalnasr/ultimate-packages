import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("extracts a real components/lib/<name> directory from the pinned tarball", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primereact-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primereact-source.mjs",
      ".vendor-cache/primereact-10.9.9.tar.gz",
      "button",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "Button.js")), "Button.js should be copied");
    assert.ok(existsSync(join(outDir, "ButtonBase.js")), "ButtonBase.js should be copied");
    const content = readFileSync(join(outDir, "Button.js"), "utf8");
    assert.match(content, /React\.forwardRef/, "copied file should be real Button source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly when the requested lib subdirectory does not exist", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primereact-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primereact-source.mjs",
        ".vendor-cache/primereact-10.9.9.tar.gz",
        "does-not-exist",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
