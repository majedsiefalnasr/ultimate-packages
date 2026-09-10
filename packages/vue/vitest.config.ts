import { configDefaults, defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
    // Excludes e2e/ explicitly: Vitest's own default include glob
    // (**/*.{test,spec}.?(c|m)[jt]s?(x)) would otherwise also match
    // packages/vue/e2e/*.spec.ts (Task 8's real-browser Playwright specs,
    // run exclusively via the root playwright.config.ts) and try to
    // execute them under jsdom, which fails immediately since
    // Playwright's test.describe() refuses to run outside its own runner
    // (same fix Task 7 applied to React's vitest.config.ts). Vitest's own
    // default excludes (node_modules, dist, etc.) are merged in
    // automatically alongside this addition, not replaced by it.
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "./coverage",
    },
  },
});
