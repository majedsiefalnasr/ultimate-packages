import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { inventory } from "./pilot.mjs";

test("real package reservations permit scoped targets but global closeout rejects them", () => {
  const input = JSON.parse(readFileSync(new URL("./package-coverage.json", import.meta.url)));
  const scoped = inventory({ root: ".", input });
  assert.deepEqual(scoped.problems, []);
  for (const [name, text] of Object.entries(scoped.views))
    assert.equal(readFileSync(`docs/inventory/packages/${name}`, "utf8"), text);
  assert.deepEqual(inventory({ root: ".", input }).views, scoped.views);
  const unowned = JSON.parse(JSON.stringify(input));
  unowned.ownership = unowned.ownership.filter((o) => o.id !== "package.ultimate.react.button");
  assert.ok(inventory({ root: ".", input: unowned }).problems.some((p) => p.kind === "coverage"));
  const invalid = JSON.parse(JSON.stringify(input));
  invalid.ownership.find((o) => o.id === "package.ultimate.react.button").tickets = [99999];
  assert.ok(inventory({ root: ".", input: invalid }).problems.some((p) => p.kind === "coverage"));
  assert.equal(scoped.facts.packages.find((p) => p.name === "uix").state, "reserved-empty");
  assert.equal(scoped.facts.packages.find((p) => p.name === "@ultimate/cli").state, "implemented");
  assert.ok(
    scoped.facts.entries.some(
      (e) => e.package === "package.ultimate.ng-core" && e.origin === "ng-packagr-generated"
    )
  );
  assert.ok(scoped.facts.families.some((f) => f.id === "package.ultimate.ng.overlay-badge"));
  assert.ok(
    inventory({ root: ".", input: { ...input, closeout: true } }).problems.some(
      (p) => p.kind === "reference"
    )
  );
});

test("package reconciliation discovers unconventional sources and diagnoses missing ownership", (t) => {
  const root = mkdtempSync(join(tmpdir(), "inventory-packages-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "packages/odd/lib"), { recursive: true });
  writeFileSync(
    join(root, "packages/odd/package.json"),
    JSON.stringify({ name: "@test/odd", exports: { "./only": "./lib/api.ts" } })
  );
  writeFileSync(join(root, "packages/odd/lib/api.ts"), "export const API = 1;");
  const result = inventory({
    root,
    input: { mode: "packages", version: 1, scope: "packages", revision: "test", ownership: [] },
  });
  assert.equal(result.facts.packages[0].id, "package.test.odd");
  assert.ok(result.facts.families.some((f) => f.files.includes("packages/odd/lib/api.ts")));
  assert.ok(result.problems.some((p) => p.kind === "coverage"));
  writeFileSync(
    join(root, "packages/odd/package.json"),
    JSON.stringify({ name: "@test/odd", exports: { "./missing": "./dist/missing.js" } })
  );
  assert.ok(
    inventory({
      root,
      input: { mode: "packages", version: 1, scope: "packages", revision: "test", ownership: [] },
    }).problems.some((p) => p.kind === "entry")
  );
  mkdirSync(join(root, "packages/odd/hidden"), { recursive: true });
  writeFileSync(join(root, "packages/odd/hidden/private.ts"), "const internal = 1;");
  assert.ok(
    inventory({
      root,
      input: { mode: "packages", version: 1, scope: "packages", revision: "test", ownership: [] },
    }).facts.families.some((f) => f.name === "hidden")
  );
});
