#!/usr/bin/env node
// scripts/provenance/fetch-vendor-cache.mjs
//
// Ensures pinned Phase 0 baseline archives are present in the git-ignored
// .vendor-cache/, verified against the SHA-256 values committed in
// docs/architecture/checksums.json (GAP-093). checksums.json is the only
// source of URLs and hashes, and this script never writes it. A hash
// mismatch is a real failure to investigate, never fixed here.
//
// Usage: node scripts/provenance/fetch-vendor-cache.mjs <package>...

import { createHash } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";

const CHECKSUMS_PATH = "docs/architecture/checksums.json";
const DOWNLOAD_TIMEOUT_MS = 300_000;

export function selectArtifacts(args, artifacts) {
  const names = args[0] === "--" ? args.slice(1) : args;
  if (names.length === 0) {
    throw new Error("expected at least one package name from checksums.json");
  }
  return names.map((name) => {
    const matches = artifacts.filter((artifact) => artifact.package === name);
    if (matches.length !== 1) {
      throw new Error(`${name}: expected exactly one entry in ${CHECKSUMS_PATH}`);
    }
    return matches[0];
  });
}

async function sha256OfFile(path) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}

export async function ensureVendorArchive({ artifact, rootDir, fetchImpl }) {
  const target = join(rootDir, artifact.cachedAt);
  const mismatch = (origin, actual) =>
    new Error(
      `${artifact.package}: sha256 mismatch for ${origin} ${artifact.cachedAt}: expected ${artifact.sha256}, got ${actual}`
    );

  if (existsSync(target)) {
    const actual = await sha256OfFile(target);
    if (actual !== artifact.sha256) throw mismatch("existing", actual);
    return "present";
  }

  mkdirSync(dirname(target), { recursive: true });
  const part = `${target}.part`;
  try {
    const response = await fetchImpl(artifact.sourceUrl);
    if (!response.ok || !response.body) {
      throw new Error(`${artifact.package}: download failed: HTTP ${response.status}`);
    }
    await pipeline(Readable.fromWeb(response.body), createWriteStream(part));
    const actual = await sha256OfFile(part);
    if (actual !== artifact.sha256) throw mismatch("downloaded", actual);
    renameSync(part, target);
    return "fetched";
  } catch (err) {
    rmSync(part, { force: true });
    throw err;
  }
}

async function main() {
  const { artifacts } = JSON.parse(readFileSync(CHECKSUMS_PATH, "utf8"));
  const selected = selectArtifacts(process.argv.slice(2), artifacts);
  const fetchImpl = (url) =>
    fetch(url, { signal: globalThis.AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  for (const artifact of selected) {
    const state = await ensureVendorArchive({ artifact, rootDir: process.cwd(), fetchImpl });
    console.log(
      `[vendor:fetch] ${artifact.package}@${artifact.version}: ${state} (sha256 ${artifact.sha256.slice(0, 12)}...)`
    );
  }
}

function isDirectInvocation() {
  return process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
}

if (isDirectInvocation()) {
  main().catch((err) => {
    console.error(`[vendor:fetch] FAILED: ${err.message}`);
    process.exit(1);
  });
}
