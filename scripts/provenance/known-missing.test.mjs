import { test } from "node:test";
import assert from "node:assert/strict";
import { parseKnownMissing, compareKnownMissing } from "./known-missing.mjs";

const A = "packages/ng/src/a.ts";
const B = "packages/ng/src/b.ts";
const C = "packages/ng/src/c.ts";

test("parseKnownMissing accepts a sorted list and an empty object", () => {
  const ok = parseKnownMissing(JSON.stringify({ ng: [A, B] }));
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.list, { ng: [A, B] });
  assert.deepEqual(parseKnownMissing("{}"), { ok: true, list: {} });
});

test("parseKnownMissing rejects invalid JSON", () => {
  const r = parseKnownMissing("{ not json");
  assert.equal(r.ok, false);
  assert.match(r.error, /not valid JSON/);
});

test("parseKnownMissing rejects a top-level array and null", () => {
  for (const text of ["[]", "null", '"x"', "1"]) {
    const r = parseKnownMissing(text);
    assert.equal(r.ok, false, text);
    assert.match(r.error, /must be a JSON object/);
  }
});

test("parseKnownMissing rejects a non-array value", () => {
  const r = parseKnownMissing(JSON.stringify({ ng: "x" }));
  assert.equal(r.ok, false);
  assert.match(r.error, /"ng" must be an array/);
});

test("parseKnownMissing rejects a non-string item and names its index", () => {
  const r = parseKnownMissing(JSON.stringify({ ng: [A, 5] }));
  assert.equal(r.ok, false);
  assert.match(r.error, /"ng"\[1\] must be a string/);
});

test("parseKnownMissing rejects an unsorted array and names the pair", () => {
  const r = parseKnownMissing(JSON.stringify({ ng: [B, A] }));
  assert.equal(r.ok, false);
  assert.match(r.error, /"ng" is not sorted/);
  assert.match(r.error, /packages\/ng\/src\/a\.ts/);
});

test("parseKnownMissing rejects a duplicate", () => {
  const r = parseKnownMissing(JSON.stringify({ ng: [A, A] }));
  assert.equal(r.ok, false);
  assert.match(r.error, /"ng" has a duplicate/);
});

test("parseKnownMissing rejects a path outside packages/<key>/src/", () => {
  for (const bad of ["packages/vue/src/a.ts", "docs/a.ts", "packages/ng/test/a.ts"]) {
    const r = parseKnownMissing(JSON.stringify({ ng: [bad] }));
    assert.equal(r.ok, false, bad);
    assert.match(r.error, /must start with packages\/ng\/src\//);
  }
});

test("parseKnownMissing sorts by code point, not by locale", () => {
  // "B" (0x42) sorts before "a" (0x61) by code point; a locale compare would not.
  const upper = "packages/ng/src/B.ts";
  const lower = "packages/ng/src/a.ts";
  assert.equal(parseKnownMissing(JSON.stringify({ ng: [upper, lower] })).ok, true);
  assert.equal(parseKnownMissing(JSON.stringify({ ng: [lower, upper] })).ok, false);
});

test("compareKnownMissing: equal sets have no difference", () => {
  const r = compareKnownMissing({ ng: [A, B] }, { ng: [A, B] });
  assert.deepEqual(r, { added: [], stale: [], remaining: 2 });
});

test("compareKnownMissing: a missing file that is not listed is added", () => {
  const r = compareKnownMissing({ ng: [A, B, C] }, { ng: [A, B] });
  assert.deepEqual(r.added, [C]);
  assert.deepEqual(r.stale, []);
  assert.equal(r.remaining, 2);
});

test("compareKnownMissing: a listed file that is not missing is stale", () => {
  const r = compareKnownMissing({ ng: [A] }, { ng: [A, B] });
  assert.deepEqual(r.added, []);
  assert.deepEqual(r.stale, [B]);
  assert.equal(r.remaining, 1);
});

test("compareKnownMissing: keys present on only one side are handled", () => {
  const V = "packages/vue/src/v.ts";
  const r = compareKnownMissing({ vue: [V] }, { ng: [A] });
  assert.deepEqual(r.added, [V]);
  assert.deepEqual(r.stale, [A]);
  assert.equal(r.remaining, 0);
});

test("compareKnownMissing returns sorted paths across keys", () => {
  const r = compareKnownMissing({ ng: [C, A], react: ["packages/react/src/r.ts"] }, {});
  assert.deepEqual(r.added, [A, C, "packages/react/src/r.ts"]);
});

test("compareKnownMissing accepts an empty list and an empty missing set", () => {
  assert.deepEqual(compareKnownMissing({}, {}), { added: [], stale: [], remaining: 0 });
});
