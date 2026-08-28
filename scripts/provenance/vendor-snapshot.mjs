#!/usr/bin/env node
// scripts/provenance/vendor-snapshot.mjs
//
// Fetches each pinned Phase 0 baseline source artifact (git archive by
// exact commit SHA, or npm tarball where no public commit exists) into
// a local, git-ignored cache, computes its SHA-256 checksum, and writes
// docs/architecture/checksums.json. Idempotent: re-running with the same
// pinned identifiers reproduces the same checksums every time.
//
// This script does NOT extract or copy source into packages/* — that is
// Phase 1+ component migration work, out of scope here.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const CACHE_DIR = ".vendor-cache";
const OUTPUT_PATH = "docs/architecture/checksums.json";

const TARGETS = [
  {
    name: "PrimeNG",
    package: "primeng",
    version: "21.1.9",
    url: "https://codeload.github.com/primefaces/primeng/tar.gz/c493b1c6d9f7cdffbe1c4dc195493dd73d733593",
    identifierType: "git-commit",
    identifier: "c493b1c6d9f7cdffbe1c4dc195493dd73d733593",
  },
  {
    name: "PrimeVue",
    package: "primevue",
    version: "4.5.5",
    url: "https://codeload.github.com/primefaces/primevue/tar.gz/66dde6788220fc9e6822342919d1ceb0e3460ece",
    identifierType: "git-commit",
    identifier: "66dde6788220fc9e6822342919d1ceb0e3460ece",
  },
  {
    name: "PrimeReact",
    package: "primereact",
    version: "10.9.9",
    url: "https://codeload.github.com/primefaces/primereact/tar.gz/d0f574e39122668292fc7a740f081bae1b93b1e9",
    identifierType: "git-commit",
    identifier: "d0f574e39122668292fc7a740f081bae1b93b1e9",
  },
  {
    name: "@primeuix/utils",
    package: "@primeuix/utils",
    version: "0.7.2",
    url: "https://registry.npmjs.org/@primeuix/utils/-/utils-0.7.2.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "0ded7f74bddf191f0e16aea34b593a7fcffa94b5",
  },
  {
    name: "@primeuix/styled",
    package: "@primeuix/styled",
    version: "0.7.4",
    url: "https://registry.npmjs.org/@primeuix/styled/-/styled-0.7.4.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "d2108a7fad297dea60d549b2c10ed744dc0cbc0e",
  },
  {
    name: "@primeuix/styles",
    package: "@primeuix/styles",
    version: "2.0.3",
    url: "https://registry.npmjs.org/@primeuix/styles/-/styles-2.0.3.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "e42d14c138fe092683228d65a3f6de17de70d6a0",
  },
  {
    name: "@primeuix/motion",
    package: "@primeuix/motion",
    version: "0.0.10",
    url: "https://registry.npmjs.org/@primeuix/motion/-/motion-0.0.10.tgz",
    identifierType: "npm-tarball-shasum",
    identifier: "9af4238226042d80518dd343c6481d03582e374a",
  },
];

async function downloadAndHash(target) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const destPath = `${CACHE_DIR}/${target.package.replace("/", "__")}-${target.version}.tar.gz`;

  const response = await fetch(target.url);
  if (!response.ok) {
    throw new Error(`download failed for ${target.name}: HTTP ${response.status}`);
  }
  await pipeline(response.body, createWriteStream(destPath));

  const { readFileSync } = await import("node:fs");
  const buffer = readFileSync(destPath);
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  return { destPath, sha256 };
}

async function main() {
  const results = [];
  for (const target of TARGETS) {
    process.stdout.write(`[vendor-snapshot] fetching ${target.name}@${target.version}... `);
    const { destPath, sha256 } = await downloadAndHash(target);
    console.log(`OK (sha256: ${sha256.slice(0, 12)}...)`);
    results.push({
      name: target.name,
      package: target.package,
      version: target.version,
      sourceUrl: target.url,
      identifierType: target.identifierType,
      identifier: target.identifier,
      cachedAt: destPath,
      sha256,
    });
  }

  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), artifacts: results }, null, 2) + "\n"
  );
  console.log(`[vendor-snapshot] wrote ${OUTPUT_PATH} with ${results.length} artifacts`);
}

main().catch((err) => {
  console.error(`[vendor-snapshot] FAILED: ${err.message}`);
  process.exit(1);
});
