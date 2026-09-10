import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

// `packages/ng/package.json` declares `"type": "module"`, so `require` is
// not a global here — a scoped `createRequire` is used instead, purely to
// read axe-core's installed version out of its own package.json (the exact
// version actually running the scan, not a hand-typed string that could
// drift from what's installed).
const { version: axeCoreVersion } = createRequire(import.meta.url)("axe-core/package.json") as {
  version: string;
};

/**
 * Shared by all 12 Angular Playwright specs (Task 6, R4.1/R4.2/PD-5/PD-12).
 *
 * Runs an axe-core accessibility scan against the currently-rendered
 * Storybook story using axe-core's own unconfigured default ruleset (no
 * `withRules`/`withTags`/`options` call — per this task's brief, which
 * forbids configuring `runOnly`/`rules`), then wraps the raw `axe.Results`
 * in the envelope shape `scripts/provenance/validate-accessibility-baseline.mjs`
 * expects and writes it to
 * `test-results/accessibility/ng/<browser>/<componentStoryId>.json`.
 *
 * `browser` is read from `testInfo.project.name` (e.g. "ng-chromium") with
 * the "ng-" prefix stripped, so the envelope's `browser` field is the bare
 * engine name ("chromium"/"firefox"/"webkit") per the envelope shape's own
 * documented example (`"browser": "chromium"`), not the full project name.
 */
export async function runAccessibilityScan(
  page: Page,
  testInfo: TestInfo,
  componentStoryId: string
): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();

  const browser = testInfo.project.name.replace(/^ng-/, "");
  const envelope = {
    componentStoryId,
    framework: "ng",
    browser,
    axeVersion: axeCoreVersion,
    scannedAt: new Date().toISOString(),
    results,
  };

  const outDir = `test-results/accessibility/ng/${browser}`;
  const outPath = `${outDir}/${componentStoryId}.json`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(envelope, null, 2), "utf8");
}

/** Storybook's documented iframe-rendering URL for a single story. */
export function storyUrl(storyId: string): string {
  return `http://localhost:6001/iframe.html?id=${storyId}&viewMode=story`;
}
