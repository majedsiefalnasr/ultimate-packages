// packages/mcp/test/manifest.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("readCompatibilityManifest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the real, currently-checked-in compatibility-manifest.json and returns all 3 framework entries", async () => {
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    const frameworks = result.map((e) => e.framework).sort();
    expect(frameworks).toEqual(["angular", "react", "vue"]);
  });

  it("each entry has framework and frameworkVersionRange only — the single axis this tool needs, not the CLI's full 6-axis shape (spec §7.4)", async () => {
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    for (const entry of result) {
      expect(Object.keys(entry).sort()).toEqual(["framework", "frameworkVersionRange"]);
    }
  });

  it("returns a structured manifest_unreadable error, never throws and never a fabricated/empty successful result, when the file does not exist (case 3, spec §4.1)", async () => {
    vi.resetModules();
    vi.doMock("node:fs", async (importOriginal) => {
      const actual = await importOriginal<typeof import("node:fs")>();
      return {
        ...actual,
        readFileSync: () => {
          throw new Error("ENOENT: no such file or directory");
        },
      };
    });
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("manifest_unreadable");
    vi.doUnmock("node:fs");
  });

  it("returns a structured manifest_unreadable error, not a crash, when the file contains invalid JSON (case 3)", async () => {
    const workDir = mkdtempSync(join(tmpdir(), "mcp-manifest-malformed-"));
    writeFileSync(join(workDir, "compatibility-manifest.json"), "{ this is not valid JSON");

    vi.resetModules();
    vi.doMock("../src/manifest-path.js", () => ({
      COMPATIBILITY_MANIFEST_PATH: join(workDir, "compatibility-manifest.json"),
    }));
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("manifest_unreadable");

    vi.doUnmock("../src/manifest-path.js");
    rmSync(workDir, { recursive: true, force: true });
  });
});
