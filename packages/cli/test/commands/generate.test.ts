import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtempSync, rmSync, cpSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

import { ALL_COMPONENTS } from "@ultimate/component-metadata";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures");

const tempDirs: string[] = [];

/** Copies a fixture project into a fresh temp dir. */
function copyFixture(fixturePath: string): string {
  const src = join(fixturesDir, fixturePath);
  const dest = mkdtempSync(join(tmpdir(), "ultimate-cli-generate-"));
  cpSync(src, dest, { recursive: true });
  tempDirs.push(dest);
  return dest;
}

/**
 * Recursively snapshots a directory tree as a sorted list of
 * `"<relative path> <mtimeMs> <size>"` entries, so a filesystem-write test
 * can assert "nothing changed" (no new/removed/modified files, including
 * mtime bumps from a truncate-and-rewrite) without fighting Node's
 * non-configurable `fs` module bindings via `vi.spyOn`.
 */
function snapshotTree(rootDir: string): string[] {
  const entries: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const fullPath = join(dir, name);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        entries.push(`${relative(rootDir, fullPath)} ${stat.mtimeMs} ${stat.size}`);
      }
    }
  };
  walk(rootDir);
  return entries;
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

describe("runGenerate", () => {
  it("prints an import from the real react packageName and a snippet with only required react props for Button, exit code 0", async () => {
    const { runGenerate } = await import("../../src/commands/generate.js");
    const dir = copyFixture("react-project");

    const button = ALL_COMPONENTS.find((component) => component.name === "Button");
    expect(button).toBeDefined();
    const reactPackageName = button?.packages.react?.packageName;
    expect(reactPackageName).toBeTruthy();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = runGenerate(dir, "Button");

    expect(result.exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0]?.[0] as string;

    expect(output).toContain(`import { Button } from "${reactPackageName}";`);

    // Button has zero required react props: assert none of its optional
    // props leak into the snippet, and no required-prop attribute lines appear.
    const requiredReactProps = button?.api?.react?.props.filter((prop) => prop.required) ?? [];
    expect(requiredReactProps).toHaveLength(0);
    expect(output).not.toMatch(/label=|disabled=|severity=/);
  });

  it("names all real ALL_COMPONENTS names in the not-found error and returns non-zero for an unknown component", async () => {
    const { runGenerate } = await import("../../src/commands/generate.js");
    const dir = copyFixture("react-project");

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = runGenerate(dir, "NotAComponent");

    expect(result.exitCode).not.toBe(0);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const message = errorSpy.mock.calls[0]?.[0] as string;

    for (const component of ALL_COMPONENTS) {
      expect(message).toContain(component.name);
    }
  });

  it("writes nothing to the filesystem across a successful generate run", async () => {
    const { runGenerate } = await import("../../src/commands/generate.js");
    const dir = copyFixture("react-project");

    vi.spyOn(console, "log").mockImplementation(() => {});

    const before = snapshotTree(dir);
    const result = runGenerate(dir, "Button");
    const after = snapshotTree(dir);

    expect(result.exitCode).toBe(0);
    expect(after).toEqual(before);
  });

  it("writes nothing to the filesystem across a failing (not-found) generate run", async () => {
    const { runGenerate } = await import("../../src/commands/generate.js");
    const dir = copyFixture("react-project");

    vi.spyOn(console, "error").mockImplementation(() => {});

    const before = snapshotTree(dir);
    const result = runGenerate(dir, "NotAComponent");
    const after = snapshotTree(dir);

    expect(result.exitCode).not.toBe(0);
    expect(after).toEqual(before);
  });

  it("refuses with a non-zero exit code when the framework cannot be detected", async () => {
    const { runGenerate } = await import("../../src/commands/generate.js");
    const dir = mkdtempSync(join(tmpdir(), "ultimate-cli-generate-empty-"));
    tempDirs.push(dir);
    cpSync(join(fixturesDir, "init", "empty-project"), dir, { recursive: true });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = runGenerate(dir, "Button");

    expect(result.exitCode).not.toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });
});
