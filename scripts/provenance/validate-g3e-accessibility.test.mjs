import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-g3e-accessibility.mjs");
const BASELINE = "docs/architecture/ACCESSIBILITY_BASELINE.md";
const PREEXISTING = "docs/architecture/baselines/g3e-accessibility-preexisting.md";
const BROWSERS = ["chromium", "firefox", "webkit"];
// The G3-E story set grows per batch; the expected size is the validator's own constant.
const N = Number(/EXPECTED_STORY_COUNT = \{ ng: (\d+),/.exec(readFileSync(SCRIPT_PATH, "utf8"))[1]);
const STORIES = Array.from({ length: N }, (_, i) => `ng-story${i}--default`);
// Story-dependent cases need at least 6 stories (ng-story0..5); they run from the first batch on.
const FEW = N < 6 && `needs ≥ 6 G3-E stories (currently ${N})`;

function runScript(cwd, fw = "ng") {
  return spawnSync("node", [SCRIPT_PATH, fw], { cwd, encoding: "utf8" });
}

function table(fingerprints) {
  return [
    "| Fingerprint | Rule | Component/Story | Note |",
    "| ----------- | ---- | --------------- | ---- |",
    ...fingerprints.map((f) => `| ${f} | ${f.split(":")[0]} | ${f.split(":")[1]} | note |`),
    "",
  ].join("\n");
}

function writeEnvelope(dir, browser, storyId, violations) {
  writeFileSync(
    join(dir, `test-results/accessibility/ng/${browser}/${storyId}.json`),
    JSON.stringify({ componentStoryId: storyId, framework: "ng", browser, results: { violations } })
  );
}

// A work dir shaped like the repo root: both lists, the ng G3-E spec's STORIES
// table, and one envelope per story x browser with the given violations.
function makeWorkDir({
  baseline = [],
  preexisting = [],
  stories = STORIES,
  violations = {},
  specExtra = "",
}) {
  const dir = mkdtempSync(join(tmpdir(), "g3e-a11y-"));
  mkdirSync(join(dir, "docs/architecture/baselines"), { recursive: true });
  writeFileSync(join(dir, BASELINE), table(baseline));
  writeFileSync(join(dir, PREEXISTING), table(preexisting));
  mkdirSync(join(dir, "packages/ng/e2e"), { recursive: true });
  writeFileSync(
    join(dir, "packages/ng/e2e/g3e-aura-styles.spec.ts"),
    stories.map((s) => `  { name: "x", story: "${s}", ready: ".x" },`).join("\n") + specExtra
  );
  for (const browser of BROWSERS) {
    mkdirSync(join(dir, `test-results/accessibility/ng/${browser}`), { recursive: true });
    for (const storyId of stories) writeEnvelope(dir, browser, storyId, violations[storyId] || []);
  }
  return dir;
}

const region = { id: "region", nodes: [{ target: ["#storybook-root"] }] };
const contrast = { id: "color-contrast", nodes: [{ target: [".u-panel-title"] }] };
const reports = `${N * 3}/${N * 3}`;

test("passes with the approved story set and no violation", () => {
  const dir = makeWorkDir({});
  const result = runScript(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`OK: ng ${reports} reports, 0 introduced violations`));
  rmSync(dir, { recursive: true, force: true });
});

test("passes when every violation is baselined or pre-existing", { skip: FEW }, () => {
  const dir = makeWorkDir({
    baseline: ["color-contrast:ng-story0--default:.u-panel-title"],
    preexisting: ["region:ng-story1--default:#storybook-root"],
    violations: { "ng-story0--default": [contrast], "ng-story1--default": [region] },
  });
  const result = runScript(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    new RegExp(`OK: ng ${reports} reports, 0 introduced violations, 0 stale`)
  );
  rmSync(dir, { recursive: true, force: true });
});

// The spec carries other `story:` keys (visual and reach tables); only the STORIES
// entries, which also carry `ready:`, are the scanned set.
test("counts only STORIES entries, not other story: keys in the spec", () => {
  const dir = makeWorkDir({
    specExtra: [
      "",
      '  { name: "y", story: "ng-other--default", kind: "rest", shot: ".x" },',
      "  {",
      '    story: "ng-other--open",',
      '    state: "open",',
      "  },",
    ].join("\n"),
  });
  const result = runScript(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`OK: ng ${reports} reports`));
  rmSync(dir, { recursive: true, force: true });
});

test("fails when a report is missing", { skip: FEW }, () => {
  const dir = makeWorkDir({});
  rmSync(join(dir, "test-results/accessibility/ng/webkit/ng-story5--default.json"));
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MISSING REPORT: .*webkit\/ng-story5--default\.json/);
  assert.match(result.stderr, new RegExp(`1 missing report\\(s\\) of ${N * 3}`));
  rmSync(dir, { recursive: true, force: true });
});

test("fails on a violation in neither list", { skip: FEW }, () => {
  const dir = makeWorkDir({ violations: { "ng-story2--default": [contrast] } });
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /INTRODUCED VIOLATION: color-contrast:ng-story2--default:\.u-panel-title \(chromium\)/
  );
  rmSync(dir, { recursive: true, force: true });
});

test(
  "reports a pre-existing row that is no longer observed as stale without failing",
  { skip: FEW },
  () => {
    const dir = makeWorkDir({ preexisting: ["region:ng-story3--default:#storybook-root"] });
    const result = runScript(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /STALE \(informational\): region:ng-story3--default:#storybook-root/
    );
    assert.match(result.stdout, /1 stale pre-existing row/);
    rmSync(dir, { recursive: true, force: true });
  }
);

test("fails when the spec's story table has the wrong size", () => {
  const dir = makeWorkDir({ stories: [...STORIES, "ng-extra--default"] });
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(`lists ${N + 1} G3-E stories, expected ${N}`));
  rmSync(dir, { recursive: true, force: true });
});

test("fails on an envelope whose story id does not match its file name", { skip: FEW }, () => {
  const dir = makeWorkDir({});
  writeFileSync(
    join(dir, "test-results/accessibility/ng/firefox/ng-story4--default.json"),
    JSON.stringify({ componentStoryId: "ng-other--default", results: { violations: [] } })
  );
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /componentStoryId "ng-other--default", expected "ng-story4--default"/
  );
  rmSync(dir, { recursive: true, force: true });
});

test("rejects a framework other than ng or vue", () => {
  const dir = makeWorkDir({});
  const result = runScript(dir, "react");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /usage: .*<ng\|vue>/);
  rmSync(dir, { recursive: true, force: true });
});

test("never modifies either list", () => {
  const dir = makeWorkDir({
    preexisting: ["region:ng-story3--default:#storybook-root"],
    violations: { "ng-story2--default": [contrast] },
  });
  const before = [readFileSync(join(dir, BASELINE)), readFileSync(join(dir, PREEXISTING))];
  runScript(dir);
  assert.deepEqual(before[0], readFileSync(join(dir, BASELINE)));
  assert.deepEqual(before[1], readFileSync(join(dir, PREEXISTING)));
  rmSync(dir, { recursive: true, force: true });
});
