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

test("utility wildcard exports retain every observed public subpath", () => {
  const input = JSON.parse(readFileSync(new URL("./package-coverage.json", import.meta.url)));
  const result = inventory({ root: ".", input });
  const entries = result.facts.entries.filter((e) => e.package === "package.ultimate.uix-utils");
  assert.deepEqual(
    entries.filter((e) => e.origin === "manifest-pattern").map((e) => [e.subpath, e.source]),
    [
      "classnames",
      "dom",
      "escape",
      "eventbus",
      "mergeprops",
      "object",
      "scroll-lock",
      "uuid",
      "zindex",
    ].map((name) => [`./${name}`, `packages/uix-utils/src/${name}/index.ts`])
  );
});

test("inline observed build entries expand wildcard exports without inventing private entries", (t) => {
  const root = mkdtempSync(join(tmpdir(), "inventory-pattern-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ["public", "private"]) {
    mkdirSync(join(root, `packages/odd/src/${name}`), { recursive: true });
    writeFileSync(join(root, `packages/odd/src/${name}/index.ts`), "export {};");
  }
  writeFileSync(
    join(root, "packages/odd/package.json"),
    JSON.stringify({
      name: "@test/odd",
      exports: { "./*": "./dist/*/index.mjs" },
    })
  );
  writeFileSync(
    join(root, "packages/odd/tsup.config.ts"),
    `
    import { defineConfig } from "tsup";
    import { readdirSync } from "node:fs";
    const modules = readdirSync("src", { withFileTypes: true })
      .filter((item) => item.isDirectory() && item.name !== "private")
      .map((item) => item.name);
    export default defineConfig({ entry: {
      ...Object.fromEntries(modules.map((name) => [\`\${name}/index\`, \`src/\${name}/index.ts\`]))
    }});
  `
  );
  const input = {
    mode: "packages",
    version: 1,
    scope: "packages",
    revision: "test",
    ownership: [],
  };
  const result = inventory({ root, input });
  assert.deepEqual(
    result.facts.entries.map((e) => [e.subpath, e.source]),
    [["./public", "packages/odd/src/public/index.ts"]]
  );
  assert.equal(
    result.problems.some((p) => p.kind === "entry"),
    false
  );
});

test("exact exports override wildcard entries including blocked public access", (t) => {
  const root = mkdtempSync(join(tmpdir(), "inventory-exact-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ["public", "private"]) {
    mkdirSync(join(root, `packages/odd/src/${name}`), { recursive: true });
    writeFileSync(join(root, `packages/odd/src/${name}/index.ts`), "export {};");
  }
  writeFileSync(
    join(root, "packages/odd/tsup.config.ts"),
    `import { defineConfig } from "tsup";
    export default defineConfig({ entry: {
      "public/index": "src/public/index.ts",
      "private/index": "src/private/index.ts"
    }});`
  );
  const input = {
    mode: "packages",
    version: 1,
    scope: "packages",
    revision: "test",
    ownership: ["package.test.odd", "package.test.odd.public", "package.test.odd.private"].map(
      (id) => ({ id, reason: "Synthetic regression fixture" })
    ),
  };
  for (const exactFirst of [false, true]) {
    const exact = { "./public": "./dist/public/index.mjs", "./private": null };
    writeFileSync(
      join(root, "packages/odd/package.json"),
      JSON.stringify({
        name: "@test/odd",
        exports: exactFirst
          ? { ...exact, "./*": "./dist/*/index.mjs" }
          : { "./*": "./dist/*/index.mjs", ...exact },
      })
    );
    const result = inventory({ root, input });
    assert.deepEqual(result.problems, []);
    assert.equal(new Set(result.facts.entries.map((e) => e.id)).size, result.facts.entries.length);
    assert.deepEqual(
      result.facts.entries.map((e) => [e.subpath, e.origin]),
      [
        ["./public", "manifest"],
        ["./private", "build-only"],
      ]
    );
  }
});

test("unsupported or unobserved wildcard exports fail closed", (t) => {
  const root = mkdtempSync(join(tmpdir(), "inventory-unsupported-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "packages/odd/src"), { recursive: true });
  writeFileSync(join(root, "packages/odd/src/index.ts"), "export {};");
  const input = {
    mode: "packages",
    version: 1,
    scope: "packages",
    revision: "test",
    ownership: [],
  };
  for (const pattern of ["./*", "./nested/*", "./*/*"]) {
    writeFileSync(
      join(root, "packages/odd/package.json"),
      JSON.stringify({
        name: "@test/odd",
        exports: { [pattern]: "./dist/*/index.mjs" },
      })
    );
    const result = inventory({ root, input });
    assert.ok(
      result.problems.some((p) => p.kind === "entry" && p.subject === `package.test.odd:${pattern}`)
    );
  }
  writeFileSync(
    join(root, "packages/odd/tsup.config.ts"),
    `
    import { defineConfig } from "tsup";
    export default defineConfig({ entry: { "public/index": "src/index.ts" } });
  `
  );
  for (const target of ["./dist/*.js", null]) {
    writeFileSync(
      join(root, "packages/odd/package.json"),
      JSON.stringify({
        name: "@test/odd",
        exports: { "./*": target },
      })
    );
    assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "entry"));
  }
  writeFileSync(
    join(root, "packages/odd/package.json"),
    JSON.stringify({
      name: "@test/odd",
      exports: { "./*": "./dist/*/index.mjs" },
    })
  );
  writeFileSync(
    join(root, "packages/odd/tsup.config.ts"),
    'import unsupported from "unsupported"; export default unsupported;'
  );
  assert.ok(inventory({ root, input }).problems.some((p) => p.kind === "entry"));
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
