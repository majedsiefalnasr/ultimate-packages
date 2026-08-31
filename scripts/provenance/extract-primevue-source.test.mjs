import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("extracts a real packages/primevue/src/<name> directory (components root)", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primevue-source.mjs",
      ".vendor-cache/primevue-4.5.5.tar.gz",
      "primevue",
      "button",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "Button.vue")), "Button.vue should be copied");
    assert.ok(existsSync(join(outDir, "BaseButton.vue")), "BaseButton.vue should be copied");
    const content = readFileSync(join(outDir, "Button.vue"), "utf8");
    assert.match(content, /extends: BaseButton/, "copied file should be real Button.vue source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("extracts a real packages/core/src/<name> directory (foundation root)", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primevue-source.mjs",
      ".vendor-cache/primevue-4.5.5.tar.gz",
      "core",
      "basecomponent",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "BaseComponent.vue")), "BaseComponent.vue should be copied");
    const content = readFileSync(join(outDir, "BaseComponent.vue"), "utf8");
    assert.match(content, /name: 'BaseComponent'/, "copied file should be real BaseComponent.vue source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly on an invalid root argument", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primevue-source.mjs",
        ".vendor-cache/primevue-4.5.5.tar.gz",
        "not-a-real-root",
        "button",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly when the requested lib subdirectory does not exist", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primevue-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primevue-source.mjs",
        ".vendor-cache/primevue-4.5.5.tar.gz",
        "primevue",
        "does-not-exist",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
