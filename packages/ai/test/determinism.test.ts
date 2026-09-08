import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAllSkillFiles } from "../src/bin-generate";
import { generateContextFiles } from "../src/context-files";

let dirA: string | undefined;
let dirB: string | undefined;

afterEach(() => {
  for (const dir of [dirA, dirB]) {
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
  dirA = undefined;
  dirB = undefined;
});

describe("end-to-end determinism (spec §7.3)", () => {
  it("two full generation runs against identical input (empty target dirs) produce byte-identical Skill files", () => {
    dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-det-a-"));
    dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-det-b-"));

    generateAllSkillFiles(dirA);
    generateAllSkillFiles(dirB);

    const filesA = readdirSync(dirA).sort();
    const filesB = readdirSync(dirB).sort();
    expect(filesA).toEqual(filesB);

    for (const filename of filesA) {
      expect(readFileSync(join(dirA, filename), "utf8")).toBe(readFileSync(join(dirB, filename), "utf8"));
    }
  });

  it("two full context-generation runs produce byte-identical output for every one of the 5 files", () => {
    dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-det-ctx-a-"));
    dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-det-ctx-b-"));

    generateContextFiles(dirA);
    generateContextFiles(dirB);

    for (const filename of ["llms.txt", "llms-full.txt", "llms-ng.txt", "llms-react.txt", "llms-vue.txt"]) {
      expect(readFileSync(join(dirA, filename), "utf8")).toBe(readFileSync(join(dirB, filename), "utf8"));
    }
  });
});
