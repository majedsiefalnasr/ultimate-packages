import { defineConfig, devices } from "@playwright/test";

type TrackEFramework = "ng" | "react" | "vue";

interface TrackESsrServer {
  name: string;
  command: string;
  url: string;
  reuseExistingServer: boolean;
  timeout: number;
}

/**
 * Track E SSR/hydration `webServer` entries, keyed by framework, kept
 * separate from Track A's own 3 Storybook `webServer` entries above (which
 * remain declared unconditionally, exactly as before).
 *
 * Only the `ng` key is populated by this task (the Angular SSR harness,
 * `apps/playground-angular`, port 6011). Later tasks add their own `react`/
 * `vue` keys here — this object and the `TRACK_E_SSR_FRAMEWORK` selection
 * logic below are written generically enough that adding those keys never
 * requires touching the selection logic itself.
 */
const trackESsrServers: Partial<Record<TrackEFramework, TrackESsrServer>> = {
  ng: {
    name: "ng-ssr-server",
    command: "pnpm --filter playground-angular run start",
    url: "http://localhost:6011",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};

/**
 * `TRACK_E_SSR_FRAMEWORK`-driven selection: when set to one of the framework
 * keys above, only that framework's Track E `webServer` entry is included in
 * the final array (used to start exactly one SSR server in isolation, e.g.
 * for AC5.6's port-inspection check). When unset, every entry currently in
 * `trackESsrServers` is included — with only `ng` populated so far, unset and
 * `TRACK_E_SSR_FRAMEWORK=ng` behave identically; this is what allows a
 * combined local run across all three frameworks once react/vue keys exist.
 */
const trackESsrFrameworkFilter = process.env.TRACK_E_SSR_FRAMEWORK as TrackEFramework | undefined;
const trackESsrWebServers: TrackESsrServer[] = trackESsrFrameworkFilter
  ? [trackESsrServers[trackESsrFrameworkFilter]].filter((entry): entry is TrackESsrServer => entry !== undefined)
  : Object.values(trackESsrServers).filter((entry): entry is TrackESsrServer => entry !== undefined);

/**
 * Root Playwright configuration shared by all three framework packages
 * (@ultimate/ng, @ultimate/react, @ultimate/vue).
 *
 * Playwright is installed once at the repo root because it is a
 * framework-agnostic browser-driving tool: the same @playwright/test
 * binary and API drive all nine projects below identically, regardless
 * of which UI framework a given project's Storybook instance renders.
 *
 * There is deliberately no top-level `testDir`. Each of the 9 projects
 * below sets its own `testDir`, scoping it to exactly one framework's
 * own `e2e/` directory. This is Playwright's documented project-level
 * override behavior for `testDir` and is required here because the
 * three frameworks' end-to-end specs live in three separate,
 * package-local `e2e/` directories rather than one shared directory.
 *
 * `testMatch` is intentionally left unset so it falls back to
 * Playwright's own default (`**\/*.@(spec|test).?(c|m)[jt]s?(x)`) --
 * each project's `testDir` already scopes discovery correctly.
 */
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  /**
   * Platform-independent snapshot path (resolves whole-branch-review
   * Critical finding C1): Playwright's own default snapshot path
   * template embeds `{platform}` (i.e. `process.platform` -- `darwin`
   * locally, `linux` in CI), so baselines generated on a macOS
   * development machine and baselines looked up by the `ubuntu-latest`
   * CI runner resolve to two different filenames. Since this repository
   * has exactly one baseline set -- generated once, in a Linux container
   * matching the real CI runner (see the remediation's own report for
   * the exact command used), not on this developer's own host OS -- the
   * template below deliberately omits `{platform}` while preserving
   * every other identity component (test file directory/name, the
   * story/assertion `{arg}` title, and `{projectName}`, which already
   * disambiguates ng/react/vue x chromium/firefox/webkit -- the platform
   * token was never load-bearing for uniqueness here, only for cross-OS
   * safety this repository does not need since CI is the only place
   * these baselines are ever regenerated from).
   */
  snapshotPathTemplate: "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}",

  use: {
    trace: "on-first-retry",
  },

  /**
   * Explicit resolution of spec OQ-1 (screenshot-diff pixel tolerance):
   * Playwright's own documented default for `toHaveScreenshot()` is
   * `threshold: 0.2` (a per-pixel YIQ color-difference tolerance) with
   * `maxDiffPixelRatio` left unset -- verified directly against
   * Playwright's official docs during the original Implementation Plan's
   * own research (see the plan's PD-1). This block makes that choice
   * explicit in configuration rather than relying on an undocumented
   * implicit default, per the whole-branch review's Important finding
   * I1. The value itself is UNCHANGED from what the branch has already
   * been running against throughout Tasks 6-9 -- this remediation does
   * not loosen or tighten the gate, only names the number it was always
   * using.
   */
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
    },
  },

  projects: [
    // Angular (@ultimate/ng)
    {
      name: "ng-chromium",
      testDir: "./packages/ng/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "ng-firefox",
      testDir: "./packages/ng/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "ng-webkit",
      testDir: "./packages/ng/e2e",
      use: { ...devices["Desktop Safari"] },
    },

    // React (@ultimate/react)
    {
      name: "react-chromium",
      testDir: "./packages/react/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "react-firefox",
      testDir: "./packages/react/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "react-webkit",
      testDir: "./packages/react/e2e",
      use: { ...devices["Desktop Safari"] },
    },

    // Vue (@ultimate/vue)
    {
      name: "vue-chromium",
      testDir: "./packages/vue/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "vue-firefox",
      testDir: "./packages/vue/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "vue-webkit",
      testDir: "./packages/vue/e2e",
      use: { ...devices["Desktop Safari"] },
    },

    // Track E SSR/hydration harnesses (Chromium only, per binding decision).
    {
      name: "ng-ssr-chromium",
      testDir: "./apps/playground-angular/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /**
   * One Storybook dev server per framework, on fixed ports distinct from
   * each package's own default Storybook dev-server port (6006), so a
   * developer's manually-running Storybook instance never collides with
   * the instance Playwright launches for its own test run.
   *
   * `url` (not `port`) is used for readiness: `port` alone only waits
   * for a TCP socket to accept connections, which for a webpack/Vite dev
   * server can happen before the dev-server middleware has actually
   * finished compiling and is able to serve the app. `url` waits for a
   * real HTTP response (2xx/3xx/400-403), which is the more deterministic
   * signal that the Storybook instance is actually ready to serve pages
   * for the e2e/visual/accessibility tests that will run against it.
   *
   * Angular's Storybook instance can only be started via the Angular CLI
   * architect target (`ng run ng:storybook`) -- Storybook's bare
   * `storybook dev` CLI does not work for this package, per Task 1's
   * findings (see packages/ng/angular.json's `storybook` target). The
   * `--compodoc=false` override is required because `@compodoc/compodoc`
   * is not installed in this repo; without it, the architect target's
   * default Compodoc documentation-generation step fails before the dev
   * server ever starts.
   *
   * React and Vue's Storybook instances start directly via their own
   * `storybook dev -p <port>` package.json scripts (confirmed in Tasks 2
   * and 3 -- no Angular-style CLI restriction applies to either).
   */
  webServer: [
    {
      name: "ng-storybook",
      command: "pnpm --filter @ultimate/ng exec ng run ng:storybook --port=6001 --compodoc=false",
      url: "http://localhost:6001",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      name: "react-storybook",
      command: "pnpm --filter @ultimate/react exec storybook dev -p 6002",
      url: "http://localhost:6002",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      name: "vue-storybook",
      command: "pnpm --filter @ultimate/vue exec storybook dev -p 6003",
      url: "http://localhost:6003",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    ...trackESsrWebServers,
  ],
});
