import { CommonEngine, createNodeRequestHandler, isMainModule } from "@angular/ssr/node";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bootstrap from "./main.server";

/**
 * Router-less SSR server: this harness has exactly one page and no
 * `Router` provider (per the binding constraint forbidding
 * `withRoutes()`/`withAppShell()`). Angular's newer hybrid-rendering
 * request pipeline (`AngularNodeAppEngine`/`AngularAppEngine`) requires a
 * real `Router` to extract a route tree — with none provided it falls back
 * to a hardcoded `RenderMode.Prerender` default for every route, which
 * would make this server always serve the static prerendered shell instead
 * of genuinely re-rendering per request.
 *
 * `CommonEngine` (still exported from `@angular/ssr/node` for exactly this
 * router-less case) renders `bootstrap` against a URL directly, with no
 * route-tree/manifest involvement at all — true per-request SSR,
 * independent of the build's hybrid-rendering route discovery.
 */
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, "../browser");
const indexHtmlPath = join(serverDistFolder, "index.server.html");

const app = express();
// `allowedHosts` is required by CommonEngine's SSRF guard — this harness is
// local-only (default port 6011), so `localhost`/loopback is sufficient.
const commonEngine = new CommonEngine({ allowedHosts: ["localhost", "127.0.0.1"] });

/**
 * Serve static files (compiled client JS/CSS) from the browser build
 * output. `index: false` — every request falls through to the SSR
 * handler below, which serves the rendered index document itself. No long
 * `maxAge`: this build's filenames aren't content-hashed, so aggressive
 * caching would serve a stale `main.js` after any rebuild — this is a
 * verification harness, not a CDN-fronted production deployment.
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
  }),
);

/**
 * Render the page via the already-built server artifact (`bootstrap`,
 * re-exported from `main.server.mjs`) on every request. This file never
 * compiles Angular source itself, at request time or at server-start time.
 */
app.use((req, res, next) => {
  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtmlPath,
      url: `${req.protocol}://${req.headers.host}${req.originalUrl}`,
      publicPath: browserDistFolder,
    })
    .then((html) => res.status(200).contentType("text/html").send(html))
    .catch(next);
});

/**
 * Start the server only when this module is the actual process entry point
 * (never merely imported, e.g. by the Angular CLI's own build-time route
 * discovery, which loads `server.mjs` in isolation purely to read its
 * exported `reqHandler` shape) — matching Angular's own generated
 * `server.ts` convention exactly, and load-bearing here: without this
 * guard, top-level `app.listen()`/the build-output existence check below
 * would run as a side effect of merely importing this module, which is
 * exactly what happens during `ng build`'s route-extraction pass.
 */
if (isMainModule(import.meta.url)) {
  if (!existsSync(indexHtmlPath)) {
    throw new Error(
      `SSR document not found at ${indexHtmlPath}. Run the "build" script before "start".`,
    );
  }

  const port = Number(process.env["PORT"]) || 6011;
  app.listen(port, () => {
    console.log(`playground-angular SSR server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during
 * build) — not used by this harness's own `"start"` script, but exported
 * for parity with Angular's own generated server.ts contract.
 */
export const reqHandler = createNodeRequestHandler(app);
