import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/angular-actions.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
test("Angular actions reconcile every scoped source and generated view without modifying authorship", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/angular-actions/${name}`, "utf8"), text);
  assert.deepEqual(run(input).views, result.views);
});
test("Angular actions reject missing ownership, fabricated exports and dangling relationships", () => {
  const input = load();
  input.records[0].files.pop();
  assert.ok(run(input).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const exports = load();
  exports.records[0].exports.push("@ultimate/ng#ImaginaryDirective");
  assert.ok(run(exports).problems.some((p) => p.kind === "export"));
  const references = load();
  references.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(references).problems.some((p) => p.kind === "reference"));
});
test("every scoped source export and composition member is interpreted, not counted as a folder", () => {
  const input = load();
  for (const record of input.records) {
    const entry = record.files.find((file) => file.endsWith("/index.ts"));
    assert.ok(readFileSync("packages/ng/src/index.ts", "utf8").includes(entry.split("/").at(-2)));
    for (const file of record.files.filter((file) => !file.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true
      );
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
          continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((declaration) =>
              declaration.name.getText(source)
            )
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names)
          assert.ok(
            `${record.name} ${record.surface}`.includes(name),
            `${file}#${name} lacks authored ownership`
          );
      }
    }
  }
  const toolbar = input.records.find((record) => record.id === "angular.toolbar");
  for (const member of ["startTemplate", "centerTemplate", "endTemplate"])
    assert.ok(toolbar.surface.includes(member));
});
test("same-ticket reconciled families cannot be deferred to another batch", () => {
  const input = load();
  const alias = input.aliases.shift();
  input.pending.push({ id: alias.id, batch: "packages", reason: "Incorrect deferral" });
  assert.ok(run(input).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const missing = load();
  missing.aliases.shift();
  assert.ok(run(missing).problems.some((p) => p.kind === "ownership"));
  const dangling = load();
  dangling.aliases[0].record = "angular.missing";
  assert.ok(run(dangling).problems.some((p) => p.kind === "identity"));
  const duplicate = load();
  duplicate.aliases.push(duplicate.aliases[0]);
  assert.ok(run(duplicate).problems.some((p) => p.kind === "identity"));
  const external = load();
  external.aliases.push({ id: "package.ultimate.ng.menu", record: "angular.button" });
  assert.ok(run(external).problems.some((p) => p.kind === "ownership"));
});

test("reconciled family aliases retain authored identities and external ticket boundaries", () => {
  const input = load();
  const families = [
    "avatar",
    "avatar-group",
    "badge",
    "button",
    "button-group",
    "chip",
    "overlay-badge",
    "split-button",
    "tag",
    "toolbar",
  ];
  assert.equal(input.records.length, families.length);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((family) => [`package.ultimate.ng.${family}`, `angular.${family}`]).sort()
  );
  for (const alias of input.aliases) {
    const detail = run(input).views[`${alias.record}.md`];
    assert.ok(detail.includes(`${alias.id} → [${alias.record}](${alias.record}.md)`));
    assert.ok(!detail.includes(`${alias.id} (pending cross-batch)`));
  }
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8"));
  for (const pending of input.pending)
    assert.ok(
      !coverage.ownership.find((o) => o.id === pending.id).tickets.includes(input.ownership.ticket)
    );
});

test("cross-batch package identities reconcile against package coverage", () => {
  const coverage = JSON.parse(readFileSync("scripts/inventory/package-coverage.json", "utf8"));
  for (const pending of load().pending)
    assert.ok(
      coverage.ownership.some((item) => item.id === pending.id),
      pending.id
    );
});
