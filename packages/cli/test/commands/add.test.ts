import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync, cpSync } from "node:fs";
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
const fixturesDir = join(__dirname, "..", "fixtures", "add");

const tempDirs: string[] = [];

/** Copies a fixture project into a fresh temp dir so tests are free to write into it. */
function copyFixture(fixtureName: string): string {
  const src = join(fixturesDir, fixtureName);
  const dest = mkdtempSync(join(tmpdir(), `ultimate-cli-add-${fixtureName}-`));
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

describe("runAdd", () => {
  it("refuses and never calls installPackage/spawn when the project fails the compatibility check", async () => {
    const { runAdd } = await import("../../src/commands/add.js");
    const dir = copyFixture("react-incompatible-project");
    const matchSpy = vi.spyOn(compatibilityModule, "matchCompatibility");
    const spawnSpy = mockSpawn(0);

    const result = await runAdd(dir, "@ultimate/react-table");

    expect(result.exitCode).not.toBe(0);
    expect(matchSpy).toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it("calls installPackage with the named package on a compatible project", async () => {
    const { runAdd } = await import("../../src/commands/add.js");
    const dir = copyFixture("react-project");
    const spawnSpy = mockSpawn(0);

    const result = await runAdd(dir, "@ultimate/react-table");

    expect(result.exitCode).toBe(0);
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["install", "@ultimate/react-table"],
      expect.objectContaining({ cwd: dir }),
    );
  });

  it("propagates installPackage's non-zero exit code as add's own exit code", async () => {
    const { runAdd } = await import("../../src/commands/add.js");
    const dir = copyFixture("react-project");
    mockSpawn(7);

    const result = await runAdd(dir, "@ultimate/react-table");

    expect(result.exitCode).toBe(7);
  });
});
