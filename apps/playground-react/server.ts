import express from "express";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PassThrough } from "node:stream";

/**
 * Router-less Express SSR server with exactly one page. On every request it
 * imports the already-compiled server entry (dist/entry-server.js, never
 * the .tsx source) and pipes the resulting renderToPipeableStream() stream
 * into the HTTP response, wrapped in the page shell. dist/client/** (the
 * Vite-built browser bundle) is served as static assets for the shell's
 * own <script> tag reference to resolve.
 *
 * This file is compiled by scripts/build-server.mjs (the "build" script's
 * second sub-step) into dist/server.js, which is what "start" runs — it
 * never transpiles/imports .tsx/.ts source at request time.
 */
const here = dirname(fileURLToPath(import.meta.url));
// Both dist/server.js (compiled output, real runtime location) and this
// source file server.ts (package root, ts-node/type-check-time location)
// resolve `here` to their own directory — dist/entry-server.js and
// dist/client sit alongside dist/server.js in both cases, so a single
// relative path works whether this file is read as source or as the
// compiled dist/server.js.
const entryServerPath = join(here, "entry-server.js");
const clientDistPath = resolve(here, "client");
const clientBundlePath = join(clientDistPath, "entry-client.js");

if (!existsSync(entryServerPath)) {
  throw new Error(
    `Compiled server entry not found at ${entryServerPath}. Run the "build" script before "start".`,
  );
}
if (!existsSync(clientBundlePath)) {
  throw new Error(
    `Compiled client bundle not found at ${clientBundlePath}. Run the "build" script before "start".`,
  );
}

const { render } = (await import(entryServerPath)) as typeof import("./src/entry-server");

const app = express();

// Served at the root path (not under a "/client" prefix) so the page
// shell's own <script src="/entry-client.js"> reference resolves directly.
app.use(
  express.static(clientDistPath, {
    index: false,
    redirect: false,
  }),
);

const HTML_HEAD =
  '<!doctype html><html><head><meta charset="utf-8">' +
  "<title>Ultimate React SSR Proof</title></head><body><div id=\"root\">";
const HTML_TAIL = '</div><script type="module" src="/entry-client.js"></script></body></html>';

app.get("/", (_req, res) => {
  const { pipe } = render({
    onShellReady() {
      // Pipe React's stream into an intermediate PassThrough rather than
      // directly into `res`, so the closing page-shell HTML can be
      // appended once React's own stream genuinely finishes (its `end`
      // event) instead of racing the response's `close` event (which also
      // fires on client aborts, before all content is guaranteed written).
      res.status(200);
      res.setHeader("Content-Type", "text/html");
      res.write(HTML_HEAD);

      const passthrough = new PassThrough();
      passthrough.on("data", (chunk) => res.write(chunk));
      passthrough.on("end", () => res.end(HTML_TAIL));
      pipe(passthrough);
    },
    onError(error) {
      console.error("SSR render error:", error);
    },
  });
});

const port = Number(process.env["PORT"]) || 6012;
app.listen(port, () => {
  console.log(`playground-react SSR server listening on http://localhost:${port}`);
});
