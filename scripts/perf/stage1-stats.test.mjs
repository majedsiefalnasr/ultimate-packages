import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, sameCommitDiff } from "./stage1-stats.mjs";
import { buildIdentity, runIdentity } from "./run-identity.mjs";

test("summarize: 1..10", () => {
  const s = summarize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(s.n, 10);
  assert.equal(s.median, 5.5);
  assert.equal(s.p95, 10);
  assert.equal(s.iqr, 5);
  assert.ok(Math.abs(s.cv - 3.0276503540974917 / 5.5) < 1e-12);
});

test("summarize: does not depend on input order and does not mutate it", () => {
  const input = [3, 1, 2];
  const s = summarize(input);
  assert.deepEqual(input, [3, 1, 2]);
  assert.equal(s.median, 2);
  assert.equal(s.p95, 3);
  assert.equal(s.iqr, 1); // odd n: median in both halves, Q1 1.5 (of [1,2]), Q3 2.5 (of [2,3])
});

test("summarize: single sample and constant samples have cv 0", () => {
  assert.deepEqual(summarize([7]), { n: 1, median: 7, p95: 7, iqr: 0, cv: 0 });
  assert.equal(summarize([4, 4, 4, 4]).cv, 0);
});

test("summarize: p95 is nearest-rank", () => {
  const twenty = Array.from({ length: 20 }, (_, i) => i + 1);
  assert.equal(summarize(twenty).p95, 19); // ceil(0.95*20) = 19
});

test("summarize: empty input throws", () => {
  assert.throws(() => summarize([]), /no samples/);
});

test("summarize: non-finite samples are rejected", () => {
  assert.throws(() => summarize([1, Number.NaN]), /finite/);
});

test("sameCommitDiff: median delta and relative delta", () => {
  assert.deepEqual(sameCommitDiff([10, 10], [11, 11]), { medianDelta: 1, relativeDelta: 0.1 });
});

test("sameCommitDiff: uses medians, not means", () => {
  const d = sameCommitDiff([10, 10, 100], [12, 12, 12]);
  assert.equal(d.medianDelta, 2);
  assert.equal(d.relativeDelta, 0.2);
});

test("buildIdentity: maps injected command results and env", () => {
  const id = buildIdentity({
    sha: "abc123\n",
    pnpm: "9.6.0\n",
    nodeVersion: "v24.15.0",
    arch: "arm64",
    env: { RUNNER_NAME: "gh-1", PERF_IMAGE: "img@sha256:1" },
    now: new Date("2026-10-17T10:00:00.000Z"),
  });
  assert.deepEqual(id, {
    sha: "abc123",
    date: "2026-10-17T10:00:00.000Z",
    node: "v24.15.0",
    pnpm: "9.6.0",
    arch: "arm64",
    runner: "gh-1",
    image: "img@sha256:1",
  });
});

test("buildIdentity: failed commands and missing env never throw", () => {
  const id = buildIdentity({
    sha: null,
    pnpm: undefined,
    nodeVersion: "v24.15.0",
    arch: "x64",
    env: {},
    now: new Date("2026-10-17T10:00:00.000Z"),
  });
  assert.equal(id.sha, "unknown");
  assert.equal(id.pnpm, "unknown");
  assert.equal(id.runner, "local");
  assert.equal(id.image, "unknown");
});

test("runIdentity: returns a complete block without throwing", () => {
  const id = runIdentity();
  for (const key of ["sha", "date", "node", "pnpm", "arch", "runner", "image"]) {
    assert.equal(typeof id[key], "string", key);
  }
});
