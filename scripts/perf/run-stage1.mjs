#!/usr/bin/env node
// scripts/perf/run-stage1.mjs
//
// ADR-057 Stage 1 runner (Spec B4-R1), categories P1–P8. It measures and
// records; it gates nothing and builds nothing. Missing builds fail loudly.
//
//   P1  package size: measurePackage() from scripts/provenance/measure-package-size.mjs.
//   P2  tree-shaking: delegates to scripts/perf/measure-tree-shaking.mjs.
//   P3–P7  the playgrounds' client-only perf pages (`build:perf`), driven
//       through window.__perf (scripts/perf/browser/harness.ts).
//   P8  the playgrounds' existing SSR servers (`build`): server render time,
//       time to the client `u-perf:hydrated` mark, hydration warnings.
//
// Protocol (methods research §3): Chromium, viewport 1280 × 720, no
// throttling. For browser categories each of the R repeats uses a fresh
// browser context; in each, W warm-up iterations are discarded and I are
// recorded. `samples` pools the R × I values; `runs` keeps them per repeat
// (for sameCommitDiff). P1 and P2 are deterministic: protocol {W:0,R:1,I:1}.
//
// Usage:
//   node scripts/perf/run-stage1.mjs [--categories P1,P3] [--W 5] [--R 10] [--I 20]
//     [--out perf-results/stage1-<sha>.json]
// The output file is a JSON array with one artifact per category, each
// { identity, protocol: { W, R, I }, category, results: [...] }.
//
// installObservers() and pageIteration() run inside the page (Playwright
// serializes them), hence the browser globals below.
/* global window, document, performance, PerformanceObserver */

import { chromium } from "@playwright/test";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { ALL_PUBLISHABLE_PACKAGES, measurePackage } from "../provenance/measure-package-size.mjs";
import { runIdentity } from "./run-identity.mjs";
import { servePerfPage } from "./serve-perf-page.mjs";
import { summarize } from "./stage1-stats.mjs";
import {
  CATEGORY_SUBJECTS,
  FRAMEWORKS,
  MOTION_VARIANTS,
  PERF_PAGE_PORTS,
  SCROLL_STEPS,
  SCROLL_STEP_PX,
  SSR_SERVERS,
  isBuilt,
} from "./stage1-subjects.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const ALL_CATEGORIES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
export const BROWSER_CATEGORIES = ["P3", "P4", "P5", "P6", "P7"];
export const DEFAULT_PROTOCOL = { W: 5, R: 10, I: 20 };
export const DETERMINISTIC_PROTOCOL = { W: 0, R: 1, I: 1 };
export const VIEWPORT = { width: 1280, height: 720 };

/** Console text that reports a hydration mismatch (Angular NG05xx, React #418–#425, Vue). */
export const HYDRATION_WARNING =
  /hydrat|NG05\d\d|Minified React error #(418|419|421|422|423|425)\b/i;

// ---------------------------------------------------------------- pure logic

/** Parses CLI arguments. Throws on anything it does not understand. */
export function parseArgs(argv) {
  const options = { categories: [...ALL_CATEGORIES], protocol: { ...DEFAULT_PROTOCOL }, out: null };
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${flag} needs a value`);
    if (flag === "--categories") {
      const list = value.split(",").map((name) => name.trim().toUpperCase());
      const unknown = list.filter((name) => !ALL_CATEGORIES.includes(name));
      if (unknown.length > 0 || list.length === 0) {
        throw new Error(`unknown category: ${unknown.join(", ") || value}`);
      }
      options.categories = ALL_CATEGORIES.filter((name) => list.includes(name));
    } else if (flag === "--W" || flag === "--R" || flag === "--I") {
      const number = Number(value);
      const min = flag === "--W" ? 0 : 1;
      if (!Number.isInteger(number) || number < min) {
        throw new Error(`${flag} must be an integer >= ${min}, got "${value}"`);
      }
      options.protocol[flag.slice(2)] = number;
    } else if (flag === "--out") {
      options.out = value;
    } else {
      throw new Error(`unknown argument: ${flag}`);
    }
  }
  return options;
}

export function defaultOutPath(sha) {
  return `perf-results/stage1-${sha === "unknown" ? "unknown" : sha.slice(0, 12)}.json`;
}

/** Subjects of a browser category for one framework, split into built and not built. */
export function plannedSubjects(category, framework) {
  const entries = CATEGORY_SUBJECTS[category].map((entry) =>
    typeof entry === "string" ? { subject: entry } : entry
  );
  return {
    built: entries.filter(({ subject }) => isBuilt(framework, subject)),
    notBuilt: entries
      .filter(({ subject }) => !isBuilt(framework, subject))
      .map(({ subject }) => ({
        subject: `${framework}:${subject}`,
        framework,
        status: "not built",
      })),
  };
}

/** One metric's result from per-repeat sample arrays. */
export function pooledResult({ subject, framework, metric, runs, ...extra }) {
  const samples = runs.flat();
  return { subject, framework, metric, ...extra, samples, summary: summarize(samples), runs };
}

/**
 * Turns per-repeat iteration records ([{ metric: number | number[] }]) into
 * one pooled result per metric. Array values (P6 frame durations) are flattened.
 */
export function resultsFromRecords(base, recordsPerRun) {
  const metrics = Object.keys(recordsPerRun[0]?.[0] ?? {});
  return metrics.map((metric) =>
    pooledResult({
      ...base,
      metric,
      runs: recordsPerRun.map((records) => records.flatMap((record) => record[metric])),
    })
  );
}

export function assembleArtifact({ identity, protocol, category, results, ...extra }) {
  return { identity, protocol, category, results, ...extra };
}

/** Review Focus 5: every built P7 subject needs a result set for every motion variant. */
export function assertVariants(results, framework) {
  for (const { subject } of plannedSubjects("P7", framework).built) {
    for (const { variant } of MOTION_VARIANTS) {
      const found = results.some(
        (result) => result.subject === `${framework}:${subject}` && result.variant === variant
      );
      if (!found) throw new Error(`P7 ${framework}:${subject} has no "${variant}" result set`);
    }
  }
}

export function hydrationWarningCount(messages) {
  return messages.filter(
    ({ type, text }) => (type === "error" || type === "warning") && HYDRATION_WARNING.test(text)
  ).length;
}

// ----------------------------------------------------------- browser driver

/** Installed in every perf-page context: long-task and layout-shift counters. */
function installObservers() {
  window.__perfObserved = { longTasks: 0, layoutShifts: 0 };
  const count = (type, key) => {
    try {
      new PerformanceObserver((list) => {
        window.__perfObserved[key] += list.getEntries().length;
      }).observe({ type });
    } catch {
      // The entry type is unsupported in this browser; the count stays 0.
    }
  };
  count("longtask", "longTasks");
  count("layout-shift", "layoutShifts");
}

/** One measured iteration inside the page. Returns { metric: number | number[] }. */
async function pageIteration({ category, subject, kind, steps, stepPx }) {
  const perf = window.__perf;
  const root = document.getElementById("perf-root");
  const durations = (phase) =>
    performance.getEntriesByName(`u-perf:${subject}:${phase}`, "measure").map((e) => e.duration);
  const last = (phase) => durations(phase).at(-1);
  const resetObserved = () =>
    Object.assign(window.__perfObserved, { longTasks: 0, layoutShifts: 0 });
  const rows = () => root.querySelectorAll("[data-u-scroller-item], tbody > tr").length;
  let record;
  if (category === "P3") {
    await perf.mount();
    const domNodes = root.getElementsByTagName("*").length;
    await perf.unmount();
    record = { mount: last("mount"), unmount: last("unmount"), domNodes };
  } else if (category === "P4") {
    resetObserved();
    await perf.mount();
    const { longTasks, layoutShifts } = window.__perfObserved;
    record = { firstRender: last("mount"), longTasks, layoutShifts };
    await perf.unmount();
  } else if (category === "P5") {
    await perf.mount();
    await perf.update(kind);
    record = {
      [`update-${kind}`]: last(`update-${kind}`),
      domNodes: root.getElementsByTagName("*").length,
    };
    await perf.unmount();
  } else if (category === "P6") {
    await perf.mount();
    resetObserved();
    for (let i = 0; i < steps; i++) await perf.scroll(stepPx);
    record = {
      frameDuration: durations("scroll").slice(-steps),
      longTasks: window.__perfObserved.longTasks,
      renderedRows: rows(),
    };
    await perf.unmount();
  } else if (category === "P7") {
    await perf.mount();
    const before = document.getElementsByTagName("*").length;
    await perf.open();
    await perf.close();
    record = {
      openToVisible: last("open"),
      closeToRemoved: last("close"),
      domNodeDeltaAfterClose: document.getElementsByTagName("*").length - before,
    };
    await perf.unmount();
  } else {
    throw new Error(`pageIteration: not a browser category: ${category}`);
  }
  performance.clearMarks();
  performance.clearMeasures();
  return record;
}

/** One repeat: fresh context, W discarded iterations, I recorded ones. */
async function measureRepeat(browser, framework, category, entry, protocol, reducedMotion) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  try {
    await context.addInitScript(installObservers);
    const page = await context.newPage();
    if (reducedMotion) await page.emulateMedia({ reducedMotion });
    await page.goto(`http://localhost:${PERF_PAGE_PORTS[framework]}/perf/${entry.subject}`);
    await page.waitForFunction(() => typeof window.__perf?.mount === "function");
    const args = { category, ...entry, steps: SCROLL_STEPS, stepPx: SCROLL_STEP_PX };
    for (let i = 0; i < protocol.W; i++) await page.evaluate(pageIteration, args);
    const records = [];
    for (let i = 0; i < protocol.I; i++) records.push(await page.evaluate(pageIteration, args));
    return records;
  } finally {
    await context.close();
  }
}

/** P3–P7 for one framework. The perf page server must already be listening. */
export async function measureBrowserCategory(browser, category, framework, protocol) {
  const { built, notBuilt } = plannedSubjects(category, framework);
  const variants = category === "P7" ? MOTION_VARIANTS : [{ reducedMotion: null }];
  const results = [];
  for (const entry of built) {
    for (const { variant, reducedMotion } of variants) {
      const recordsPerRun = [];
      for (let r = 0; r < protocol.R; r++) {
        recordsPerRun.push(
          await measureRepeat(browser, framework, category, entry, protocol, reducedMotion)
        );
      }
      const base = { subject: `${framework}:${entry.subject}`, framework };
      if (entry.kind) base.kind = entry.kind;
      if (variant) base.variant = variant;
      results.push(...resultsFromRecords(base, recordsPerRun));
    }
  }
  if (category === "P7") assertVariants(results, framework);
  return [...results, ...notBuilt];
}

// ---------------------------------------------------------------------- P8

async function isListening(url) {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

async function startSsrServer(framework) {
  const { entry, port } = SSR_SERVERS[framework];
  const file = resolve(repoRoot, entry);
  if (!existsSync(file)) {
    throw new Error(`P8: ${entry} is missing. Run "pnpm --filter <playground> run build" first.`);
  }
  const url = `http://localhost:${port}/`;
  if (await isListening(url))
    throw new Error(`P8: port ${port} is already in use; stop that server`);
  const child = spawn(process.execPath, [file], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "ignore", "inherit"],
  });
  for (let i = 0; i < 300; i++) {
    if (child.exitCode !== null)
      throw new Error(`P8: ${framework} SSR server exited (${child.exitCode})`);
    if (await isListening(url)) return { child, url };
    await delay(100);
  }
  child.kill();
  throw new Error(`P8: ${framework} SSR server did not answer on ${url} within 30 s`);
}

async function serverRenderTime(url) {
  const start = performance.now();
  const response = await fetch(url);
  await response.text();
  if (!response.ok) throw new Error(`P8: ${url} answered ${response.status}`);
  return performance.now() - start;
}

async function hydrationSample(page, url) {
  const messages = [];
  const onConsole = (message) => messages.push({ type: message.type(), text: message.text() });
  page.on("console", onConsole);
  await page.goto(url);
  await page.waitForFunction(() => performance.getEntriesByName("u-perf:hydrated").length > 0);
  const timeToHydrated = await page.evaluate(
    () => performance.getEntriesByName("u-perf:hydrated")[0].startTime
  );
  page.off("console", onConsole);
  return { timeToHydrated, hydrationWarnings: hydrationWarningCount(messages) };
}

export async function measureP8(browser, framework, protocol) {
  const { child, url } = await startSsrServer(framework);
  try {
    const recordsPerRun = [];
    for (let r = 0; r < protocol.R; r++) {
      const context = await browser.newContext({ viewport: VIEWPORT });
      try {
        const page = await context.newPage();
        const records = [];
        for (let i = 0; i < protocol.W + protocol.I; i++) {
          const serverRender = await serverRenderTime(url);
          const record = { serverRender, ...(await hydrationSample(page, url)) };
          if (i >= protocol.W) records.push(record);
        }
        recordsPerRun.push(records);
      } finally {
        await context.close();
      }
    }
    return resultsFromRecords({ subject: `${framework}:ssr-page`, framework }, recordsPerRun);
  } finally {
    child.kill();
  }
}

// ------------------------------------------------------------------- P1, P2

function measureP1() {
  return ALL_PUBLISHABLE_PACKAGES.flatMap((name) => {
    const dir = join(repoRoot, "packages", name);
    if (!existsSync(join(dir, "dist"))) {
      throw new Error(`P1: packages/${name}/dist is missing. Run "pnpm run build" first.`);
    }
    const measured = measurePackage(dir);
    return ["bytes", "gzipBytes", "fileCount"].map((metric) =>
      pooledResult({ subject: `@ultimate/${name}`, metric, runs: [[measured[metric]]] })
    );
  });
}

function measureP2() {
  const out = join(mkdtempSync(join(tmpdir(), "stage1-p2-")), "p2.json");
  execFileSync(
    process.execPath,
    [join(repoRoot, "scripts/perf/measure-tree-shaking.mjs"), "--out", out],
    {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "inherit"],
    }
  );
  return JSON.parse(readFileSync(out, "utf8"));
}

// --------------------------------------------------------------------- main

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const identity = runIdentity();
  const out = resolve(repoRoot, options.out ?? defaultOutPath(identity.sha));
  const needsBrowser = options.categories.some((c) => BROWSER_CATEGORIES.includes(c) || c === "P8");
  const needsPages = options.categories.some((c) => BROWSER_CATEGORIES.includes(c));

  const servers = needsPages ? await Promise.all(FRAMEWORKS.map((fw) => servePerfPage(fw))) : [];
  const browser = needsBrowser ? await chromium.launch() : null;
  const browserIdentity = browser
    ? { ...identity, browser: `chromium ${browser.version()}` }
    : identity;
  const artifacts = [];
  try {
    for (const category of options.categories) {
      console.log(`[run-stage1] ${category} ...`);
      if (category === "P1") {
        artifacts.push(
          assembleArtifact({
            identity,
            protocol: DETERMINISTIC_PROTOCOL,
            category,
            results: measureP1(),
          })
        );
      } else if (category === "P2") {
        artifacts.push(measureP2());
      } else {
        const results = [];
        for (const framework of FRAMEWORKS) {
          results.push(
            ...(category === "P8"
              ? await measureP8(browser, framework, options.protocol)
              : await measureBrowserCategory(browser, category, framework, options.protocol))
          );
        }
        artifacts.push(
          assembleArtifact({
            identity: browserIdentity,
            protocol: options.protocol,
            category,
            results,
          })
        );
      }
      const last = artifacts.at(-1);
      const notBuilt = last.results.filter((result) => result.status === "not built").length;
      console.log(
        `[run-stage1] ${category}: ${last.results.length - notBuilt} results, ${notBuilt} not built`
      );
    }
  } finally {
    await browser?.close();
    for (const server of servers) server.close();
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(artifacts, null, 2)}\n`);
  console.log(`[run-stage1] wrote ${artifacts.length} artifact(s) to ${out}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[run-stage1] FATAL: ${error.message}`);
    process.exit(1);
  });
}
