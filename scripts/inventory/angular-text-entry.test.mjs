import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/angular-text-entry.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "icon-field",
  "ifta-label",
  "input-group",
  "input-mask",
  "input-otp",
  "input-text",
  "password",
  "textarea",
  "float-label",
];

test("Angular text entry rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/ng#ImaginaryDirective");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const dangling = load();
  dangling.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-110", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match the package manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const root = readFileSync("packages/ng/src/index.ts", "utf8");
  assert.deepEqual(input.records.map((r) => r.id.slice(8)).sort(), [...families].sort());
  for (const record of input.records) {
    const family = record.id.slice(8);
    assert.ok(root.includes(`/${family}"`), `${family} is not re-exported by the root barrel`);
    const subpath = manifest.exports[`./${family}`];
    const exposed = record.exports.filter((e) => e.startsWith(`@ultimate/ng/${family}#`));
    assert.equal(exposed.length > 0, Boolean(subpath), `${family} manifest subpath mismatch`);
    if (!subpath) assert.ok(record.surface.includes("No dedicated manifest subpath"));
    for (const file of record.files.filter((f) => !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true
      );
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names)
          assert.ok(`${record.name} ${record.surface}`.includes(name), `${file}#${name}`);
      }
    }
  }
});

test("composition members, directive hosts, value accessors and base tiers are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  assert.ok(by("angular.icon-field").exports.includes("@ultimate/ng#UInputIcon"));
  assert.ok(by("angular.input-group").exports.includes("@ultimate/ng#UInputGroupAddon"));
  for (const id of ["angular.input-text", "angular.textarea"]) {
    const s = by(id).surface;
    for (const term of ["directive", "UModelHolder", "DefaultValueAccessor", "NgControl"])
      assert.ok(s.includes(term), `${id}: ${term}`);
  }
  for (const [id, terms] of Object.entries({
    "angular.input-mask": [
      "UBaseInput",
      "NG_VALUE_ACCESSOR",
      "onCompleteEvent",
      "onUnmaskedChange",
    ],
    "angular.input-otp": ["UBaseEditableHolder", "integerOnly", "onChange", "length"],
    "angular.password": ["feedback", "toggleMask", "UOverlay", "strongRegex"],
    "angular.textarea": ["autoResize", "onResize"],
    "angular.float-label": ["variant", "in", "over", "on"],
    "angular.icon-field": ["iconPosition", "u-input-icon"],
    "angular.input-group": ["u-input-group-addon", "inlineStyle"],
    "angular.ifta-label": ["no own inputs"],
  }))
    for (const term of terms) assert.ok(by(id).surface.includes(term), `${id}: ${term}`);
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 110);
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(110), pending.id);
  }
  for (const record of input.records) {
    assert.ok(!record.claims.some((c) => ["verified", "failed"].includes(c.state)));
    const check = record.claims.find((c) => c.command);
    assert.equal(check.state, "not-run");
    assert.ok(check.limitations.length > 0);
    assert.ok(record.claims.some((c) => c.state === "ci-enforced"));
  }
  const views = run(input).views;
  for (const alias of input.aliases)
    assert.ok(
      views[`${alias.record}.md`].includes(`${alias.id} → [${alias.record}](${alias.record}.md)`)
    );
});

test("Angular text entry reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/angular-text-entry/${name}`, "utf8"), text);
});
