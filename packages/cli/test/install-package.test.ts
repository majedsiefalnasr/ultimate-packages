import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type * as ChildProcessModule from "node:child_process";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof ChildProcessModule>();
  return {
    ...actual,
    spawn: vi.fn(actual.spawn),
    exec: vi.fn(actual.exec),
  };
});

const childProcess = await import("node:child_process");

import { installPackage } from "../src/install-package.js";

const tempDirs: string[] = [];

function makeProjectDir(lockfileName?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "ultimate-cli-install-pkg-"));
  tempDirs.push(dir);
  if (lockfileName) {
    writeFileSync(join(dir, lockfileName), "");
  }
  return dir;
}

class FakeChildProcess extends EventEmitter {}

function mockSpawn(exitCode: number | null): { spy: typeof childProcess.spawn; child: FakeChildProcess } {
  const child = new FakeChildProcess();
  const spy = vi.mocked(childProcess.spawn).mockImplementation(() => {
    queueMicrotask(() => child.emit("close", exitCode));
    return child as unknown as ChildProcessModule.ChildProcess;
  });
  return { spy, child };
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

describe("installPackage", () => {
  it("invokes npm install <pkg> for an npm project (package-lock.json)", async () => {
    const dir = makeProjectDir("package-lock.json");
    const { spy } = mockSpawn(0);

    const result = await installPackage(dir, "@ultimate/react");

    expect(spy).toHaveBeenCalledWith("npm", ["install", "@ultimate/react"], expect.objectContaining({ cwd: dir }));
    expect(result).toEqual({ exitCode: 0 });
  });

  it("invokes yarn add <pkg> for a yarn project (yarn.lock)", async () => {
    const dir = makeProjectDir("yarn.lock");
    const { spy } = mockSpawn(0);

    const result = await installPackage(dir, "@ultimate/vue");

    expect(spy).toHaveBeenCalledWith("yarn", ["add", "@ultimate/vue"], expect.objectContaining({ cwd: dir }));
    expect(result).toEqual({ exitCode: 0 });
  });

  it("invokes pnpm add <pkg> for a pnpm project (pnpm-lock.yaml)", async () => {
    const dir = makeProjectDir("pnpm-lock.yaml");
    const { spy } = mockSpawn(0);

    const result = await installPackage(dir, "@ultimate/ng");

    expect(spy).toHaveBeenCalledWith("pnpm", ["add", "@ultimate/ng"], expect.objectContaining({ cwd: dir }));
    expect(result).toEqual({ exitCode: 0 });
  });

  it("resolves with the subprocess's real non-zero exit code on failure", async () => {
    const dir = makeProjectDir("package-lock.json");
    mockSpawn(1);

    const result = await installPackage(dir, "@ultimate/react");

    expect(result).toEqual({ exitCode: 1 });
  });

  it("never calls child_process.exec (array-form spawn only, no shell)", async () => {
    const dir = makeProjectDir("package-lock.json");
    const execSpy = vi.mocked(childProcess.exec);
    mockSpawn(0);

    await installPackage(dir, "@ultimate/react");

    expect(execSpy).not.toHaveBeenCalled();
  });
});
