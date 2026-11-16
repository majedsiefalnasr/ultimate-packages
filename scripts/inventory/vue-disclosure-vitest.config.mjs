import original from "../../packages/vue/vitest.config.ts";

// Inventory-only test override: host PostCSS configuration requires an unavailable
// postcss-import dependency. This keeps Vue test settings and skips CSS processing.
export default {
  ...original,
  css: { postcss: { plugins: [] } },
};
