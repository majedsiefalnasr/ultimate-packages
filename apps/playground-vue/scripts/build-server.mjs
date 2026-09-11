// Final sub-step of the "build" script. By this point package.json's
// "build" script has already run two `vite build` invocations:
//
// 1. `vite build` (default, non-SSR) -> dist/client/** (browser bundle).
// 2. `vite build --ssr src/entry-server.ts --outDir dist` -> dist/
//    entry-server.js — the Vue-SFC-compiled (via @vitejs/plugin-vue),
//    Node-runnable SSR bundle. This is Vue's own documented production SSR
//    build shape (vuejs.org/guide/scaling-up/ssr.html, "Higher Level
//    Solutions" / Vite's own `build:server` example: `vite build --outDir
//    dist/server --ssr src/entry-server.js`), adapted here to land
//    directly at dist/entry-server.js (flat `--outDir dist` + vite.config.ts's
//    fixed `entryFileNames: "entry-server.js"`) rather than a nested
//    dist/server/ subdirectory, matching what server.js's own
//    `import("./entry-server.js")` and the "start" script's `node
//    dist/server.js` expect.
//
// This script's own job is the remaining, non-Vite sub-step: copy the
// plain-JavaScript server.js (no .ts/.vue syntax, so no compilation step is
// needed for it) into dist/server.js — landing everything under one dist/
// tree before "build" exits, per the harness's binding one-script-chains-
// sub-steps contract (server.js and entry-server.js are separate,
// independently-inspectable artifacts, never combined into one file).
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

await copyFile(
  fileURLToPath(new URL("../server.js", import.meta.url)),
  fileURLToPath(new URL("../dist/server.js", import.meta.url)),
);

console.log("Server build complete: dist/entry-server.js, dist/server.js");
