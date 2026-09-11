// Second sub-step of the "build" script (the first is `vite build`, the
// client bundle). Compiles the two server-side TypeScript sources
// (src/entry-server.tsx, server.ts) into plain Node-runnable ESM
// JavaScript under dist/, as separate, independently-inspectable
// artifacts per AC3.1: dist/entry-server.js and dist/server.js. Bundling
// (rather than a plain per-file tsc emit) is used so each output resolves
// its own workspace-package/npm-dependency imports without needing
// node_modules symlink resolution tricks at runtime, while local relative
// imports (entry-server.tsx -> App.tsx) are inlined into the same file.
//
// esbuild, not tsc, performs this compile step (the plan's "tsc (or
// esbuild, implementer's choice)" sub-step) — chosen so both outputs can
// be produced as flat, exact `dist/*.js` paths (matching what server.ts's
// own `import("./entry-server.js")` and the "start" script's
// `node dist/server.js` expect) without fighting tsc's directory-mirroring
// output layout.
import { build } from "esbuild";

const shared = {
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: true,
  // Anything resolvable from node_modules (react, react-dom, express, the
  // @ultimate/* workspace packages, etc.) stays a real runtime import
  // rather than being inlined — only same-package relative source
  // (src/App.tsx into src/entry-server.tsx) is bundled together.
  packages: "external",
};

await build({
  ...shared,
  entryPoints: ["src/entry-server.tsx"],
  outfile: "dist/entry-server.js",
});

await build({
  ...shared,
  entryPoints: ["server.ts"],
  outfile: "dist/server.js",
});

console.log("Server build complete: dist/entry-server.js, dist/server.js");
