# F5 Vue Declarations / Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@ultimate/vue`'s shipped type declarations resolve for TypeScript consumers under `Bundler` and `NodeNext` (GAP-079). Vue stops shipping Storybook declarations, and neither React nor Vue ships declaration maps any more (Spec §12 decision (a)).

**Architecture:** Vue's `scripts/rename-dts.mjs` adopts React's resolve-and-guard approach (GAP-068) for extensionless specifiers: every relative specifier in the emitted `.d.mts` files is rewritten to an explicit `.mjs` specifier pointing at an emitted declaration, and an unresolvable one fails the build. It differs from React in two places:

- `.vue` specifiers are looked up like extensionless ones (`./Button.vue` → `Button.vue.d.mts` → `./Button.vue.mjs`). React's `EXTENSIONED` leaves `.vue` alone.
- Relative `.js` specifiers keep Vue's existing `.js` → `.mjs` rewrite, now verified against the emitted declaration. React leaves `.js` unchanged, which is safe there only because its declarations contain none. The declaration builds' `tsconfig.dts.json` files exclude stories (Vue) and set `declarationMap: false` (React and Vue). Runtime JavaScript and its source maps are untouched.

**Tech Stack:** Node ESM build scripts, `vue-tsc`/`tsc` `--emitDeclarationOnly`, tsup, Vitest, pnpm pack.

**Spec:** `docs/superpowers/specs/2026-10-02-prime-parity-followup-vue-declarations-design.md`

## Global Constraints

- `exports` maps in `packages/vue/package.json` and `packages/react/package.json` are unchanged.
- Runtime `.mjs` output and its `.mjs.map` files are unchanged; only declaration maps (`.d.mts.map` and the `.d.mts` `sourceMappingURL` comments) go away (Spec §12).
- "Every subpath" means every key of `packages/vue/package.json` `exports` (currently 94 including `.`), not arbitrary file paths.
- React and Vue keep `splitting: false`; no code-splitting changes.
- Node 20 (`export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`). Tests: `pnpm --filter @ultimate/vue test`, `pnpm --filter @ultimate/react test`. Stage explicit files only.

## Review Focus

1. A relative specifier that points at a directory (`./button`) must become `./button/index.mjs`, not `./button.mjs`. Covered by a Task 1 unit test.
2. A relative `.js` specifier (`./button/index.js`, which the current Vue script rewrites) must still become `./button/index.mjs`, in `from` and `import()` forms, and must fail the build when no matching declaration exists. Covered by Task 1 regression tests. Bare package specifiers (`vue`, `@ultimate/vue-core`) are never rewritten; a Task 1 test covers that too.
3. A relative specifier with no emitted declaration must fail the build, not ship silently. Covered by a Task 1 unit test (non-zero exit).
4. Component exports must keep real prop types, not `any`. Covered by the Task 3 `@ts-expect-error` check.
5. Turning off declaration maps must not change any runtime `.mjs.map`. Covered by the Task 2 before/after file-list diff.

---

### Task 1: GAP-079 — resolvable Vue declaration specifiers with a build guard

**Files:**

- Modify: `packages/vue/scripts/rename-dts.mjs` (replace the specifier-rewrite step, keep the rename step)
- Create: `packages/vue/test/rename-dts.test.ts`

**Interfaces:**

- Consumes: the script's existing behavior of running with `cwd` = `packages/vue` and operating on `./dist` (it is invoked as `node scripts/rename-dts.mjs` by the `build` script).
- Produces: after the script, every relative specifier in `dist/**/*.d.mts` that is extensionless, `.vue`, `.js` or `.mjs` ends in `.mjs` and points at an emitted `.d.mts`. Relative `.cjs`/`.ts`/`.cts`/`.mts`/`.json` specifiers are left as they are. The script exits 1 with a list on stderr when a specifier cannot be resolved.
- Behavior preserved from the current script (`packages/vue/scripts/rename-dts.mjs:43`, `from "./x.js"` → `from "./x.mjs"`): relative `.js` specifiers still become `.mjs`, now also in `import()`/side-effect forms and only when `x.d.mts` exists.

- [ ] **Step 1: Write the failing tests**

Create `packages/vue/test/rename-dts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

// `__dirname` is available in this package's Vitest setup even though the
// package is `"type": "module"`: packages/vue/test/exports.test.ts:25-43
// already uses it and passes. Keep the same mechanism here.
const SCRIPT = join(__dirname, "..", "scripts", "rename-dts.mjs");

/** Writes `files` under <tmp>/dist, runs the script with cwd=<tmp>, returns the result. */
function run(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "vue-rename-dts-"));
  for (const [rel, content] of Object.entries(files)) {
    const path = join(root, "dist", rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  const result = spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8" });
  return {
    status: result.status,
    stderr: result.stderr,
    read: (rel: string) => readFileSync(join(root, "dist", rel), "utf8"),
  };
}

describe("packages/vue/scripts/rename-dts.mjs (GAP-079)", () => {
  it("renames .d.ts to .d.mts and rewrites an extensionless sibling specifier to .mjs", () => {
    const r = run({
      "button/index.d.ts": `export { createBaseButton } from "./base-button";\n`,
      "button/base-button.d.ts": `export declare const createBaseButton: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`from "./base-button.mjs"`);
  });

  it("rewrites a directory specifier to its index.mjs", () => {
    const r = run({
      "index.d.ts": `export * from "./button";\n`,
      "button/index.d.ts": `export declare const x: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });

  it("rewrites a .vue specifier to the emitted SFC declaration", () => {
    const r = run({
      "button/index.d.ts": `export { default as UButton } from "./Button.vue";\n`,
      "button/Button.vue.d.ts": `declare const _default: 1;\nexport default _default;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`from "./Button.vue.mjs"`);
  });

  it("rewrites parent-directory and dynamic import() specifiers", () => {
    const r = run({
      "button/index.d.ts": `export type T = import("../shared").S;\n`,
      "shared.d.ts": `export type S = 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`import("../shared.mjs")`);
  });

  it("leaves bare package specifiers untouched", () => {
    const r = run({
      "index.d.ts": `import type { App } from "vue";\nexport type { App };\nexport * from "@ultimate/vue-core";\n`,
    });
    expect(r.status).toBe(0);
    const out = r.read("index.d.mts");
    expect(out).toContain(`from "vue"`);
    expect(out).toContain(`from "@ultimate/vue-core"`);
  });

  it("fails the build when a relative specifier resolves to no declaration", () => {
    const r = run({ "index.d.ts": `export * from "./missing";\n` });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(`"./missing"`);
  });

  // Regression: the previous script rewrote `from "./x.js"` to `from "./x.mjs"`
  // (tsup's DTS rollup emitted `.js` cross-entry specifiers). That behavior
  // must be kept, not skipped just because `.js` is an extension.
  it("keeps rewriting a relative .js specifier to .mjs (from form)", () => {
    const r = run({
      "index.d.ts": `export { UButton } from "./button/index.js";\n`,
      "button/index.d.ts": `export declare const UButton: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });

  it("rewrites a relative .js specifier in import() form too", () => {
    const r = run({
      "index.d.ts": `export type T = import("./shared.js").S;\n`,
      "shared.d.ts": `export type S = 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`import("./shared.mjs")`);
  });

  it("fails the build for a relative .js specifier with no matching declaration", () => {
    const r = run({ "index.d.ts": `export * from "./gone.js";\n` });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(`"./gone.js"`);
  });

  it("leaves a relative .mjs specifier that already resolves unchanged", () => {
    const r = run({
      "index.d.ts": `export * from "./button/index.mjs";\n`,
      "button/index.d.ts": `export declare const x: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test -- test/rename-dts.test.ts`
Expected: the extensionless, directory, `.vue`, parent/`import()`, both "fails the build" and the `.js` `import()` tests FAIL. The current script only rewrites `.js` in `from` form and never exits non-zero. Three tests already pass and must keep passing: the bare-specifier test, the `.js` `from`-form regression test (the current behavior being preserved) and the `.mjs` unchanged test.

- [ ] **Step 3: Implement**

Replace the whole content of `packages/vue/scripts/rename-dts.mjs` with:

```js
#!/usr/bin/env node
// Post-processes the declaration files `vue-tsc` emits into `dist` (this
// package's `build` script: `vue-tsc -p tsconfig.dts.json --declaration
// --emitDeclarationOnly --outDir dist`). Two steps; step 2 follows
// packages/react/scripts/rename-dts.mjs (GAP-068) for extensionless
// specifiers and additionally handles `.vue` and `.js` specifiers:
//
// 1. Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
//    so they match this package's `.mjs` exports map.
//
// 2. `vue-tsc` emits relative specifiers as written in source: extensionless
//    (`./base-button`) and SFC (`./Button.vue`). TypeScript resolves neither to
//    a `.d.mts` file, so consumers got TS2307 (GAP-079). Rewrite every relative
//    specifier to an explicit one:
//      `./x`      -> `./x.mjs`        when `x.d.mts` exists
//      `./x`      -> `./x/index.mjs`  when `x/index.d.mts` exists
//      `./X.vue`  -> `./X.vue.mjs`    when `X.vue.d.mts` exists
//      `./x.js`   -> `./x.mjs`        when `x.d.mts` exists (this script's
//                                     earlier behavior, for tsup's `.js`
//                                     cross-entry specifiers; kept)
//      `./x.mjs`  unchanged           when `x.d.mts` exists
//    TypeScript maps `./x.mjs` to `x.d.mts`. Bare/package specifiers and
//    relative `.cjs`/TS/JSON specifiers are left alone. Any other relative
//    specifier that resolves to nothing is a build error (non-zero exit), so
//    this defect cannot silently return.
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST = "dist";

function renameDtsToMts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameDtsToMts(fullPath);
    } else if (entry.name.endsWith(".d.ts.map")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts\.map$/, ".d.mts.map"));
    } else if (entry.name.endsWith(".d.ts")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts$/, ".d.mts"));
    }
  }
}

// Matches the specifier in `from "..."`, `import("...")` and side-effect
// `import "..."`; only relative (`./`, `../`) specifiers are rewritten.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*|\.{1,2})\2/g;
// A relative specifier naming a JS module (`.js`/`.mjs`) must map to an
// emitted declaration; other extensions (`.cjs`, TS, JSON) are left alone.
// `.vue` is deliberately in neither list: an SFC specifier is resolved like
// an extensionless one, against the emitted `X.vue.d.mts`.
const JS_MODULE = /\.m?js$/;
const LEFT_ALONE = /\.(?:cjs|[cm]?ts|json)$/;

const unresolved = [];

function resolveSpecifier(file, specifier) {
  const target = resolve(dirname(file), specifier);

  if (JS_MODULE.test(specifier)) {
    if (existsSync(`${target.replace(JS_MODULE, "")}.d.mts`)) {
      return specifier.replace(JS_MODULE, ".mjs");
    }
    unresolved.push(`${file}: "${specifier}"`);
    return specifier;
  }
  if (LEFT_ALONE.test(specifier)) {
    return specifier;
  }

  if (existsSync(`${target}.d.mts`)) {
    return `${specifier}.mjs`;
  }
  if (existsSync(join(target, "index.d.mts"))) {
    return `${specifier.replace(/\/$/, "")}/index.mjs`;
  }

  unresolved.push(`${file}: "${specifier}"`);
  return specifier;
}

function rewriteSpecifiers(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      rewriteSpecifiers(fullPath);
    } else if (entry.name.endsWith(".d.mts")) {
      const original = readFileSync(fullPath, "utf8");
      const fixed = original.replace(
        SPECIFIER,
        (_match, prefix, quote, specifier) =>
          `${prefix}${quote}${resolveSpecifier(fullPath, specifier)}${quote}`
      );

      if (fixed !== original) {
        writeFileSync(fullPath, fixed);
      }
    }
  }
}

renameDtsToMts(DIST);
rewriteSpecifiers(DIST);

if (unresolved.length > 0) {
  console.error(
    `rename-dts: ${unresolved.length} relative specifier(s) resolve to no .d.mts file:\n` +
      unresolved.map((line) => `  ${line}`).join("\n")
  );
  process.exit(1);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test -- test/rename-dts.test.ts`
Expected: all 10 tests PASS.

- [ ] **Step 5: Build the real package and confirm no unresolved specifiers remain**

Run: `pnpm --filter "@ultimate/vue..." run build`
Expected: exit 0 (the guard reports nothing). Then check that no relative extensionless or `.vue` specifier remains in the shipped declarations:

```bash
find packages/vue/dist -name "*.d.mts" -print0 | xargs -0 grep -hoE "(from|import\()\s*[\"']\.{1,2}/[^\"']*[\"']" | grep -vcE "\.mjs[\"']$"
```

Expected: `0`.

- [ ] **Step 6: Commit**

```bash
git add packages/vue/scripts/rename-dts.mjs packages/vue/test/rename-dts.test.ts
git commit -m "fix(vue): emit resolvable declaration specifiers and fail on unresolved ones (GAP-079)"
```

---

### Task 2: Stop shipping Vue story declarations and React/Vue declaration maps

**Files:**

- Modify: `packages/vue/tsconfig.dts.json`
- Modify: `packages/react/tsconfig.dts.json`

**Interfaces:**

- Consumes: Task 1's script (it still renames any `.d.ts.map` it finds; with declaration maps off there are none).
- Produces: `dist` for both packages with no `*.d.mts.map`, no `sourceMappingURL` in any `.d.mts`, and (Vue) no `*.stories.d.mts`.

- [ ] **Step 1: Record the runtime file lists before the change**

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter "@ultimate/vue..." --filter "@ultimate/react..." run build
find packages/vue/dist packages/react/dist \( -name "*.mjs" -o -name "*.mjs.map" \) | sort | tee /tmp/claude-501/f5-runtime-before.txt | wc -l
find packages/vue/dist -name "*.stories.d.mts*" | wc -l
find packages/vue/dist packages/react/dist -name "*.d.mts.map" | wc -l
```

Expected: a non-zero runtime file count; `91`-odd story declaration files (with maps, about 182); hundreds of `.d.mts.map` files.

- [ ] **Step 2: Change the declaration build configs**

Replace `packages/vue/tsconfig.dts.json` with:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false
  },
  "exclude": ["src/**/*.spec.ts", "src/**/*.stories.ts"]
}
```

Replace `packages/react/tsconfig.dts.json` with:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false
  },
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/*.stories.ts",
    "src/**/*.stories.tsx"
  ]
}
```

(Vue has no `*.stories.tsx` files, so `src/**/*.stories.ts` covers all of its stories.)

- [ ] **Step 3: Rebuild from clean output and verify**

Both builds start from an empty `dist`, because each package's `build` runs tsup first and both `tsup.config.ts` files set `clean: true` (`packages/react/tsup.config.ts:103`, `packages/vue/tsup.config.ts:157`). Stale declaration files from earlier builds therefore cannot hide a result. Then:

```bash
pnpm --filter "@ultimate/vue..." --filter "@ultimate/react..." run build
find packages/vue/dist -name "*.stories.d.mts*" | wc -l
find packages/vue/dist packages/react/dist -name "*.d.mts.map" | wc -l
find packages/vue/dist packages/react/dist -name "*.d.mts" -print0 | xargs -0 grep -l "sourceMappingURL" | wc -l
find packages/vue/dist packages/react/dist \( -name "*.mjs" -o -name "*.mjs.map" \) | sort | tee /tmp/claude-501/f5-runtime-after.txt | wc -l
diff /tmp/claude-501/f5-runtime-before.txt /tmp/claude-501/f5-runtime-after.txt && echo RUNTIME_UNCHANGED
```

Expected: `0`, `0`, `0`, the same runtime count as Step 1, and `RUNTIME_UNCHANGED`.

- [ ] **Step 4: Run both packages' tests**

Run: `pnpm --filter @ultimate/vue test` and `pnpm --filter @ultimate/react test`
Expected: all PASS, including both packages' `test/exports.test.ts` (which import the built `dist`).

- [ ] **Step 5: Commit**

```bash
git add packages/vue/tsconfig.dts.json packages/react/tsconfig.dts.json
git commit -m "build(react,vue): stop shipping declaration maps and Vue story declarations"
```

---

### Task 3: Consumer type-check verification and packaging integrity

**Files:**

- Create (scratch, not committed): `/tmp/claude-501/f5-consumer/` (generated by the script below)
- Record: the Plan ledger (`.superpowers/sdd/2026-10-02-prime-parity-followup-vue-declarations/progress.md`)

**Interfaces:**

- Consumes: Tasks 1-2 built output; `getTransitiveClosure` from `scripts/provenance/workspace-graph.mjs` (returns the `@ultimate/*` workspace closure of a package, e.g. `@ultimate/vue` → `uix-data`, `uix-motion`, `uix-styled`, `uix-styles`, `uix-utils`, `vue-core`, `themes`).
- Produces: recorded proof that a consumer type-checks every exported subpath under `Bundler` and `NodeNext` with real prop types.

- [ ] **Step 1: Confirm `UButton`'s `label` prop type**

Run: `grep -n "label:" packages/vue/src/button/base-button.ts`
Expected: `label: { type: String, default: null },`. This is the prop the wrong-type check below relies on. If it is not a `String` prop, pick another `String` prop of `UButton` and use it in Step 2.

- [ ] **Step 2: Write the scratch consumer generator**

Create `/tmp/claude-501/f5-consumer-setup.mjs` (outside the repository, not committed):

```js
// One-time GAP-079 verification: pack @ultimate/vue and its workspace closure,
// install them into a scratch consumer, and generate a file importing the
// barrel and every exported subpath, plus a wrong-prop-type check.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = process.argv[2];
const OUT = "/tmp/claude-501/f5-consumer";
const TARBALLS = join(OUT, "tarballs");
mkdirSync(TARBALLS, { recursive: true });

const { getTransitiveClosure } = await import(join(REPO, "scripts/provenance/workspace-graph.mjs"));
const packages = ["@ultimate/vue", ...getTransitiveClosure("@ultimate/vue")];

for (const name of packages) {
  execFileSync("pnpm", ["--filter", name, "pack", "--pack-destination", TARBALLS], {
    cwd: REPO,
    stdio: "inherit",
  });
}

const files = readdirSync(TARBALLS);
const tarballFor = (name) => {
  const prefix = name.replace("@", "").replace("/", "-") + "-";
  const file = files.find((f) => f.startsWith(prefix) && f.endsWith(".tgz"));
  if (!file) throw new Error(`no tarball for ${name}`);
  return `file:${join(TARBALLS, file)}`;
};

const rootPkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8"));
const vuePkg = JSON.parse(readFileSync(join(REPO, "packages/vue/package.json"), "utf8"));
const tsVersion = rootPkg.devDependencies?.typescript ?? "latest";
const overrides = Object.fromEntries(packages.map((name) => [name, tarballFor(name)]));

writeFileSync(
  join(OUT, "package.json"),
  JSON.stringify(
    {
      name: "f5-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@ultimate/vue": tarballFor("@ultimate/vue"),
        vue: vuePkg.peerDependencies.vue,
      },
      devDependencies: { typescript: tsVersion },
      pnpm: { overrides },
    },
    null,
    2
  )
);

const subpaths = Object.keys(vuePkg.exports).filter((key) => key !== "./package.json");
const lines = subpaths.map((key, i) => {
  const spec = key === "." ? "@ultimate/vue" : `@ultimate/vue/${key.slice(2)}`;
  return `import * as m${i} from "${spec}";\nvoid m${i};`;
});
lines.push(
  `import { h } from "vue";`,
  `import { UButton } from "@ultimate/vue/button";`,
  `// @ts-expect-error UButton's label is a String prop; a number must be rejected (types intact, not any).`,
  `h(UButton, { label: 123 });`
);
writeFileSync(join(OUT, "imports.ts"), lines.join("\n") + "\n");

const base = { strict: true, noEmit: true, skipLibCheck: false, target: "ES2022", types: [] };
writeFileSync(
  join(OUT, "tsconfig.bundler.json"),
  JSON.stringify(
    {
      compilerOptions: { ...base, module: "ESNext", moduleResolution: "Bundler" },
      files: ["imports.ts"],
    },
    null,
    2
  )
);
writeFileSync(
  join(OUT, "tsconfig.nodenext.json"),
  JSON.stringify(
    {
      compilerOptions: { ...base, module: "NodeNext", moduleResolution: "NodeNext" },
      files: ["imports.ts"],
    },
    null,
    2
  )
);
console.log(`subpaths checked: ${subpaths.length}`);
```

- [ ] **Step 3: Install and type-check**

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
node /tmp/claude-501/f5-consumer-setup.mjs "$(pwd)"
cd /tmp/claude-501/f5-consumer
pnpm install --no-lockfile
npx tsc -p tsconfig.bundler.json && echo BUNDLER_OK
npx tsc -p tsconfig.nodenext.json && echo NODENEXT_OK
cd -
```

Expected: `subpaths checked:` equals the number of `exports` keys (excluding `./package.json`, if present), `BUNDLER_OK` and `NODENEXT_OK`, with zero errors. An unused `@ts-expect-error` (error TS2578) would mean `UButton` is typed `any` and is a failure. If `vue`'s own declarations produce errors unrelated to `@ultimate/*` under `skipLibCheck: false`, record them and re-run with the errors filtered to paths under `node_modules/@ultimate/`; all of those must be zero.

To confirm the check is meaningful, also run it once against the pre-fix state: check out the commit before Task 1 in a scratch worktree, build, and run Steps 2-3 there. Expected: TS2307 errors (for example `Cannot find module './Button.vue'`). Record both results in the ledger, then remove the scratch worktree with `git worktree remove --force`.

- [ ] **Step 4: Packaging integrity and full tests**

```bash
pnpm run integrity:pack-install -- @ultimate/vue
pnpm run integrity:pack-install -- @ultimate/react
pnpm --filter @ultimate/vue test
pnpm --filter @ultimate/react test
pnpm --filter @ultimate/vue run typecheck
pnpm --filter @ultimate/react run typecheck
```

Expected: both integrity checks `OK`; all tests and typechecks pass. Record the results in the ledger. Delete `/tmp/claude-501/f5-consumer` and `/tmp/claude-501/f5-consumer-setup.mjs` afterwards. Nothing from this task is committed.
