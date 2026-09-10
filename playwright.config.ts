import { defineConfig, devices } from "@playwright/test";

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

  use: {
    trace: "on-first-retry",
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
  ],
});
