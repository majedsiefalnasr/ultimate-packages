import { defineConfig, devices } from "@playwright/test";

/**
 * Prime-parity verification runner (docs/architecture/PARITY_PLAYBOOK.md §6).
 * Separate from the root Playwright config, whose projects stay unchanged.
 * Chromium only. Run from the repository root:
 *   npx playwright test -c tooling/prime-reference/playwright.config.ts
 * Output: test-results/prime-parity/ (git-ignored; not committed, Playbook §4).
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "../../test-results/prime-parity-runner",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: "list",
  projects: [
    {
      name: "prime-parity-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: [
    {
      name: "prime-reference-vue",
      command: "pnpm --filter prime-reference-vue run dev",
      url: "http://localhost:6021",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      name: "prime-reference-ng",
      command: "pnpm --filter prime-reference-ng run dev",
      url: "http://localhost:6022",
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      name: "ng-storybook",
      command: "pnpm --filter @ultimate/ng exec ng run ng:storybook --port=6001 --compodoc=false",
      url: "http://localhost:6001",
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      name: "vue-storybook",
      command: "pnpm --filter @ultimate/vue exec storybook dev -p 6003",
      url: "http://localhost:6003",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
