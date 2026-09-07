import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync, cpSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type * as ChildProcessModule from "node:child_process";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof ChildProcessModule>();
  return {
    ...actual,
    spawn: vi.fn(actual.spawn),
  };
});

const childProcess = await import("node:child_process");

import * as compatibilityModule from "../../src/compatibility.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures", "init");

const tempDirs: string[] = [];

/** Copies a fixture project into a fresh temp dir so tests are free to write into it. */
function copyFixture(fixtureName: string): string {
  const src = join(fixturesDir, fixtureName);
  const dest = mkdtempSync(join(tmpdir(), `ultimate-cli-init-${fixtureName}-`));
  cpSync(src, dest, { recursive: true });
  tempDirs.push(dest);
  return dest;
}

class FakeChildProcess extends EventEmitter {}

function mockSpawn(exitCode: number | null): typeof childProcess.spawn {
  return vi.mocked(childProcess.spawn).mockImplementation(() => {
    const child = new FakeChildProcess();
    queueMicrotask(() => child.emit("close", exitCode));
    return child as unknown as ChildProcessModule.ChildProcess;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("runInit", () => {
  it("refuses with a non-zero exit and no install/compatibility check for a project with no package.json", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("empty-project");
    const matchSpy = vi.spyOn(compatibilityModule, "matchCompatibility");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).not.toBe(0);
    expect(result.message).toMatch(/existing/i);
    expect(result.message).toMatch(/create/i);
    expect(matchSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
  });

  it("refuses naming the failing axis for an Angular version outside the manifest range, without installing", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("angular-incompatible-project");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).not.toBe(0);
    expect(result.message).toMatch(/frameworkVersionRange/);
    expect(spawnSpy).not.toHaveBeenCalled();
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
  });

  it("installs @ultimate/ng and writes ultimate.config.json for a compatible Angular project", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("angular-project");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["install", "@ultimate/ng"],
      expect.objectContaining({ cwd: dir })
    );

    const config = JSON.parse(readFileSync(join(dir, "ultimate.config.json"), "utf-8"));
    expect(config).toEqual({
      framework: "angular",
      ultimatePackage: "@ultimate/ng",
      themePreset: null,
    });
  });

  it("installs @ultimate/react and writes ultimate.config.json for a compatible React project", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("react-project");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["install", "@ultimate/react"],
      expect.objectContaining({ cwd: dir })
    );

    const config = JSON.parse(readFileSync(join(dir, "ultimate.config.json"), "utf-8"));
    expect(config).toEqual({
      framework: "react",
      ultimatePackage: "@ultimate/react",
      themePreset: null,
    });
  });

  it("installs @ultimate/vue and writes ultimate.config.json for a compatible Vue project", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("vue-project");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["install", "@ultimate/vue"],
      expect.objectContaining({ cwd: dir })
    );

    const config = JSON.parse(readFileSync(join(dir, "ultimate.config.json"), "utf-8"));
    expect(config).toEqual({
      framework: "vue",
      ultimatePackage: "@ultimate/vue",
      themePreset: null,
    });
  });

  it("resolves with the install's non-zero exit code and does not write ultimate.config.json on install failure", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("angular-project");
    mockSpawn(1);

    const result = await runInit(dir);

    expect(result.exitCode).toBe(1);
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
  });

  it("uses the fixture's detected package manager (pnpm) for the install command", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const dir = copyFixture("react-project");
    writeFileSync(join(dir, "pnpm-lock.yaml"), "");
    const spawnSpy = mockSpawn(0);

    const result = await runInit(dir);

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "pnpm",
      ["add", "@ultimate/react"],
      expect.objectContaining({ cwd: dir })
    );
  });

  it("never invokes a *new*/*create*-named scaffolding binary across every case", async () => {
    const { runInit } = await import("../../src/commands/init.js");
    const spawnSpy = mockSpawn(0);

    for (const fixture of [
      "empty-project",
      "angular-incompatible-project",
      "angular-project",
      "react-project",
      "vue-project",
    ]) {
      const dir = copyFixture(fixture);
      await runInit(dir);
    }

    for (const call of spawnSpy.mock.calls) {
      const binary = String(call[0]);
      expect(binary).not.toMatch(/new|create/i);
    }
  });
});
