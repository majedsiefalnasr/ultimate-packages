import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { test } from "node:test";
import {
  ALL_CATEGORIES,
  DEFAULT_PROTOCOL,
  assembleArtifact,
  assertVariants,
  defaultOutPath,
  hydrationWarningCount,
  parseArgs,
  plannedSubjects,
  pooledResult,
  resultsFromRecords,
} from "./run-stage1.mjs";
import { PERF_PAGE_PORTS, pageSubjects } from "./stage1-subjects.mjs";

test("parseArgs defaults to every category and W 5, R 10, I 20", () => {
  const options = parseArgs([]);
  assert.deepEqual(options.categories, ALL_CATEGORIES);
  assert.deepEqual(options.protocol, { W: 5, R: 10, I: 20 });
  assert.deepEqual(DEFAULT_PROTOCOL, { W: 5, R: 10, I: 20 });
  assert.equal(options.out, null);
});

test("parseArgs reads a comma list in canonical order, the protocol and --out", () => {
  const options = parseArgs([
    "--categories",
    "p8,P1, P3",
    "--W",
    "1",
    "--R",
    "2",
    "--I",
    "2",
    "--out",
    "x.json",
  ]);
  assert.deepEqual(options.categories, ["P1", "P3", "P8"]);
  assert.deepEqual(options.protocol, { W: 1, R: 2, I: 2 });
  assert.equal(options.out, "x.json");
});

test("parseArgs accepts W 0 but rejects R or I below 1", () => {
  assert.equal(parseArgs(["--W", "0"]).protocol.W, 0);
  assert.throws(() => parseArgs(["--R", "0"]), /--R must be an integer >= 1/);
  assert.throws(() => parseArgs(["--I", "1.5"]), /--I must be an integer >= 1/);
});

test("parseArgs rejects unknown categories, flags and missing values", () => {
  assert.throws(() => parseArgs(["--categories", "P1,P9"]), /unknown category: P9/);
  assert.throws(() => parseArgs(["--fast", "1"]), /unknown argument: --fast/);
  assert.throws(() => parseArgs(["--out"]), /--out needs a value/);
  assert.throws(() => parseArgs(["--W", "--R"]), /--W needs a value/);
});

test("defaultOutPath uses the short sha", () => {
  assert.equal(defaultOutPath("0123456789abcdef0123"), "perf-results/stage1-0123456789ab.json");
  assert.equal(defaultOutPath("unknown"), "perf-results/stage1-unknown.json");
});

test("plannedSubjects records Tree as not built everywhere and OrganizationChart for ng only", () => {
  for (const framework of ["ng", "react", "vue"]) {
    assert.deepEqual(plannedSubjects("P3", framework).notBuilt, [
      { subject: `${framework}:tree`, framework, status: "not built" },
    ]);
    assert.ok(!pageSubjects(framework).includes("tree"));
  }
  assert.deepEqual(
    plannedSubjects("P4", "ng").notBuilt.map((entry) => entry.subject),
    ["ng:organizationchart"]
  );
  assert.deepEqual(plannedSubjects("P4", "react").notBuilt, []);
  assert.deepEqual(
    plannedSubjects("P5", "vue").built.map(({ subject, kind }) => `${subject}/${kind}`),
    ["table-100/sort", "table-100/filter", "select/value"]
  );
});

test("pooledResult flattens the repeats into samples and summarizes them", () => {
  const result = pooledResult({
    subject: "react:button",
    framework: "react",
    metric: "mount",
    runs: [
      [1, 2],
      [3, 4],
    ],
  });
  assert.deepEqual(result.samples, [1, 2, 3, 4]);
  assert.deepEqual(result.runs, [
    [1, 2],
    [3, 4],
  ]);
  assert.equal(result.summary.n, 4);
  assert.equal(result.summary.median, 2.5);
});

test("resultsFromRecords makes one result per metric and flattens array values", () => {
  const results = resultsFromRecords({ subject: "vue:scroller-10k", framework: "vue" }, [
    [{ frameDuration: [16, 17], renderedRows: 25 }],
    [{ frameDuration: [15, 18], renderedRows: 25 }],
  ]);
  assert.deepEqual(
    results.map(({ metric, runs }) => [metric, runs]),
    [
      [
        "frameDuration",
        [
          [16, 17],
          [15, 18],
        ],
      ],
      ["renderedRows", [[25], [25]]],
    ]
  );
});

test("assembleArtifact keeps the Task 7 shape and allows extra fields", () => {
  const artifact = assembleArtifact({
    identity: { sha: "abc" },
    protocol: { W: 1, R: 2, I: 2 },
    category: "P3",
    results: [],
  });
  assert.deepEqual(Object.keys(artifact), ["identity", "protocol", "category", "results"]);
});

test("assertVariants fails when a P7 subject lacks a motion variant", () => {
  const sets = (framework, variants) =>
    ["dialog", "popover", "drawer", "menu", "select"].flatMap((subject) =>
      variants.map((variant) => ({ subject: `${framework}:${subject}`, variant }))
    );
  assert.doesNotThrow(() => assertVariants(sets("ng", ["motion", "reduced"]), "ng"));
  assert.throws(
    () => assertVariants(sets("ng", ["motion"]), "ng"),
    /P7 ng:dialog has no "reduced" result set/
  );
});

test("hydrationWarningCount counts mismatch reports in error and warning messages only", () => {
  const messages = [
    { type: "error", text: "NG0500: During hydration Angular expected <div>" },
    { type: "error", text: "Minified React error #418; visit https://react.dev/errors/418" },
    { type: "warning", text: "[Vue warn]: Hydration node mismatch" },
    { type: "error", text: "Hydration completed but contains mismatches." },
    { type: "log", text: "hydration finished" },
    { type: "error", text: "Failed to load resource" },
  ];
  assert.equal(hydrationWarningCount(messages), 4);
});

test("playwright.perf.config.ts serves the perf pages on PERF_PAGE_PORTS", () => {
  const config = readFileSync(new URL("../../playwright.perf.config.ts", import.meta.url), "utf8");
  const literal = Object.entries(PERF_PAGE_PORTS)
    .map(([framework, port]) => `${framework}: ${port}`)
    .join(", ");
  assert.ok(config.includes(`{ ${literal} }`), `config must declare { ${literal} }`);
});
