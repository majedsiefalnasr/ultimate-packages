// packages/ai/test/committed-artifacts.test.ts
//
// Reads the REAL, committed skills/*.md files from disk and validates them
// with the real validator — unlike every other test in this package, which
// only ever validates strings the generator produced in the same process
// as the validator. That in-memory symmetry is tautological: it proves
// generator and validator agree with each other, never that either agrees
// with what's actually checked into the repository.
//
// This exact gap let a real defect ship silently: a later formatting pass
// (Prettier) rewrote the committed skills/*.md files in a way that broke
// fidelity against the generator's own rendering rule, and the 62-test
// in-memory suite still reported green throughout, because nothing in it
// ever opened a real file from skills/. This test exists to make that
// class of drift impossible to miss again.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSkillFile } from "../src/validate";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(PACKAGE_ROOT, "..", "..", "skills");

describe("real committed skills/*.md pass the real validator", () => {
  const skillFiles = existsSync(SKILLS_DIR)
    ? readdirSync(SKILLS_DIR).filter(
        (f) => f.endsWith(".md") && f !== "AGENT_CONVENTIONS.md" && f !== "README.md"
      )
    : [];

  it("finds at least the 8 real v1 Skill files under repo-root skills/", () => {
    expect(skillFiles.length).toBeGreaterThanOrEqual(8);
  });

  it.each(skillFiles)(
    "%s passes validateSkillFile against its real, committed content",
    (filename) => {
      const content = readFileSync(join(SKILLS_DIR, filename), "utf8");
      const result = validateSkillFile(content);
      if (!result.valid) {
        throw new Error(`${filename} failed validation:\n${result.errors.join("\n")}`);
      }
      expect(result.valid).toBe(true);
    }
  );
});
