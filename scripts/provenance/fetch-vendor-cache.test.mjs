// scripts/provenance/fetch-vendor-cache.test.mjs
//
// Offline tests for fetch-vendor-cache.mjs (GAP-093). Each case uses a
// temporary root and a fake fetch, so no network access is needed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ensureVendorArchive, selectArtifacts } from "./fetch-vendor-cache.mjs";

const PAYLOAD = "payload";
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

const artifact = {
  package: "demo",
  version: "1.0.0",
  cachedAt: ".vendor-cache/demo-1.0.0.tar.gz",
  sourceUrl: "https://example.invalid/demo.tgz",
  sha256: sha256(PAYLOAD),
};

function fakeFetch(body, status = 200) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return new globalThis.Response(body, { status });
  };
  return { fetchImpl, calls };
}

function withRoot(fn) {
  return async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "fetch-vendor-cache-test-"));
    try {
      await fn(rootDir, join(rootDir, artifact.cachedAt));
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  };
}

function writeTarget(target, content) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

test(
  "keeps a present archive whose hash matches, without fetching",
  withRoot(async (rootDir, target) => {
    writeTarget(target, PAYLOAD);
    const { fetchImpl, calls } = fakeFetch(PAYLOAD);
    assert.equal(await ensureVendorArchive({ artifact, rootDir, fetchImpl }), "present");
    assert.equal(calls.length, 0);
  })
);

test(
  "fetches a missing archive and writes it when the hash matches",
  withRoot(async (rootDir, target) => {
    const { fetchImpl, calls } = fakeFetch(PAYLOAD);
    assert.equal(await ensureVendorArchive({ artifact, rootDir, fetchImpl }), "fetched");
    assert.deepEqual(calls, [artifact.sourceUrl]);
    assert.equal(readFileSync(target, "utf8"), PAYLOAD);
    assert.equal(existsSync(`${target}.part`), false);
  })
);

test(
  "rejects a downloaded archive whose hash does not match and leaves no file",
  withRoot(async (rootDir, target) => {
    const { fetchImpl } = fakeFetch("tampered");
    await assert.rejects(ensureVendorArchive({ artifact, rootDir, fetchImpl }), (err) => {
      assert.match(err.message, /demo/);
      assert.match(err.message, new RegExp(artifact.sha256));
      assert.match(err.message, new RegExp(sha256("tampered")));
      return true;
    });
    assert.equal(existsSync(target), false);
    assert.equal(existsSync(`${target}.part`), false);
  })
);

test(
  "rejects an HTTP failure and leaves no file",
  withRoot(async (rootDir, target) => {
    const { fetchImpl } = fakeFetch("not found", 404);
    await assert.rejects(ensureVendorArchive({ artifact, rootDir, fetchImpl }), /demo.*404/);
    assert.equal(existsSync(target), false);
    assert.equal(existsSync(`${target}.part`), false);
  })
);

test(
  "rejects an existing archive whose hash does not match, without fetching or overwriting",
  withRoot(async (rootDir, target) => {
    writeTarget(target, "stale");
    const { fetchImpl, calls } = fakeFetch(PAYLOAD);
    await assert.rejects(ensureVendorArchive({ artifact, rootDir, fetchImpl }), (err) => {
      assert.match(err.message, /demo/);
      assert.match(err.message, new RegExp(artifact.sha256));
      assert.match(err.message, new RegExp(sha256("stale")));
      return true;
    });
    assert.equal(calls.length, 0);
    assert.equal(readFileSync(target, "utf8"), "stale");
  })
);

test("selectArtifacts ignores a leading -- and rejects zero or unknown packages", () => {
  assert.deepEqual(selectArtifacts(["--", "demo"], [artifact]), [artifact]);
  assert.throws(() => selectArtifacts([], [artifact]), /at least one package/);
  assert.throws(() => selectArtifacts(["--"], [artifact]), /at least one package/);
  assert.throws(() => selectArtifacts(["nope"], [artifact]), /nope/);
});
