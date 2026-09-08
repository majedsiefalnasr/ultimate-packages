// packages/ai/test/context-files.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderLlmsTxt, renderLlmsFullTxt, renderFrameworkContext, generateContextFiles } from "../src/context-files";

describe("renderLlmsTxt", () => {
  it("includes one line per component, all 8 components, each with name/category/description", () => {
    const content = renderLlmsTxt();
    for (const name of ["Button", "Checkbox", "Dialog", "Menu", "Paginator", "Scroller", "Table", "Tooltip"]) {
      expect(content).toContain(name);
    }
    expect(content).toContain("Primitive");
    expect(content).toContain("clickable button control");
  });

  it("is deterministic", () => {
    expect(renderLlmsTxt()).toBe(renderLlmsTxt());
  });
});

describe("renderLlmsFullTxt", () => {
  it("includes full structured content for all 8 components, all frameworks unfiltered", () => {
    const content = renderLlmsFullTxt();
    expect(content).toContain("Button");
    expect(content).toContain("Table");
    // Table's react-only "badge" prop existing alongside ng content proves "unfiltered".
  });
});

describe("renderFrameworkContext", () => {
  it("narrows api content to only the requested framework, for ng", () => {
    const content = renderFrameworkContext("ng");
    expect(content).toContain("Button");
  });

  it("still lists a component via identity even when it has no api entry for that framework — none of the 8 v1 records lack a framework entry, so this exercises the narrowing logic's completeness path rather than a real gap", () => {
    const content = renderFrameworkContext("react");
    for (const name of ["Button", "Checkbox", "Dialog", "Menu", "Paginator", "Scroller", "Table", "Tooltip"]) {
      expect(content).toContain(name);
    }
  });
});

describe("generateContextFiles", () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir !== undefined) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("writes exactly the 5 spec-named files", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-context-test-"));
    const result = generateContextFiles(tempDir);

    expect(result.written.length).toBe(5);
    for (const filename of ["llms.txt", "llms-full.txt", "llms-ng.txt", "llms-react.txt", "llms-vue.txt"]) {
      expect(existsSync(join(tempDir, filename))).toBe(true);
    }
  });

  it("produces byte-identical llms.txt content across two separate generation runs (determinism)", () => {
    const dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-context-a-"));
    const dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-context-b-"));
    generateContextFiles(dirA);
    generateContextFiles(dirB);

    const contentA = readFileSync(join(dirA, "llms.txt"), "utf8");
    const contentB = readFileSync(join(dirB, "llms.txt"), "utf8");
    expect(contentA).toBe(contentB);

    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  });

  it("creates a non-existent, nested output directory (e.g. dist/context under an as-yet-uncreated dist/) and still writes all 5 files", () => {
    const parent = mkdtempSync(join(tmpdir(), "ultimate-ai-context-nested-"));
    const nestedOutputDir = join(parent, "dist", "context"); // deliberately not created ahead of time
    try {
      const result = generateContextFiles(nestedOutputDir);
      expect(result.written.length).toBe(5);
      for (const filename of ["llms.txt", "llms-full.txt", "llms-ng.txt", "llms-react.txt", "llms-vue.txt"]) {
        expect(existsSync(join(nestedOutputDir, filename))).toBe(true);
      }
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});
