import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

// `packages/vue/package.json` declares `"type": "module"`, so `require` is
// not a global here — a scoped `createRequire` is used instead, purely to
// read axe-core's installed version out of its own package.json (the exact
// version actually running the scan, not a hand-typed string that could
// drift from what's installed).
const { version: axeCoreVersion } = createRequire(import.meta.url)("axe-core/package.json") as {
  version: string;
};

/**
 * Shared by all 9 Vue Playwright specs (Task 8, R4.1/R4.2/PD-5/PD-12).
 *
 * Runs an axe-core accessibility scan against the currently-rendered
 * Storybook story using axe-core's own unconfigured default ruleset (no
 * `withRules`/`withTags`/`options` call — per this task's brief, which
 * forbids configuring `runOnly`/`rules`), then wraps the raw `axe.Results`
 * in the envelope shape `scripts/provenance/validate-accessibility-baseline.mjs`
 * expects and writes it to
 * `test-results/accessibility/vue/<browser>/<componentStoryId>.json`.
 *
 * `browser` is read from `testInfo.project.name` (e.g. "vue-chromium")
 * with the "vue-" prefix stripped, so the envelope's `browser` field is
 * the bare engine name ("chromium"/"firefox"/"webkit") per the envelope
 * shape's own documented example (`"browser": "chromium"`), not the full
 * project name.
 */
export async function runAccessibilityScan(
  page: Page,
  testInfo: TestInfo,
  componentStoryId: string
): Promise<void> {
  // Task 6 review (mirrored here verbatim for Vue, PD-9/PD-12, same fix
  // React's Task 7 already re-confirmed) found real, reproducible
  // cross-run flakiness: scanning immediately after navigation/hover can
  // sample a transient mid-CSS-transition color (e.g. during Dialog's
  // `<transition :css="false">`-driven enter transition, applied via
  // @ultimate/uix-motion's `createMotionTransitionHooks`/`resolveDuration`
  // pipeline — confirmed here too, since Vue's Dialog/Menu use the same
  // motion pipeline as Angular's/React's), which axe reports as a
  // false-positive color-contrast violation against a value that never
  // appears in the component's resolved theme tokens.
  //
  // `document.getAnimations()` alone is insufficient here: it only reports
  // animations the browser has already started as CSSTransition/
  // CSSAnimation objects, and there is a real gap between the motion
  // library adding its transition class and the browser registering the
  // resulting transition (confirmed empirically on Angular's Dialog in
  // Task 6 — a single point-in-time getAnimations() check still raced the
  // true positive). Instead, read every element's own computed longest
  // transition/animation duration directly (the same
  // `getComputedStyle(...).transitionDuration`/`animationDuration` source
  // @ultimate/uix-motion's own `resolveDuration` reads) and wait that long
  // past navigation, so this settle wait tracks whatever duration a
  // component's real theme/motion config actually resolves to, rather
  // than a hardcoded, component-specific magic number.
  const settleMs = await page.evaluate(() => {
    let longest = 0;
    for (const el of document.querySelectorAll("*")) {
      const style = getComputedStyle(el);
      for (const raw of [...style.transitionDuration.split(","), ...style.animationDuration.split(",")]) {
        const trimmed = raw.trim();
        const seconds = trimmed.endsWith("ms")
          ? parseFloat(trimmed) / 1000
          : parseFloat(trimmed);
        if (Number.isFinite(seconds)) longest = Math.max(longest, seconds);
      }
    }
    return longest * 1000;
  });
  if (settleMs > 0) {
    await page.waitForTimeout(settleMs + 50);
  }

  const results = await new AxeBuilder({ page }).analyze();

  const browser = testInfo.project.name.replace(/^vue-/, "");
  const envelope = {
    componentStoryId,
    framework: "vue",
    browser,
    axeVersion: axeCoreVersion,
    scannedAt: new Date().toISOString(),
    results,
  };

  const outDir = `test-results/accessibility/vue/${browser}`;
  const outPath = `${outDir}/${componentStoryId}.json`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(envelope, null, 2), "utf8");
}

/**
 * Storybook's documented iframe-rendering URL for a single story.
 *
 * `globals=a11y.manual:!true` stops `@storybook/addon-a11y` from running its
 * own automatic axe scan after each render. That scan lazily loads a second
 * axe-core instance that replaces `window.axe` while `runAccessibilityScan`
 * is running, so our scan could land on the addon's in-flight run and fail
 * with "Axe is already running" (X-8 diagnostic, 2026-10-07).
 */
export function storyUrl(storyId: string): string {
  return `http://localhost:6003/iframe.html?id=${storyId}&viewMode=story&globals=a11y.manual:!true`;
}
