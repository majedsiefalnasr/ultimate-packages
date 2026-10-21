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

function runValidator(files, args = []) {
  const workDir = mkdtempSync(join(tmpdir(), "manifest-scope-test-"));
  try {
    writeTree(workDir, { "docs/architecture/PROVENANCE.md": HEADINGS, ...files });
    return spawnSync(
      "node",
      [join(process.cwd(), "scripts/provenance/validate-provenance.mjs"), ...args],
      {
        cwd: workDir,
        encoding: "utf8",
      }
    );
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

// --- Ratchet (ADR-072): --known-missing <path> ---------------------------------

const ONE = "packages/uix-a/src/one.ts";
const TWO = "packages/uix-a/src/two.ts";

// uix-a has three production files (index, one, two). Its manifest lists the
// entries named in `entries`; the rest are missing.
function ratchetFixture(entries) {
  return {
    ...tsupPackage("uix-a", {
      "index.ts": 'export * from "./one";\nexport * from "./two";\n',
      "one.ts": "export const one = 1;\n",
      "two.ts": "export const two = 2;\n",
    }),
    "docs/architecture/provenance/uix-a.json": entries.map((file) => ({
      ultimateDestination: `packages/uix-a/src/${file}`,
      modificationStatus: "authored",
    })),
  };
}

const KNOWN = "known-missing.json";
const FLAG = ["--known-missing", KNOWN];

test("--known-missing excuses a listed missing file and reports the remaining count", () => {
  const result = runValidator(
    { ...ratchetFixture(["index.ts", "two.ts"]), [KNOWN]: { "uix-a": [ONE] } },
    FLAG
  );
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 0, output);
  assert.match(output, /uix-a: .*missing=1 known=1 new=0/);
  assert.match(output, /known-missing: 1 remaining/);
});

test("--known-missing fails a missing file that is not listed", () => {
  const result = runValidator(
    { ...ratchetFixture(["index.ts"]), [KNOWN]: { "uix-a": [ONE] } },
    FLAG
  );
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, output);
  assert.match(
    output,
    /packages\/uix-a\/src\/two\.ts has no entry .*not in the known-missing list/
  );
  assert.doesNotMatch(output, /one\.ts has no entry/);
});

test("--known-missing fails a listed file that now has an entry, so the list only shrinks", () => {
  const result = runValidator(
    { ...ratchetFixture(["index.ts", "one.ts", "two.ts"]), [KNOWN]: { "uix-a": [ONE] } },
    FLAG
  );
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, output);
  assert.match(output, /packages\/uix-a\/src\/one\.ts is listed in .*remove it from the list/);
});

test("--known-missing does not excuse any other failure", () => {
  const result = runValidator(
    {
      ...ratchetFixture(["index.ts", "one.ts", "two.ts"]),
      ...tsupPackage("uix-b", { "index.ts": 'export * from "./nope";\n' }),
      "docs/architecture/provenance/uix-b.json": [],
      ...tsupPackage("uix-c", { "index.ts": "export {};\n" }),
      ...tsupPackage("uix-d", { "index.ts": "export {};\n" }),
      "docs/architecture/provenance/uix-d.json": "{ not json",
      // Listed files of the failing packages must not turn into extra stale lines.
      [KNOWN]: { "uix-b": [], "uix-c": [], "uix-d": [] },
    },
    FLAG
  );
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, output);
  assert.match(output, /uix-b: .*cannot resolve "\.\/nope"/);
  assert.match(output, /uix-c: .*no manifest/);
  assert.match(output, /uix-d: .*invalid/);
});

test("--known-missing fails closed on a missing, malformed or unsorted list", () => {
  const files = ratchetFixture(["index.ts", "two.ts"]);
  const cases = {
    "a missing list file": files,
    "invalid JSON": { ...files, [KNOWN]: "{ not json" },
    "an unsorted list": { ...files, [KNOWN]: { "uix-a": [TWO, ONE] } },
    "a duplicate": { ...files, [KNOWN]: { "uix-a": [ONE, ONE] } },
  };
  for (const [label, tree] of Object.entries(cases)) {
    const result = runValidator(tree, FLAG);
    const output = result.stdout + result.stderr;
    assert.equal(result.status, 1, `${label}: ${output}`);
    assert.match(output, /known-missing\.json/, label);
  }
});

test("--known-missing without a value fails", () => {
  const result = runValidator(ratchetFixture(["index.ts", "one.ts", "two.ts"]), [
    "--known-missing",
  ]);
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, output);
  assert.match(output, /--known-missing requires a value/);
});

test("without --known-missing the same fixture still fails on the missing file", () => {
  const result = runValidator({
    ...ratchetFixture(["index.ts", "two.ts"]),
    [KNOWN]: { "uix-a": [ONE] },
  });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, output);
  assert.match(output, /packages\/uix-a\/src\/one\.ts has no entry in/);
});
