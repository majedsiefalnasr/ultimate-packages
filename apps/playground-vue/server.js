import express from "express";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Router-less Express SSR server with exactly one page. On every request it
 * imports the already-compiled server entry (dist/entry-server.js, never
 * .ts/.vue source) and calls its `render()` (Vue's `renderToString`, per
 * vuejs.org/guide/scaling-up/ssr.html), wrapping the resulting HTML string
 * in the page shell. dist/client/** (the Vite-built browser bundle) is
 * served as static assets for the shell's own <script> tag reference to
 * resolve.
 *
 * Plain JavaScript (not compiled from .ts) — this file has no
 * TypeScript-only syntax and no .vue imports, so it is copied verbatim into
 * dist/server.js by the "build" script's second sub-step rather than run
 * through a bundler; either way, "start" only ever runs the dist/ copy, and
 * never this source file, satisfying the harness's binding
 * no-compile-at-request-time rule.
 */
const here = dirname(fileURLToPath(import.meta.url));
// Both dist/server.js (compiled output, real runtime location) and this
// source file server.js (package root, verbatim-copy source) resolve
// `here` to their own directory — dist/entry-server.js and dist/client sit
// alongside dist/server.js in both cases, so a single relative path works
// whether this file is read as source or as the copied dist/server.js.
const entryServerPath = join(here, "entry-server.js");
const clientDistPath = resolve(here, "client");
const clientBundlePath = join(clientDistPath, "entry-client.js");

if (!existsSync(entryServerPath)) {
  throw new Error(
    `Compiled server entry not found at ${entryServerPath}. Run the "build" script before "start".`
  );
}
if (!existsSync(clientBundlePath)) {
  throw new Error(
    `Compiled client bundle not found at ${clientBundlePath}. Run the "build" script before "start".`
  );
}

const { render } = await import(entryServerPath);

const app = express();

// Served at the root path (not under a "/client" prefix) so the page
// shell's own <script src="/entry-client.js"> reference resolves directly.
app.use(
  express.static(clientDistPath, {
    index: false,
    redirect: false,
  })
);

const HTML_HEAD =
  '<!doctype html><html><head><meta charset="utf-8">' +
  '<title>Ultimate Vue SSR Proof</title></head><body><div id="app">';
const HTML_TAIL = '</div><script type="module" src="/entry-client.js"></script></body></html>';

app.get("/", async (_req, res) => {
  try {
    const html = await render();
    res.status(200);
    res.setHeader("Content-Type", "text/html");
    res.end(HTML_HEAD + html + HTML_TAIL);
  } catch (error) {
    console.error("SSR render error:", error);
    res.status(500).end("Internal Server Error");
  }
});

const port = Number(process.env["PORT"]) || 6013;
app.listen(port, () => {
  console.log(`playground-vue SSR server listening on http://localhost:${port}`);
});
