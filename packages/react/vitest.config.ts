import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Excludes e2e/ explicitly: Vitest's own default include glob
    // (**/*.{test,spec}.?(c|m)[jt]s?(x)) would otherwise also match
    // packages/react/e2e/*.spec.tsx (Task 7's real-browser Playwright
    // specs, run exclusively via the root playwright.config.ts) and try
    // to execute them under jsdom, which fails immediately since
    // Playwright's test.describe() refuses to run outside its own runner.
    // Vitest's own default excludes (node_modules, dist, etc.) are merged
    // in automatically alongside this addition, not replaced by it.
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}"],
      extension: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts", ".vue"],
      exclude: [
        "src/**/*.stories.*",
        "src/**/*.spec.*",
        "src/**/*.test.*",
        "src/**/*.d.ts",
        "src/**/*.d.mts",
        "src/**/*.d.cts",
        "src/**/{__tests__,__fixtures__,__mocks__,fixtures,test-fixtures,mocks}/**",
      ],
    },
  },
});
