import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtempSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures", "doctor");

const tempDirs: string[] = [];

/** Copies a fixture project into a fresh temp dir. */
function copyFixture(fixtureName: string): string {
  const src = join(fixturesDir, fixtureName);
  const dest = mkdtempSync(join(tmpdir(), `ultimate-cli-doctor-${fixtureName}-`));
  cpSync(src, dest, { recursive: true });
  tempDirs.push(dest);
  return dest;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("runDoctor", () => {
  it("reads the real ALL_COMPONENTS export and always closes with the exact 8-of-8 summary line", async () => {
    const { runDoctor } = await import("../../src/commands/doctor.js");
    const dir = copyFixture("react-partial");

    const result = runDoctor(dir);

    expect(result.components).toHaveLength(8);
    expect(result.summaryLine).toBe("8 of 8 known components reported");
  });

  it("reports 3 installed / 5 missing for a fixture with 3 of 8 component packages present, using a mocked 8-record ALL_COMPONENTS", async () => {
    vi.resetModules();
    vi.doMock("@ultimate/component-metadata", () => {
      const makeRecord = (name: string, packageName: string) => ({
        name,
        category: "Primitive",
        description: `${name} test record`,
        schemaVersion: "1.0.0",
        metadataVersion: 1,
        packages: {
          react: { packageName, sourcePath: `packages/react/src/${name.toLowerCase()}.tsx` },
        },
      });

      return {
        ALL_COMPONENTS: [
          makeRecord("Installed1", "@ultimate/react"),
          makeRecord("Installed2", "@ultimate/react"),
          makeRecord("Installed3", "@ultimate/react"),
          makeRecord("Missing1", "@ultimate/react-missing-a"),
          makeRecord("Missing2", "@ultimate/react-missing-b"),
          makeRecord("Missing3", "@ultimate/react-missing-c"),
          makeRecord("Missing4", "@ultimate/react-missing-d"),
          makeRecord("Missing5", "@ultimate/react-missing-e"),
        ],
      };
    });

    const { runDoctor } = await import("../../src/commands/doctor.js");
    const dir = copyFixture("react-partial");

    const result = runDoctor(dir);

    const installed = result.components.filter((component) => component.installed);
    const missing = result.components.filter((component) => !component.installed);

    expect(installed).toHaveLength(3);
    expect(missing).toHaveLength(5);
    expect(result.summaryLine).toBe("8 of 8 known components reported");
    expect(result.summaryLine).not.toMatch(/~/);

    vi.doUnmock("@ultimate/component-metadata");
  });

  it("reports framework null and unknown compatibility for a project with no recognizable framework", async () => {
    const { runDoctor } = await import("../../src/commands/doctor.js");
    const dir = mkdtempSync(join(tmpdir(), "ultimate-cli-doctor-empty-"));
    tempDirs.push(dir);
    cpSync(join(fixturesDir, "..", "init", "empty-project"), dir, { recursive: true });

    const result = runDoctor(dir);

    expect(result.framework).toBeNull();
    expect(result.components).toHaveLength(8);
    expect(result.components.every((component) => component.compatibility === "unknown")).toBe(
      true
    );
  });
});
