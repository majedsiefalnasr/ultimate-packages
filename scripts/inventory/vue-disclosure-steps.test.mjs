import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const families = [
  "accordion",
  "accordion-panel",
  "accordion-header",
  "accordion-content",
  "tabs",
  "stepper",
  "steps",
];
const read = (path) => readFileSync(path, "utf8");
const load = () => JSON.parse(read("scripts/inventory/vue-disclosure-steps.json"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Vue disclosure and steps reconcile every scoped source and public entry", () => {
  const input = load();
  assert.deepEqual(run(input).problems, []);
  assert.deepEqual(input.records.map((r) => r.id).sort(), families.map((f) => `vue.${f}`).sort());
  const listed = execFileSync(
    "git",
    ["ls-files", ...families.map((f) => `packages/vue/src/${f}/`)],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n");
  const accounted = [
    ...input.records.flatMap((r) => r.files),
    ...input.dispositions.map((d) => d.path),
  ];
  assert.deepEqual(accounted.sort(), listed.sort());
  assert.equal(listed.length, 43);
  assert.equal(input.dispositions.length, 8);
  assert.equal(new Set(accounted).size, listed.length);
  assert.equal(input.records.flatMap((r) => r.exports).length, 48);
  const manifest = JSON.parse(read("packages/vue/package.json"));
  const entries = input.packages[0].entries;
  const rootBarrel = read("packages/vue/src/index.ts");
  assert.equal(manifest.exports["."].import, "./dist/index.mjs");
  assert.equal(entries.length, families.length * 2);
  for (const f of families) {
    const familySource = `packages/vue/src/${f}/index.ts`;
    assert.ok(rootBarrel.includes(`export * from "./${f}";`));
    assert.equal(
      entries.filter((entry) => entry.subpath === "." && entry.source === familySource).length,
      1
    );
    assert.equal(
      entries.filter((entry) => entry.subpath === `./${f}` && entry.source === familySource).length,
      1
    );
    assert.equal(manifest.exports[`./${f}`].import, `./dist/${f}/index.mjs`);
    assert.ok(read("packages/vue/tsup.config.ts").includes(`"${f}/index"`));
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#InventedDisclosure");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned declarations, compositions and contracts have consumer interpretations", () => {
  for (const record of load().records) {
    for (const file of record.files.filter((f) => f.endsWith(".ts") && !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
    for (const file of record.files.filter((f) => f.endsWith(".vue"))) {
      const name = /name: "(\w+)"/.exec(read(file))[1];
      assert.ok(record.surface.includes(name), `${file}#${name}`);
    }
  }
  const metadataRecords = execFileSync(
    "git",
    ["ls-files", "packages/component-metadata/src/records/"],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n");
  assert.ok(!metadataRecords.some((path) => /accordion|tabs|stepper|steps/.test(path)));
  const input = load();
  const attempts = JSON.parse(read("docs/inventory/vue-disclosure-steps/product-attempts.json"));
  for (const record of input.records) {
    assert.ok(
      record.surface.includes(
        "No direct UIX style-module import or component-metadata record exists"
      )
    );
    assert.ok(
      record.files.every(
        (path) => !/\b(?:from|import)\s*(?:\(\s*)?["']@ultimate\/uix-styles\//.test(read(path))
      )
    );
    const failures = record.claims.filter((claim) => claim.state === "failed");
    assert.equal(failures.length, 2);
    for (const claim of failures)
      assert.ok(
        attempts.attempts.some(
          (attempt) =>
            attempt.command === claim.command &&
            attempt.outcome === claim.outcome &&
            attempt.output === claim.output
        )
      );
    const ci = record.claims.find((claim) => claim.state === "ci-enforced");
    assert.ok(ci);
    assert.ok(
      record.evidence.some((e) => e.path === "package.json" && e.contains.includes('"test":'))
    );
    assert.ok(
      !record.evidence.some((e) => e.path === "package.json" && e.contains.includes("test:scripts"))
    );
  }
  const by = (f) => load().records.find((r) => r.id === `vue.${f}`);
  for (const [f, terms] of Object.entries({
    accordion: ["multiple", "tab-open", "accordionStyleModule"],
    "accordion-panel": ["$pcAccordionPanel", "disabled"],
    "accordion-header": ["toggleicon", "NumpadEnter"],
    "accordion-content": ["v-show", "region"],
    tabs: ["ResizeObserver", "selectOnFocus", "lazy", "PageUp/Down"],
    stepper: ["UStepperSeparator", "activateCallback", "linear"],
    steps: ["readonly", "item.command", "ArrowRight"],
  }))
    for (const term of terms) assert.ok(by(f).surface.includes(term), `${f}: ${term}`);
});

test("ownership rejects local deferral and dangling targets", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 130);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-130", reason: "Invalid local deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership"));
  const dangling = load();
  dangling.records[0].relationships.push("nonexistent.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
});

test("generation preserves authored records and matches deterministic indexed views", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(read(`docs/inventory/vue-disclosure-steps/${name}`), text);
});
