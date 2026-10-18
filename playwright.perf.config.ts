import { defineConfig, devices } from "@playwright/test";

/**
 * ADR-057 Stage 1 performance harness (Spec B4-R1). Separate from the root
 * `playwright.config.ts`, whose projects only scan `packages/*\/e2e` and
 * `apps/*\/e2e` with the default `*.spec|test.*` match, so `*.perf.ts` is
 * never picked up there.
 *
 * Protocol (methods research §3): Chromium, viewport 1280 × 720, no CPU or
 * network throttling. The webServer entries serve each playground's built,
 * client-only perf page (`build:perf`); nothing is built here.
 */
const viewport = { width: 1280, height: 720 };
// Same values as PERF_PAGE_PORTS in scripts/perf/stage1-subjects.mjs. Not
// imported: loading that module here (CommonJS) breaks its later ESM import
// by the spec's runner.
const PERF_PAGE_PORTS = { ng: 6021, react: 6022, vue: 6023 };

export default defineConfig({
  testDir: "./scripts/perf",
  testMatch: "**/*.perf.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "line",
  use: { trace: "retain-on-failure" },
  projects: [{ name: "perf-chromium", use: { ...devices["Desktop Chrome"], viewport } }],
  webServer: (["ng", "react", "vue"] as const).map((framework) => ({
    name: `${framework}-perf-page`,
    command: `node scripts/perf/serve-perf-page.mjs ${framework}`,
    url: `http://localhost:${PERF_PAGE_PORTS[framework]}/perf/button`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
