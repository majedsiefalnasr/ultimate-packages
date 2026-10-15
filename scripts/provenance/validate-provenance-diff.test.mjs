import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const VALIDATOR = join(dirname(fileURLToPath(import.meta.url)), "validate-provenance.mjs");
const GIT = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
const PROVENANCE = "docs/architecture/PROVENANCE.md";
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

function git(cwd, ...args) {
  return execFileSync(GIT, args, { cwd, encoding: "utf8" }).trim();
}

function write(root, path, content) {
  const destination = join(root, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function manifest(root, packageName, destinations) {
  write(
    root,
    `docs/architecture/provenance/${packageName}.json`,
    `${JSON.stringify(destinations.map((ultimateDestination) => ({ ultimateDestination })))}\n`
  );
}

function commit(root, message) {
  git(root, "add", "--all");
  git(root, "commit", "-q", "-m", message);
  return git(root, "rev-parse", "HEAD");
}

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "provenance-diff-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, "init", "-q");
  git(root, "config", "user.name", "Provenance Test");
  git(root, "config", "user.email", "provenance-test@example.invalid");
  git(root, "config", "commit.gpgsign", "false");
  git(root, "config", "core.fsmonitor", "false");
  write(root, PROVENANCE, HEADINGS);
  for (const packageName of ["react", "vue", "ng", "uix-utils"]) {
    manifest(root, packageName, []);
  }
  return { root, base: commit(root, "fixture baseline") };
}

function changedPaths(root, base) {
  return git(root, "diff", "--name-only", "-z", "--no-renames", `${base}...HEAD`)
    .split("\0")
    .filter(Boolean);
}

function runValidator(root, args = [], env = {}) {
  return spawnSync(process.execPath, [VALIDATOR, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function expectDiff(root, base, paths) {
  const actual = changedPaths(root, base);
  for (const path of paths)
    assert.ok(actual.includes(path), `${path} absent from committed diff: ${actual}`);
}

function expectRequired(result) {
  assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /source-affecting or unclassified watched path/);
  assert.doesNotMatch(result.stdout, /diff check .* passed/);
}

function expectPass(result) {
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /diff check .* passed/);
  assert.match(result.stdout, /all 7 required baseline entries present/);
}

for (const paths of [
  ["packages/react/vitest.config.ts"],
  ["packages/vue/vitest.config.ts"],
  ["packages/react/vitest.config.ts", "packages/vue/vitest.config.ts"],
]) {
  test(`tooling config only needs no provenance update: ${paths.join(", ")}`, (t) => {
    const { root, base } = repository(t);
    for (const path of paths) write(root, path, "export default {};\n");
    commit(root, "change tooling config");
    expectDiff(root, base, paths);
    expectPass(runValidator(root, ["--base-ref", base]));
  });
}

test("unrelated documentation and another package do not trigger the diff gate", (t) => {
  const { root, base } = repository(t);
  write(root, "docs/other.md", "unrelated\n");
  write(root, "packages/other/src/example.ts", "export const example = true;\n");
  commit(root, "change unrelated paths");
  expectDiff(root, base, ["docs/other.md", "packages/other/src/example.ts"]);
  expectPass(runValidator(root, ["--base-ref", base]));
});

for (const packageName of ["uix-utils", "ng", "react", "vue"]) {
  test(`${packageName} source addition requires provenance`, (t) => {
    const { root, base } = repository(t);
    const path = `packages/${packageName}/src/example.css`;
    write(root, path, ".example { display: block; }\n");
    commit(root, "add source");
    expectDiff(root, base, [path]);
    expectRequired(runValidator(root, ["--base-ref", base]));
  });
}

test("source edit and deletion each require provenance", (t) => {
  const { root } = repository(t);
  const path = "packages/react/src/example.css";
  write(root, path, ".example { color: red; }\n");
  const base = commit(root, "add original source");
  write(root, path, ".example { color: blue; }\n");
  commit(root, "edit source");
  expectDiff(root, base, [path]);
  expectRequired(runValidator(root, ["--base-ref", base]));

  const deletionBase = git(root, "rev-parse", "HEAD");
  rmSync(join(root, path));
  commit(root, "delete source");
  expectDiff(root, deletionBase, [path]);
  expectRequired(runValidator(root, ["--base-ref", deletionBase]));
});

test("renaming source into and out of a watched area checks both paths", (t) => {
  const { root } = repository(t);
  write(root, "docs/example.css", ".example { display: block; }\n");
  const outsideBase = commit(root, "add source outside watched area");
  mkdirSync(join(root, "packages/react/src"), { recursive: true });
  git(root, "mv", "docs/example.css", "packages/react/src/example.css");
  commit(root, "rename into source");
  expectDiff(root, outsideBase, ["docs/example.css", "packages/react/src/example.css"]);
  expectRequired(runValidator(root, ["--base-ref", outsideBase]));

  const insideBase = git(root, "rev-parse", "HEAD");
  git(root, "mv", "packages/react/src/example.css", "docs/example.css");
  commit(root, "rename out of source");
  expectDiff(root, insideBase, ["packages/react/src/example.css", "docs/example.css"]);
  expectRequired(runValidator(root, ["--base-ref", insideBase]));
});

test("mixed config and source needs provenance; a matching record satisfies the diff gate", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/vitest.config.ts", "export default {};\n");
  write(root, "packages/react/src/example.css", ".example { display: block; }\n");
  commit(root, "change config and source");
  expectDiff(root, base, ["packages/react/vitest.config.ts", "packages/react/src/example.css"]);
  expectRequired(runValidator(root, ["--base-ref", base]));

  write(
    root,
    PROVENANCE,
    `${HEADINGS}\n## Incorporated example.css\n- Destination: packages/react/src/example.css\n`
  );
  commit(root, "record source lineage");
  expectDiff(root, base, [PROVENANCE, "packages/react/src/example.css"]);
  expectPass(runValidator(root, ["--base-ref", base]));
});

test("manifest-recorded destination outside src takes precedence over config exemption", (t) => {
  const { root } = repository(t);
  const path = "packages/vue/vitest.config.ts";
  write(root, path, "export default {};\n");
  manifest(root, "vue", [path]);
  const base = commit(root, "record destination");
  write(root, path, "export default { changed: true };\n");
  commit(root, "change recorded destination");
  expectDiff(root, base, [path]);
  expectRequired(runValidator(root, ["--base-ref", base]));
});

test("manifest-recorded e2e destination and unknown package-root path require provenance", (t) => {
  const { root } = repository(t);
  const recorded = "packages/vue/e2e/example.spec.ts";
  write(root, recorded, "export const original = true;\n");
  manifest(root, "vue", [recorded]);
  const base = commit(root, "record outside-src destination");
  write(root, recorded, "export const changed = true;\n");
  commit(root, "change recorded destination");
  expectDiff(root, base, [recorded]);
  expectRequired(runValidator(root, ["--base-ref", base]));

  const unknownBase = git(root, "rev-parse", "HEAD");
  const unknown = "packages/vue/tooling-settings.json";
  write(root, unknown, "{}\n");
  commit(root, "change unknown path");
  expectDiff(root, unknownBase, [unknown]);
  expectRequired(runValidator(root, ["--base-ref", unknownBase]));
});

test("no base ref skips only the PR-diff gate", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/src/example.css", ".example {}\n");
  commit(root, "change source");
  expectDiff(root, base, ["packages/react/src/example.css"]);
  const result = runValidator(root);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /all 7 required baseline entries present/);
  assert.doesNotMatch(result.stdout, /diff check/);
});

test("uncommitted source is not treated as a PR diff", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/src/uncommitted.css", ".uncommitted {}\n");
  assert.deepEqual(changedPaths(root, base), []);
  expectPass(runValidator(root, ["--base-ref", base]));
});

test("missing heading still fails independently", (t) => {
  const { root } = repository(t);
  write(root, PROVENANCE, HEADINGS.replace("## PrimeVue\n", ""));
  commit(root, "remove heading");
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing required PROVENANCE.md entry: "PrimeVue"/);
});

for (const [name, args] of [
  ["missing value", ["--base-ref"]],
  ["invalid ref", ["--base-ref", "does-not-exist"]],
  ["option-like ref", ["--base-ref", "--help"]],
]) {
  test(`${name} fails before diff classification`, (t) => {
    const { root } = repository(t);
    const result = runValidator(root, args);
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, /--base-ref/);
    assert.doesNotMatch(result.stdout, /diff check .* passed/);
  });
}

function wrappedGit(root, mode) {
  const bin = join(root, "fake-bin");
  mkdirSync(bin);
  const log = join(root, "git-commands.log");
  const script = [
    "#!/bin/sh",
    'printf "%s\\n" "$1" >> "$GIT_COMMAND_LOG"',
    'if [ "$1" = "diff" ]; then',
    mode === "fail"
      ? "  exit 17"
      : mode === "malformed"
        ? "  printf 'M\\000bad'"
        : "  printf 'M\\000../escape\\000'",
    "  exit 0",
    "fi",
    'exec "$REAL_GIT" "$@"',
    "",
  ].join("\n");
  const wrapper = join(bin, "git");
  writeFileSync(wrapper, script);
  chmodSync(wrapper, 0o755);
  return { PATH: `${bin}:${process.env.PATH}`, REAL_GIT: GIT, GIT_COMMAND_LOG: log, log };
}

test("option-like base ref is rejected without invoking git diff", (t) => {
  const { root } = repository(t);
  const env = wrappedGit(root, "fail");
  const result = runValidator(root, ["--base-ref", "--help"], env);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid --base-ref/);
  assert.deepEqual(readFileSync(env.log, "utf8").trim().split("\n"), ["rev-parse"]);
  assert.doesNotMatch(result.stdout, /diff check .* passed/);
});

for (const mode of ["fail", "malformed", "unclassifiable"]) {
  test(`git diff ${mode} fails closed`, (t) => {
    const { root, base } = repository(t);
    const env = wrappedGit(root, mode);
    const result = runValidator(root, ["--base-ref", base], env);
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, /could not compute git diff|malformed git diff/);
    assert.deepEqual(readFileSync(env.log, "utf8").trim().split("\n"), ["rev-parse", "diff"]);
    assert.doesNotMatch(result.stdout, /diff check .* passed/);
  });
}

test("malformed manifest fails closed during outside-src classification", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/vitest.config.ts", "export default {};\n");
  write(root, "docs/architecture/provenance/react.json", "not json\n");
  commit(root, "change config and corrupt manifest");
  expectDiff(root, base, ["packages/react/vitest.config.ts"]);
  const result = runValidator(root, ["--base-ref", base]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot classify watched package: invalid/);
  assert.doesNotMatch(result.stdout, /diff check .* passed/);
});

test("a source path cannot hide a later classification error in the same diff", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/src/example.css", ".example {}\n");
  write(root, "packages/vue/vitest.config.ts", "export default {};\n");
  write(root, "docs/architecture/provenance/vue.json", "not json\n");
  commit(root, "change source and corrupt another package manifest");
  expectDiff(root, base, ["packages/react/src/example.css", "packages/vue/vitest.config.ts"]);
  const result = runValidator(root, ["--base-ref", base]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot classify watched package: invalid/);
  assert.doesNotMatch(result.stdout, /diff check .* passed/);
});

test("watched path in a package without a manifest requires provenance", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/uix/.gitkeep", "");
  commit(root, "change package without manifest");
  expectDiff(root, base, ["packages/uix/.gitkeep"]);
  expectRequired(runValidator(root, ["--base-ref", base]));
});

test("watched path in a package without a manifest passes with provenance", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/uix/.gitkeep", "");
  write(root, PROVENANCE, `${HEADINGS}\nLineage note.\n`);
  commit(root, "change package without manifest and record provenance");
  expectDiff(root, base, ["packages/uix/.gitkeep", PROVENANCE]);
  expectPass(runValidator(root, ["--base-ref", base]));
});

test("exempt config fails closed when its package manifest is missing", (t) => {
  const { root, base } = repository(t);
  write(root, "packages/react/vitest.config.ts", "export default {};\n");
  rmSync(join(root, "docs/architecture/provenance/react.json"));
  commit(root, "change config and remove manifest");
  expectDiff(root, base, [
    "packages/react/vitest.config.ts",
    "docs/architecture/provenance/react.json",
  ]);
  const result = runValidator(root, ["--base-ref", base]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot classify watched package without/);
  assert.doesNotMatch(result.stdout, /diff check .* passed/);
});
