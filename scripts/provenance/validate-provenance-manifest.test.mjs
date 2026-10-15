import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("validate-provenance.mjs fails when a source file has no manifest entry", () => {
  const workDir = mkdtempSync(join(tmpdir(), "manifest-gap-test-"));

  mkdirSync(join(workDir, "docs", "architecture", "provenance"), { recursive: true });
  writeFileSync(
    join(workDir, "docs", "architecture", "PROVENANCE.md"),
    [
      "## PrimeNG",
      "## PrimeVue",
      "## PrimeReact",
      "## @primeuix/utils",
      "## @primeuix/styled",
      "## @primeuix/styles",
      "## @primeuix/motion",
      "",
    ].join("\n")
  );
  writeFileSync(join(workDir, "docs", "architecture", "provenance", "uix-utils.json"), "[]\n");

  mkdirSync(join(workDir, "packages", "uix-utils", "src"), { recursive: true });
  writeFileSync(
    join(workDir, "packages", "uix-utils", "src", "orphan.ts"),
    "export const x = 1;\n"
  );

  const result = spawnSync(
    "node",
    [join(process.cwd(), "scripts/provenance/validate-provenance.mjs")],
    {
      cwd: workDir,
      encoding: "utf8",
    }
  );

  assert.equal(result.status, 1, "expected failure: orphan.ts has no manifest entry");

  rmSync(workDir, { recursive: true, force: true });
});

const HEADINGS = [
  "## PrimeNG",
  "## PrimeVue",
  "## PrimeReact",
  "## @primeuix/utils",
  "## @primeuix/styled",
  "## @primeuix/styles",
  "## @primeuix/motion",
  "",
].join("\n");

function writeTree(root, files) {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(
      join(root, path),
      typeof content === "string" ? content : JSON.stringify(content)
    );
  }
}

function tsupPackage(name, srcFiles) {
  return {
    [`packages/${name}/package.json`]: {
      name: `@demo/${name}`,
      files: ["dist"],
      scripts: { build: "tsup && node scripts/rename-dts.mjs" },
      exports: { ".": { import: "./dist/index.mjs" } },
    },
    [`packages/${name}/tsup.config.ts`]:
      'import { defineConfig } from "tsup";\nexport default defineConfig({ entry: { index: "src/index.ts" } });\n',
    ...Object.fromEntries(
      Object.entries(srcFiles).map(([p, c]) => [`packages/${name}/src/${p}`, c])
    ),
  };
}

function runValidator(files) {
  const workDir = mkdtempSync(join(tmpdir(), "manifest-scope-test-"));
  try {
    writeTree(workDir, { "docs/architecture/PROVENANCE.md": HEADINGS, ...files });
    return spawnSync("node", [join(process.cwd(), "scripts/provenance/validate-provenance.mjs")], {
      cwd: workDir,
      encoding: "utf8",
    });
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

test("validate-provenance.mjs reports every missing production file and every package problem", () => {
  const result = runValidator({
    ...tsupPackage("uix-a", {
      "index.ts": 'export * from "./one";\nexport * from "./two";\n',
      "one.ts": "export const one = 1;\n",
      "two.ts": "export const two = 2;\n",
    }),
    "docs/architecture/provenance/uix-a.json": [
      { ultimateDestination: "packages/uix-a/src/index.ts", modificationStatus: "authored" },
    ],
    ...tsupPackage("uix-b", { "index.ts": 'export * from "./nope";\n' }),
    "docs/architecture/provenance/uix-b.json": [],
    ...tsupPackage("uix-c", { "index.ts": "export {};\n" }),
    ...tsupPackage("uix-d", { "index.ts": "export {};\n" }),
    "docs/architecture/provenance/uix-d.json": "{ not json",
  });
  assert.equal(result.status, 1);
  const output = result.stdout + result.stderr;
  assert.match(output, /packages\/uix-a\/src\/one\.ts has no entry/);
  assert.match(output, /packages\/uix-a\/src\/two\.ts has no entry/);
  assert.match(output, /uix-b: .*cannot resolve "\.\/nope"/);
  assert.match(output, /uix-c: .*no manifest/);
  assert.match(output, /uix-d: .*invalid/);
});

test("validate-provenance.mjs does not require entries for excluded (non-distributed) files", () => {
  const result = runValidator({
    ...tsupPackage("uix-e", { "index.ts": "export {};\n", "index.spec.ts": "export {};\n" }),
    "docs/architecture/provenance/uix-e.json": [
      { ultimateDestination: "packages/uix-e/src/index.ts", modificationStatus: "authored" },
    ],
  });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 0, output);
  assert.match(output, /uix-e: production=1 excluded=1 missing=0/);
});
