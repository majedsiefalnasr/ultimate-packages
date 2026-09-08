// packages/ai/test/bin-generate.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAllSkillFiles } from "../src/bin-generate";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir !== undefined) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("generateAllSkillFiles", () => {
  it("writes exactly 8 Skill files, one per component in ALL_COMPONENTS, for an empty target directory", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-test-"));
    const result = generateAllSkillFiles(tempDir);

    expect(result.errors).toEqual([]);
    expect(result.written.length).toBe(8);
    for (const name of ["button", "checkbox", "dialog", "menu", "paginator", "scroller", "table", "tooltip"]) {
      expect(existsSync(join(tempDir, `${name}.md`))).toBe(true);
    }
  });

  it("preserves hand-authored content when run a second time against already-generated files", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-test-"));
    generateAllSkillFiles(tempDir);

    const buttonPath = join(tempDir, "button.md");
    const original = readFileSync(buttonPath, "utf8");
    const withHandAuthoredNote = original.replace(
      "## When to use\n",
      "## When to use\nUse for any clickable action.\n"
    );
    writeFileSync(buttonPath, withHandAuthoredNote);

    const result = generateAllSkillFiles(tempDir);
    expect(result.errors).toEqual([]);

    const regenerated = readFileSync(buttonPath, "utf8");
    expect(regenerated).toContain("Use for any clickable action.");
  });
});
