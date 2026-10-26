import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { inventory } from "./pilot.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ultimate-inventory-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "pkg/src"), { recursive: true });
  writeFileSync(
    join(root, "pkg/package.json"),
    JSON.stringify({ name: "@test/ui", exports: { "./button": "./dist/button.js" } })
  );
  writeFileSync(join(root, "pkg/src/index.ts"), 'export { Button } from "./button";\n');
  writeFileSync(
    join(root, "pkg/src/button.ts"),
    "export const Button = 1;\nconst privatePart = 2;\n"
  );
  const input = {
    version: 1,
    scope: "pilot",
    revision: "abc123",
    packages: [
      {
        path: "pkg",
        roots: ["pkg/src"],
        entries: [{ subpath: "./button", source: "pkg/src/index.ts" }],
      },
    ],
    records: [
      {
        id: "test.button",
        name: "Button",
        framework: "react",
        purpose: "A synthetic button.",
        surface: "A named Button export.",
        files: ["pkg/src/button.ts", "pkg/src/index.ts"],
        availability: "public",
        exports: ["@test/ui/button#Button"],
        evidence: [{ path: "pkg/src/button.ts", contains: "export const Button" }],
        relationships: [],
        claims: [],
      },
    ],
    dispositions: [],
    pending: [],
  };
  return { root, input };
}

test("committed views are byte-exact CLI generation", (t) => {
  const out = mkdtempSync(join(tmpdir(), "inventory-views-"));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const cli = spawnSync(
    process.execPath,
    [
      "scripts/inventory/pilot.mjs",
      "--root",
      ".",
      "--input",
      "scripts/inventory/pilot-sample.json",
      "--out",
      out,
    ],
    { encoding: "utf8" }
  );
  assert.equal(cli.status, 0, cli.stderr);
  for (const name of Object.keys(JSON.parse(cli.stdout).views))
    assert.equal(
      readFileSync(join(out, name), "utf8"),
      readFileSync(join("docs/inventory/pilot", name), "utf8"),
      name
    );
});

test("verified claims need matching supporting run evidence, not just populated fields", (t) => {
  const { root, input } = fixture(t);
  const claim = {
    state: "verified",
    behavior: "button check",
    command: "node check.mjs",
    revision: "abc123",
    outcome: "passed",
    limitations: "Synthetic only",
    output: "passed",
    run: "run.json",
  };
  input.records[0].claims = [claim];
  const run = {
    command: claim.command,
    revision: claim.revision,
    outcome: "passed",
    output: "passed",
  };
  writeFileSync(join(root, "run.json"), JSON.stringify(run));
  assert.deepEqual(inventory({ root, input }).problems, []);
  for (const [key, value] of [
    ["command", "other"],
    ["revision", "stale"],
    ["outcome", "failed"],
    ["output", "failed"],
  ]) {
    writeFileSync(join(root, "run.json"), JSON.stringify({ ...run, [key]: value }));
    assert.ok(
      inventory({ root, input }).problems.some((p) => p.kind === "claim"),
      key
    );
    const authored = join(root, "authored.json");
    writeFileSync(authored, JSON.stringify(input));
    const cli = spawnSync(
      process.execPath,
      ["scripts/inventory/pilot.mjs", "--root", root, "--input", authored],
      { encoding: "utf8" }
    );
    assert.equal(cli.status, 1, key);
    assert.ok(JSON.parse(cli.stdout).problems.some((p) => p.kind === "claim"));
  }
  claim.run = "missing.json";
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "claim"));
});

test("public availability requires a discovered public surface", (t) => {
  const { root, input } = fixture(t);
  input.records.push({ ...input.records[0], id: "test.helper", files: [], exports: [] });
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "availability"));
});

test("internal records cannot claim public exports", (t) => {
  const { root, input } = fixture(t);
  input.records[0].availability = "internal";
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "export"));
});

test("undisposed discovered source blocks scoped coverage", (t) => {
  const { root, input } = fixture(t);
  writeFileSync(join(root, "pkg/src/extra.ts"), "export const Extra = 3;");
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "disposition"));
});

test("new public exports cannot be silently omitted", (t) => {
  const { root, input } = fixture(t);
  writeFileSync(join(root, "pkg/src/index.ts"), 'export { Button, Other } from "./button";');
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "export"));
});

test("broken evidence and unsupported verified claims are diagnosed", (t) => {
  const { root, input } = fixture(t);
  input.records[0].evidence[0].contains = "not in source";
  input.records[0].claims = [{ state: "verified", behavior: "click works" }];
  const result = inventory({ root, input });
  assert.ok(result.problems.some((p) => p.kind === "evidence"));
  assert.ok(result.problems.some((p) => p.kind === "claim"));
});

test("pending relationships must identify another batch and cannot hide missing local records", (t) => {
  const { root, input } = fixture(t);
  input.records[0].relationships = ["foundation.core"];
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "reference"));
  input.pending = [{ id: "foundation.core", batch: "foundation", reason: "Outside pilot" }];
  assert.deepEqual(inventory({ root, input }).problems, []);
});

test("CLI validates inputs and emits deterministic detailed views without editing authorship", (t) => {
  const { root, input } = fixture(t);
  const path = join(root, "authored.json");
  const authored = JSON.stringify(input);
  writeFileSync(path, authored);
  const run = () =>
    spawnSync(process.execPath, ["scripts/inventory/pilot.mjs", "--root", root, "--input", path], {
      encoding: "utf8",
    });
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const result = JSON.parse(first.stdout);
  assert.match(result.views["test.button.md"], /A synthetic button/);
  assert.equal(run().stdout, first.stdout);
});

test("malformed records produce schema diagnostics rather than accidental success", (t) => {
  const { root, input } = fixture(t);
  delete input.records[0].purpose;
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "schema"));
});

test("claimed package entry must exist in the actual manifest", (t) => {
  const { root, input } = fixture(t);
  input.packages[0].entries[0].subpath = "./missing";
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "entry"));
});

test("real sample reconciles framework and shared records at function and CLI seams", () => {
  const path = "scripts/inventory/pilot-sample.json";
  const before = readFileSync(path, "utf8");
  const result = inventory({ root: process.cwd(), input: JSON.parse(before) });
  assert.deepEqual(result.problems, []);
  assert.equal(Object.keys(result.views).length, 6);
  assert.match(result.views["angular.button.md"], /no @ultimate\/ng\/button/);
  const cli = spawnSync(
    process.execPath,
    ["scripts/inventory/pilot.mjs", "--root", ".", "--input", path],
    { encoding: "utf8" }
  );
  assert.equal(cli.status, 0, cli.stdout + cli.stderr);
  assert.deepEqual(JSON.parse(cli.stdout), result);
  assert.equal(readFileSync(path, "utf8"), before);
});

test("CLI rejects each invalid inventory and retains authored bytes", (t) => {
  const { root, input } = fixture(t);
  const mutations = [
    (x) => x.records[0].files.pop(),
    (x) => x.records[0].exports.splice(0),
    (x) => x.records[0].relationships.push("missing.record"),
    (x) => x.records[0].claims.push({ state: "verified", behavior: "unsupported" }),
  ];
  for (const mutate of mutations) {
    const copy = JSON.parse(JSON.stringify(input));
    mutate(copy);
    const path = join(root, "authored.json");
    const bytes = JSON.stringify(copy);
    writeFileSync(path, bytes);
    const cli = spawnSync(
      process.execPath,
      ["scripts/inventory/pilot.mjs", "--root", root, "--input", path],
      { encoding: "utf8" }
    );
    assert.equal(cli.status, 1, cli.stderr);
    assert.ok(JSON.parse(cli.stdout).problems.length);
    assert.equal(readFileSync(path, "utf8"), bytes);
  }
});

test("unsupported star exports fail closed instead of disappearing", (t) => {
  const { root, input } = fixture(t);
  writeFileSync(join(root, "pkg/src/index.ts"), 'export * from "./button";');
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "discovery"));
});

test("documentary sources also require explicit dispositions", (t) => {
  const { root, input } = fixture(t);
  writeFileSync(join(root, "pkg/src/button.api.mdx"), "# Example");
  assert.ok(
    inventory({ root, input }).problems.some((p) => p.subject === "pkg/src/button.api.mdx")
  );
});

test("CLI writes reading views only to explicit output and preserves authored input", (t) => {
  const { root, input } = fixture(t);
  const path = join(root, "authored.json");
  const bytes = JSON.stringify(input);
  writeFileSync(path, bytes);
  const out = join(root, "views");
  const cli = spawnSync(
    process.execPath,
    ["scripts/inventory/pilot.mjs", "--root", root, "--input", path, "--out", out],
    { encoding: "utf8" }
  );
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(readFileSync(join(out, "test.button.md"), "utf8"), /A synthetic button/);
  assert.equal(readFileSync(path, "utf8"), bytes);
});

test("public inventory reconciles scoped sources and exports into readable views", (t) => {
  const { root, input } = fixture(t);
  const result = inventory({ root, input });
  assert.deepEqual(result.problems, []);
  assert.match(result.views["index.md"], /Button/);
  assert.equal(result.complete, false);
  assert.deepEqual(result.facts.exports, ["@test/ui/button#Button"]);
});
