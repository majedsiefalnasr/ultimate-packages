import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { detectPackageManager } from "../src/detect-package-manager.js";

const tempDirs: string[] = [];

function makeProjectDir(lockfileName?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "ultimate-cli-detect-pm-"));
  tempDirs.push(dir);
  if (lockfileName) {
    writeFileSync(join(dir, lockfileName), "");
  }
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("detectPackageManager", () => {
  it('returns "pnpm" when pnpm-lock.yaml is present', () => {
    const dir = makeProjectDir("pnpm-lock.yaml");
    expect(detectPackageManager(dir)).toBe("pnpm");
  });

  it('returns "yarn" when yarn.lock is present', () => {
    const dir = makeProjectDir("yarn.lock");
    expect(detectPackageManager(dir)).toBe("yarn");
  });

  it('returns "npm" when package-lock.json is present', () => {
    const dir = makeProjectDir("package-lock.json");
    expect(detectPackageManager(dir)).toBe("npm");
  });

  it('defaults to "npm" when no lockfile is present', () => {
    const dir = makeProjectDir();
    expect(detectPackageManager(dir)).toBe("npm");
  });
});
