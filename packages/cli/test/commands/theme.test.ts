import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync, cpSync, readFileSync, existsSync } from "node:fs";
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures", "theme");

const tempDirs: string[] = [];

/** Copies a fixture project into a fresh temp dir so tests are free to write into it. */
function copyFixture(fixtureName: string): string {
  const src = join(fixturesDir, fixtureName);
  const dest = mkdtempSync(join(tmpdir(), `ultimate-cli-theme-${fixtureName}-`));
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

describe("runTheme", () => {
  it('refuses an unknown preset name, naming "aura" as the only valid preset, with zero file writes', async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-with-tsconfig");
    const spawnSpy = mockSpawn(0);

    const result = await runTheme(dir, "material");

    expect(result.exitCode).not.toBe(0);
    expect(result.message).toMatch(/aura/);
    expect(spawnSpy).not.toHaveBeenCalled();
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
    expect(existsSync(join(dir, "ultimate-theme.ts"))).toBe(false);
    expect(existsSync(join(dir, "ultimate-theme.js"))).toBe(false);
  });

  it("refuses on a compatibility mismatch, without installing or writing any file", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-incompatible");
    const spawnSpy = mockSpawn(0);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).not.toBe(0);
    expect(spawnSpy).not.toHaveBeenCalled();
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
  });

  it("does not call installPackage when @ultimate/themes is already a dependency, and writes both files", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-themes-already-present");
    const spawnSpy = mockSpawn(0);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).not.toHaveBeenCalled();

    const config = JSON.parse(readFileSync(join(dir, "ultimate.config.json"), "utf-8"));
    expect(config.themePreset).toBe("aura");

    const themeEntry = readFileSync(join(dir, "ultimate-theme.js"), "utf-8");
    expect(themeEntry).toContain('import { applyUltimateTheme } from "@ultimate/themes";');
    expect(themeEntry).toContain("applyUltimateTheme();");
  });

  it("creates ultimate-theme.ts (not .js) when the target project has a root tsconfig.json", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-with-tsconfig");
    mockSpawn(0);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(dir, "ultimate-theme.ts"))).toBe(true);
    expect(existsSync(join(dir, "ultimate-theme.js"))).toBe(false);
  });

  it("creates ultimate-theme.js when the target project has no tsconfig.json", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-no-tsconfig");
    mockSpawn(0);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(dir, "ultimate-theme.js"))).toBe(true);
    expect(existsSync(join(dir, "ultimate-theme.ts"))).toBe(false);
  });

  it("installs @ultimate/themes via installPackage before writing either file when it's absent", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-no-tsconfig");
    const spawnSpy = mockSpawn(0);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["install", "@ultimate/themes"],
      expect.objectContaining({ cwd: dir })
    );
  });

  it("propagates a failed @ultimate/themes install as theme's own exit code, writing no files", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-no-tsconfig");
    mockSpawn(1);

    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(1);
    expect(existsSync(join(dir, "ultimate.config.json"))).toBe(false);
    expect(existsSync(join(dir, "ultimate-theme.js"))).toBe(false);
  });

  it("running theme aura twice leaves exactly one applyUltimateTheme() call in the theme-entry file (idempotent)", async () => {
    const { runTheme } = await import("../../src/commands/theme.js");
    const dir = copyFixture("react-themes-already-present");
    mockSpawn(0);

    await runTheme(dir, "aura");
    const result = await runTheme(dir, "aura");

    expect(result.exitCode).toBe(0);
    const themeEntry = readFileSync(join(dir, "ultimate-theme.js"), "utf-8");
    const occurrences = themeEntry.split("applyUltimateTheme()").length - 1;
    expect(occurrences).toBe(1);
  });
});
