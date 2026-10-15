// scripts/provenance/production-scope.test.mjs
//
// Fixture tests for production-scope.mjs (GAP-094, ADR-062): production
// (distributed) files are classified from build evidence, never from a file
// name alone, and every unmodelled build fails closed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { classifyPackage, parseBuildScript } from "./production-scope.mjs";

const TSUP_BUILD = "tsup && node scripts/rename-dts.mjs";
const VUE_BUILD =
  "tsup && vue-tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly --outDir dist && node scripts/rename-dts.mjs";
const DIST_EXPORT = {
  types: "./dist/index.d.mts",
  import: "./dist/index.mjs",
  default: "./dist/index.mjs",
};

function makePkg(files) {
  const dir = mkdtempSync(join(tmpdir(), "production-scope-test-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), typeof content === "string" ? content : JSON.stringify(content));
  }
  return dir;
}

function withPkg(files, fn) {
  const dir = makePkg(files);
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function pkgJson(build, exports = { ".": DIST_EXPORT }, name = "@demo/pkg") {
  return {
    name,
    files: ["dist", "README.md"],
    scripts: build === undefined ? {} : { build },
    exports,
  };
}

const tsupConfig = (entry) =>
  `import { defineConfig } from "tsup";\nexport default defineConfig({\n  entry: ${entry},\n  dts: true,\n});\n`;

function expectSets(result, dir, production, excluded) {
  assert.equal(result.error, undefined, `unexpected error: ${result.error}`);
  assert.deepEqual([...result.production].sort(), production.map((p) => join(dir, p)).sort());
  assert.deepEqual([...result.excluded].sort(), excluded.map((p) => join(dir, p)).sort());
}

function expectError(files, pattern) {
  withPkg(files, (dir) => {
    const result = classifyPackage(dir);
    assert.ok(result.error, "expected a classifier error");
    assert.match(result.error, pattern);
  });
}

function expectAllProduction(files) {
  withPkg(files, (dir) => {
    const result = classifyPackage(dir);
    assert.equal(result.error, undefined, `unexpected error: ${result.error}`);
    assert.equal(result.excluded.size, 0);
    assert.ok(result.production.has(join(dir, "src/x.spec.ts")));
  });
}

// Task 1: build-script parsing and fallbacks

test("parseBuildScript recognises the repository's build forms", () => {
  assert.deepEqual(parseBuildScript(TSUP_BUILD), { tsup: true, ngPackagr: null, tscPrograms: [] });
  assert.deepEqual(parseBuildScript("ng-packagr -p ng-package.json"), {
    tsup: false,
    ngPackagr: "ng-package.json",
    tscPrograms: [],
  });
  assert.deepEqual(parseBuildScript(VUE_BUILD), {
    tsup: true,
    ngPackagr: null,
    tscPrograms: [{ tool: "vue-tsc", project: "tsconfig.dts.json", declaration: true }],
  });
});

test("parseBuildScript returns null for an unrecognised command or argument", () => {
  for (const script of [
    "vite build",
    "tsup src/index.ts",
    "tsup --config x.ts",
    "tsc -p tsconfig.json --watch",
    "tsup && rollup -c",
  ]) {
    assert.equal(parseBuildScript(script), null, script);
  }
});

const SRC = { "src/index.ts": "export const a = 1;\n", "src/x.spec.ts": "export {};\n" };

test("every file is production without a package.json", () => expectAllProduction(SRC));
test("every file is production without a build script", () =>
  expectAllProduction({ ...SRC, "package.json": pkgJson(undefined) }));
test("every file is production for an unrecognised build command", () =>
  expectAllProduction({ ...SRC, "package.json": pkgJson("vite build") }));
test("every file is production for tsup with CLI arguments", () =>
  expectAllProduction({ ...SRC, "package.json": pkgJson("tsup src/index.ts") }));

// Task 2: tsup entries and exports

test("tsup literal entries and exports are production; an entry absent from exports still ships", () =>
  withPkg(
    {
      "package.json": pkgJson(TSUP_BUILD),
      "tsup.config.ts": tsupConfig(
        `{ index: "src/index.ts", "extra/index": "src/extra/index.ts" }`
      ),
      "src/index.ts":
        'export * from "./a";\nimport type { T } from "./types";\nexport type U = T;\n',
      "src/a.ts": "export const a = 1;\n",
      "src/types.ts": "export type T = string;\n",
      "src/extra/index.ts": "export const extra = 1;\n",
      "src/a.spec.ts": 'import { a } from "./a";\nvoid a;\n',
      "src/x.stories.ts": "export default {};\n",
    },
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/a.ts", "src/types.ts", "src/extra/index.ts"],
        ["src/a.spec.ts", "src/x.stories.ts"]
      )
  ));

const REAL_DIR_CONFIGS = {
  "uix-styles": readFileSync("packages/uix-styles/tsup.config.ts", "utf8"),
  "uix-utils": readFileSync("packages/uix-utils/tsup.config.ts", "utf8"),
};

for (const [name, config] of Object.entries(REAL_DIR_CONFIGS)) {
  test(`the real ${name} directory-listing tsup config expands to src/<dir>/index.ts`, () =>
    withPkg(
      {
        "package.json": pkgJson(TSUP_BUILD),
        "tsup.config.ts": config,
        "src/index.ts": "export {};\n",
        "src/a/index.ts": "export const a = 1;\n",
        "src/b/index.ts": "export const b = 1;\n",
      },
      (dir) =>
        expectSets(
          classifyPackage(dir),
          dir,
          ["src/index.ts", "src/a/index.ts", "src/b/index.ts"],
          []
        )
    ));

  test(`the real ${name} config errors on a listed directory without index.ts`, () =>
    expectError(
      {
        "package.json": pkgJson(TSUP_BUILD),
        "tsup.config.ts": config,
        "src/index.ts": "export {};\n",
        "src/c/other.ts": "export {};\n",
      },
      /src\/c\/index\.ts/
    ));
}

test("a ./* wildcard export expands over src directories", () =>
  withPkg(
    {
      "package.json": pkgJson(TSUP_BUILD, {
        ".": DIST_EXPORT,
        "./*": { types: "./dist/*/index.d.mts", import: "./dist/*/index.mjs" },
      }),
      "tsup.config.ts": tsupConfig(`{ index: "src/index.ts" }`),
      "src/index.ts": "export {};\n",
      "src/p/index.ts": "export {};\n",
      "src/q/index.ts": "export {};\n",
      "src/q/q.spec.ts": "export {};\n",
    },
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/p/index.ts", "src/q/index.ts"],
        ["src/q/q.spec.ts"]
      )
  ));

const tsupBase = (overrides) => ({
  "package.json": pkgJson(TSUP_BUILD),
  "tsup.config.ts": tsupConfig(`{ index: "src/index.ts" }`),
  "src/index.ts": "export {};\n",
  ...overrides,
});

test("errors: an export target that maps to no source", () =>
  expectError(
    tsupBase({
      "package.json": pkgJson(TSUP_BUILD, {
        ".": DIST_EXPORT,
        "./gone": { import: "./dist/gone/index.mjs" },
      }),
    }),
    /gone/
  ));
test("errors: an export target outside ./dist/", () =>
  expectError(
    tsupBase({ "package.json": pkgJson(TSUP_BUILD, { ".": { import: "./lib/x.mjs" } }) }),
    /\.\/lib\/x\.mjs/
  ));
test("errors: an unknown export condition", () =>
  expectError(
    tsupBase({ "package.json": pkgJson(TSUP_BUILD, { ".": { browser: "./dist/index.mjs" } }) }),
    /browser/
  ));
test("errors: a string-valued export", () =>
  expectError(
    tsupBase({ "package.json": pkgJson(TSUP_BUILD, { ".": "./dist/index.mjs" }) }),
    /condition/
  ));
test("errors: zero entries", () =>
  expectError(
    tsupBase({ "package.json": pkgJson(TSUP_BUILD, {}), "tsup.config.ts": tsupConfig("[]") }),
    /zero entries/
  ));
test("errors: an unrecognised tsup entry form", () =>
  expectError(tsupBase({ "tsup.config.ts": tsupConfig("makeEntries()") }), /entry/));
test("errors: no tsup config", () =>
  expectError(
    { "package.json": pkgJson(TSUP_BUILD), "src/index.ts": "export {};\n" },
    /tsup\.config/
  ));
test("errors: two tsup configs", () =>
  expectError(
    tsupBase({ "tsup.config.mjs": tsupConfig(`{ index: "src/index.ts" }`) }),
    /tsup\.config/
  ));
test("errors: a tsup config without entry", () =>
  expectError(
    tsupBase({
      "tsup.config.ts":
        'import { defineConfig } from "tsup";\nexport default defineConfig({ dts: true });\n',
    }),
    /entry/
  ));

for (const option of ["publicDir: true", 'onSuccess: "node x.mjs"']) {
  test(`every file is production when tsup copies into dist (${option.split(":")[0]})`, () =>
    expectAllProduction({
      ...SRC,
      "package.json": pkgJson(TSUP_BUILD),
      "tsup.config.ts": `import { defineConfig } from "tsup";\nexport default defineConfig({ entry: { index: "src/index.ts" }, ${option} });\n`,
    }));
}

// Task 3: ng-packagr entries

const NG_BASE = {
  "package.json": pkgJson("ng-packagr -p ng-package.json", undefined, "@demo/ng"),
  "ng-package.json": { lib: { entryFile: "src/index.ts" }, dest: "dist" },
  "src/index.ts": "export const root = 1;\n",
  "button/ng-package.json": { lib: { entryFile: "../src/button/index.ts" } },
  "src/button/index.ts": "export const button = 1;\n",
  "forms/input/ng-package.json": { lib: { entryFile: "../../src/forms/input/index.ts" } },
  "src/forms/input/index.ts":
    'import { button } from "@demo/ng/button";\nexport const input = button;\n',
  "dist/x/ng-package.json": { lib: { entryFile: "../../src/never.ts" } },
  "node_modules/y/ng-package.json": { lib: { entryFile: "src/never.ts" } },
  "src/button/button.spec.ts": "export {};\n",
};

test("ng-packagr entries, including nested secondaries, are production; dist and node_modules are ignored", () =>
  withPkg(NG_BASE, (dir) =>
    expectSets(
      classifyPackage(dir),
      dir,
      ["src/index.ts", "src/button/index.ts", "src/forms/input/index.ts"],
      ["src/button/button.spec.ts"]
    )
  ));

test("ng-packagr defaults entryFile to src/public_api.ts", () =>
  withPkg(
    {
      "package.json": pkgJson("ng-packagr -p ng-package.json", undefined, "@demo/ng"),
      "ng-package.json": { dest: "dist" },
      "src/public_api.ts": "export const x = 1;\n",
    },
    (dir) => expectSets(classifyPackage(dir), dir, ["src/public_api.ts"], [])
  ));

test("errors: an ng-packagr entry file that does not exist", () =>
  expectError(
    { ...NG_BASE, "button/ng-package.json": { lib: { entryFile: "../src/button/missing.ts" } } },
    /missing\.ts/
  ));

// Task 4: reachability

const reach = (index, extra = {}) => tsupBase({ "src/index.ts": index, ...extra });

test("reachability follows the name, not the pattern: an imported *.spec.ts is production", () =>
  withPkg(
    reach('export * from "./helper.spec";\n', { "src/helper.spec.ts": "export const h = 1;\n" }),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/helper.spec.ts"], [])
  ));

test("reachability walks .vue <script setup> imports", () =>
  withPkg(
    reach('import Comp from "./Comp.vue";\nexport { Comp };\n', {
      "src/Comp.vue":
        '<template><div /></template>\n<script setup lang="ts">\nimport { d } from "./dep";\nvoid d;\n</script>\n',
      "src/dep.ts": "export const d = 1;\n",
    }),
    (dir) =>
      expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/Comp.vue", "src/dep.ts"], [])
  ));

test("a referenced .d.ts is production; an unreferenced one is excluded", () =>
  withPkg(
    reach('/// <reference path="./ambient.d.ts" />\nexport {};\n', {
      "src/ambient.d.ts": "declare const g: number;\n",
      "src/shims.d.ts": "declare module '*.vue';\n",
    }),
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/ambient.d.ts"],
        ["src/shims.d.ts"]
      )
  ));

test("a member call named require is not a dynamic require", () =>
  withPkg(
    reach("const service = { require: (o) => o };\nexport const r = service.require({});\n"),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts"], [])
  ));

test("self-package specifiers resolve exactly; a look-alike package name is external", () =>
  withPkg(
    tsupBase({
      "package.json": pkgJson(TSUP_BUILD, {
        ".": DIST_EXPORT,
        "./sub": { import: "./dist/sub/index.mjs" },
      }),
      "src/index.ts": 'export * from "@demo/pkg/sub";\nexport * from "@demo/pkg-core";\n',
      "src/sub/index.ts": "export const s = 1;\n",
    }),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/sub/index.ts"], [])
  ));

const reachErrors = [
  ["an unresolved relative import", 'export * from "./nope";\n', {}, /\.\/nope/],
  ["an unresolved self import", 'export * from "@demo/pkg/missing";\n', {}, /@demo\/pkg\/missing/],
  ["a non-literal dynamic import", "const m = 'x';\nexport const p = import(m);\n", {}, /dynamic/],
  ["a non-literal bare require", "const m = 'x';\nexport const p = require(m);\n", {}, /require/],
  ["import.meta.glob", 'export const g = import.meta.glob("./*.ts");\n', {}, /import\.meta\.glob/],
  [
    "new URL(_, import.meta.url)",
    'export const u = new URL("./x", import.meta.url);\n',
    {},
    /new URL/,
  ],
  [
    "<script src>",
    'export { default } from "./S.vue";\n',
    { "src/S.vue": '<script src="./x.ts"></script>\n' },
    /script src/,
  ],
  [
    "an unexpected SFC lang",
    'export { default } from "./L.vue";\n',
    { "src/L.vue": '<script lang="coffee">\nx = 1\n</script>\n' },
    /coffee/,
  ],
];

for (const [label, index, extra, pattern] of reachErrors) {
  test(`errors: ${label}`, () => expectError(reach(index, extra), pattern));
}

test("errors: the SFC parser cannot be loaded", () =>
  withPkg(
    reach('export { default } from "./C.vue";\n', {
      "src/C.vue": "<script>export default {};</script>\n",
    }),
    (dir) => {
      const result = classifyPackage(dir, {
        loadSfcParser: () => {
          throw new Error("no parser");
        },
      });
      assert.match(result.error ?? "", /SFC parser/);
    }
  ));

// Task 5: declaration programs

const DTS_FILES = {
  "package.json": pkgJson(VUE_BUILD),
  "tsup.config.ts": tsupConfig(`{ index: "src/index.ts" }`),
  "tsconfig.base.json": { compilerOptions: { declaration: true, strict: true } },
  "tsconfig.json": { extends: "./tsconfig.base.json", include: ["src"] },
  "tsconfig.dts.json": { extends: "./tsconfig.json", exclude: ["src/**/*.spec.ts"] },
  "src/index.ts": "export const i = 1;\n",
  "src/lone.ts": "export const lone = 1;\n",
  "src/Lone.vue": '<script setup lang="ts">\nconst x = 1;\n</script>\n',
  "src/z.spec.ts": "export {};\n",
  "src/shims.d.ts": "declare module '*.vue';\n",
};

test("declaration-program files are production, including unimported .vue files", () =>
  withPkg(DTS_FILES, (dir) =>
    expectSets(
      classifyPackage(dir),
      dir,
      ["src/index.ts", "src/lone.ts", "src/Lone.vue"],
      ["src/z.spec.ts", "src/shims.d.ts"]
    )
  ));

test("a recognised tsc program with noEmit is not a declaration program", () =>
  withPkg(
    {
      ...DTS_FILES,
      "package.json": pkgJson("tsup && tsc -p tsconfig.check.json"),
      "tsconfig.check.json": { extends: "./tsconfig.json", compilerOptions: { noEmit: true } },
    },
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts"],
        ["src/lone.ts", "src/Lone.vue", "src/z.spec.ts", "src/shims.d.ts"]
      )
  ));

// Code-review findings (Spec erratum E3)

test("errors: a spread in the defineConfig options", () =>
  expectError(
    tsupBase({
      "tsup.config.ts":
        'import { defineConfig } from "tsup";\nconst base = { publicDir: "src" };\nexport default defineConfig({ entry: { index: "src/index.ts" }, ...base });\n',
    }),
    /spread or computed/
  ));

test("errors: a duplicate entry property", () =>
  expectError(
    tsupBase({
      "tsup.config.ts":
        'import { defineConfig } from "tsup";\nexport default defineConfig({ entry: ["src/index.ts"], entry: ["src/index.ts"] });\n',
    }),
    /more than one entry/
  ));

test("errors: tsup configuration in package.json as well as a config file", () =>
  expectError(
    tsupBase({ "package.json": { ...pkgJson(TSUP_BUILD), tsup: { entry: ["src/index.ts"] } } }),
    /package\.json tsup/
  ));

test("errors: two tsup config files of different extensions", () =>
  expectError(
    tsupBase({ "tsup.config.cts": tsupConfig(`{ index: "src/index.ts" }`) }),
    /tsup\.config/
  ));

test("a declaration-program root's import is production even when exclude drops it", () =>
  withPkg(
    {
      ...DTS_FILES,
      "tsconfig.dts.json": {
        extends: "./tsconfig.json",
        exclude: ["src/**/*.spec.ts", "src/**/*.stories.ts"],
      },
      "src/lone.ts": 'export type { M } from "./m.stories";\n',
      "src/m.stories.ts": "export type M = number;\n",
    },
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/lone.ts", "src/Lone.vue", "src/m.stories.ts"],
        ["src/z.spec.ts", "src/shims.d.ts"]
      )
  ));

test("a JS-emitting tsc program (no declaration, no noEmit) distributes its files", () =>
  withPkg(
    {
      ...DTS_FILES,
      "package.json": pkgJson("tsup && tsc -p tsconfig.js.json"),
      "tsconfig.js.json": {
        compilerOptions: { declaration: false, outDir: "dist" },
        include: ["src"],
        exclude: ["src/**/*.spec.ts"],
      },
    },
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/lone.ts"],
        ["src/Lone.vue", "src/z.spec.ts", "src/shims.d.ts"]
      )
  ));

test("errors: a declaration program whose tsconfig extends a missing file", () =>
  expectError(
    { ...DTS_FILES, "tsconfig.dts.json": { extends: "./missing.json", include: ["src"] } },
    /missing\.json/
  ));

test("every file is production when package.json has no files list", () =>
  expectAllProduction({
    ...SRC,
    "package.json": { name: "@demo/pkg", scripts: { build: TSUP_BUILD } },
  }));

test("every file is production when files publishes src", () =>
  expectAllProduction({
    ...SRC,
    "package.json": { ...pkgJson(TSUP_BUILD), files: ["dist", "src"] },
    "tsup.config.ts": tsupConfig(`{ index: "src/index.ts" }`),
  }));

test("every file is production when an ng-package.json copies assets", () =>
  withPkg(
    {
      ...NG_BASE,
      "ng-package.json": {
        lib: { entryFile: "src/index.ts" },
        dest: "dist",
        assets: ["src/**/*.ts"],
      },
    },
    (dir) => {
      const result = classifyPackage(dir);
      assert.equal(result.error, undefined);
      assert.equal(result.excluded.size, 0);
    }
  ));

// CodeQL review (PR #22): export patterns follow Node's subpath-pattern rules —
// one `*` in the key, every `*` in the target replaced, `*` matching any string.

const patternPkg = (exports, srcFiles) =>
  tsupBase({
    "package.json": pkgJson(TSUP_BUILD, { ".": DIST_EXPORT, ...exports }),
    ...Object.fromEntries(Object.entries(srcFiles).map(([p, c]) => [`src/${p}`, c])),
  });

test("a target with several * replaces every occurrence with the same match", () =>
  withPkg(
    patternPkg(
      { "./*": { import: "./dist/*/*.mjs" } },
      { "alpha/alpha.ts": "export {};\n", "beta/other.ts": "export {};\n" }
    ),
    (dir) =>
      expectSets(
        classifyPackage(dir),
        dir,
        ["src/index.ts", "src/alpha/alpha.ts"],
        ["src/beta/other.ts"]
      )
  ));

test("a file-level * pattern matches files, not only directories", () =>
  withPkg(
    patternPkg(
      { "./*": { import: "./dist/*.mjs" } },
      { "foo.ts": "export {};\n", "foo.spec.ts": "export {};\n" }
    ),
    (dir) =>
      expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/foo.ts", "src/foo.spec.ts"], [])
  ));

test("a * pattern spanning path segments matches nested sources", () =>
  withPkg(
    patternPkg({ "./*": { import: "./dist/*/index.mjs" } }, { "a/b/index.ts": "export {};\n" }),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/a/b/index.ts"], [])
  ));

test("errors: an export key with more than one *", () =>
  expectError(patternPkg({ "./*/*": { import: "./dist/*/*.mjs" } }, {}), /more than one \*/));

test("errors: a * key whose target has no * (or the reverse)", () => {
  expectError(patternPkg({ "./*": { import: "./dist/x.mjs" } }, { "x.ts": "export {};\n" }), /\*/);
  expectError(patternPkg({ "./x": { import: "./dist/*.mjs" } }, { "x.ts": "export {};\n" }), /\*/);
});

test("errors: a * pattern that matches no source file", () =>
  expectError(patternPkg({ "./*": { import: "./dist/*/index.mjs" } }, {}), /matches no source/));

test("every * in a target takes the same value even when that value contains /", () =>
  withPkg(
    patternPkg({ "./*": { import: "./dist/*/*.mjs" } }, { "a/b/a/b.ts": "export {};\n" }),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/a/b/a/b.ts"], [])
  ));

test("a self specifier keeps $ sequences from the matched value literally", () =>
  withPkg(
    tsupBase({
      "package.json": pkgJson(TSUP_BUILD, { ".": DIST_EXPORT, "./*": { import: "./dist/*.mjs" } }),
      "src/index.ts": 'export * from "@demo/pkg/x$&y";\n',
      "src/x$&y.ts": "export const v = 1;\n",
    }),
    (dir) => expectSets(classifyPackage(dir), dir, ["src/index.ts", "src/x$&y.ts"], [])
  ));
