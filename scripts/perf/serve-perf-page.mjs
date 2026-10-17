#!/usr/bin/env node
// scripts/perf/serve-perf-page.mjs
//
// Serves one framework's built, client-only perf page (`build:perf`) as
// static files. Every path without a matching file (for example
// `/perf/table-100`) gets index.html, so the page can read its subject from
// the URL path. It builds nothing and fails loudly when the build is missing.
//
// Usage: node scripts/perf/serve-perf-page.mjs <ng|react|vue>

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import { PERF_PAGE_DIRS, PERF_PAGE_PORTS } from "./stage1-subjects.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export function perfPageDir(framework) {
  const relative = PERF_PAGE_DIRS[framework];
  if (!relative) throw new Error(`serve-perf-page: unknown framework "${framework}"`);
  const dir = resolve(repoRoot, relative);
  if (!existsSync(join(dir, "index.html"))) {
    throw new Error(
      `serve-perf-page: ${relative}/index.html is missing. Run the playground's "build:perf" script first.`
    );
  }
  return dir;
}

/** Starts the static server and resolves with it once it listens. */
export async function servePerfPage(framework, port = PERF_PAGE_PORTS[framework]) {
  const dir = perfPageDir(framework);
  const indexHtml = readFileSync(join(dir, "index.html"));
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = join(dir, normalize(pathname));
    const isFile = file.startsWith(dir) && existsSync(file) && statSync(file).isFile();
    res.setHeader("Cache-Control", "no-store");
    if (isFile) {
      res.setHeader("Content-Type", CONTENT_TYPES[extname(file)] ?? "application/octet-stream");
      res.end(readFileSync(file));
    } else {
      res.setHeader("Content-Type", CONTENT_TYPES[".html"]);
      res.end(indexHtml);
    }
  });
  return new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(port, () => resolvePromise(server));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const framework = process.argv[2];
  servePerfPage(framework).then(
    () =>
      console.log(
        `[serve-perf-page] ${framework} on http://localhost:${PERF_PAGE_PORTS[framework]}`
      ),
    (error) => {
      console.error(`[serve-perf-page] FATAL: ${error.message}`);
      process.exit(1);
    }
  );
}
