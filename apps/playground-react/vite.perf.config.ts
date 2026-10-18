import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Client-only build of the ADR-057 Stage 1 perf page (`build:perf`), kept
 * apart from vite.config.ts so the SSR harness build and its output are
 * unchanged. Output: dist/perf (index.html plus assets), served by
 * scripts/perf/serve-perf-page.mjs.
 */
export default defineConfig({
  plugins: [react()],
  root: fileURLToPath(new URL("./src/perf", import.meta.url)),
  base: "/",
  build: {
    outDir: fileURLToPath(new URL("./dist/perf", import.meta.url)),
    emptyOutDir: true,
  },
});
