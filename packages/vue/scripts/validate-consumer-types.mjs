#!/usr/bin/env node
// Consumer type-check (GAP-082, extended by GAP-083). Packs the built
// @ultimate/vue and its workspace runtime dependencies once, then runs two
// isolated passes, each in its own scratch consumer with its own install:
//   - workspace: `vue` pinned to the workspace-installed version;
//   - floor: `vue` pinned to the supported floor (ADR-050), derived by
//     vue-floor.mjs from both packages' peerDependencies.vue and the
//     compatibility manifest, which must agree.
// Each pass type-checks, with vue-tsc under moduleResolution Bundler and NodeNext
// (skipLibCheck: false), an import of every public export key of @ultimate/vue
// and of @ultimate/vue-core (resolved through their `exports` maps), the
// fixtures in test/consumer-types and the props invariant.
// The fixtures pin both directions: valid usage must produce no errors, and every
// @vue-expect-error / @ts-expect-error marker must be consumed (an unused marker,
// TS2578, means prop types were lost).
// Exhaustive invariant: for every exported SFC component, every prop key its built
// runtime declares (merged through `extends`/`mixins`) must exist in the declared
// `$props` type, so full or partial erasure of prop types fails with the missing
// keys named. Components that declare no runtime props are reported as propless.
// The assertion fails closed: an `any`-typed component, a non-constructor export, or a
// `$props` with a string index signature is reported instead of passing vacuously, and
// the source-derived component list must equal the installed package's runtime components.
// A pass fails if its consumer did not install exactly the requested `vue` version.
// Requires a prior `pnpm run build`. `--diagnostics` also prints vue-tsc's
// extended diagnostics (check time, memory) for the size/cost record.
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readVueFloorRanges, resolveVueFloor } from "./vue-floor.mjs";

const VUE_DIR = join(fileURLToPath(import.meta.url), "..", "..");
const PACKAGES_DIR = join(VUE_DIR, "..");
const FIXTURES_DIR = join(VUE_DIR, "test", "consumer-types");
const VUE_TSC = join(VUE_DIR, "node_modules", ".bin", "vue-tsc");
const DIAGNOSTICS = process.argv.includes("--diagnostics");
const REQUIRED_FIXTURES = ["ValidUsage.vue", "InvalidUsage.vue"];
const VUE_CORE_DIR = join(PACKAGES_DIR, "vue-core");
const MANIFEST_PATH = join(
  PACKAGES_DIR,
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json"
);
// Packages whose every public export key each pass imports directly.
const CHECKED_PACKAGES = [
  ["@ultimate/vue", VUE_DIR],
  ["@ultimate/vue-core", VUE_CORE_DIR],
];

function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
}

// @ultimate/vue plus the transitive closure of its workspace runtime dependencies.
function runtimeClosure() {
  const result = new Map([["@ultimate/vue", VUE_DIR]]);
  const queue = ["@ultimate/vue"];
  while (queue.length > 0) {
    const deps = readManifest(result.get(queue.shift())).dependencies ?? {};
    for (const [name, range] of Object.entries(deps)) {
      if (!String(range).startsWith("workspace:") || result.has(name)) continue;
      result.set(name, join(PACKAGES_DIR, name.replace(/^@ultimate\//, "")));
      queue.push(name);
    }
  }
  return result;
}

// Every component @ultimate/vue exports from an SFC (`export { default as UX } from "./X.vue"`).
function exportedComponents() {
  const srcDir = join(VUE_DIR, "src");
  const names = new Set();
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let index;
    try {
      index = readFileSync(join(srcDir, entry.name, "index.ts"), "utf8");
    } catch {
      continue;
    }
    for (const match of index.matchAll(/export \{ default as (U\w+) \} from "\.\/\w+\.vue";/g))
      names.add(match[1]);
  }
  return [...names].sort();
}

// Runtime prop keys per component, read from the installed package in the consumer.
const RUNTIME_PROPS_SCRIPT = `
import * as vue from "@ultimate/vue";
const names = JSON.parse(process.argv[2]);
// Components are objects with a render/ssrRender function; this excludes the
// U* directive objects (UKeyFilter, UStyleClass).
const components = Object.entries(vue)
  .filter(([name, value]) => /^U[A-Z]/.test(name) && value && typeof value === "object" && (typeof value.render === "function" || typeof value.ssrRender === "function"))
  .map(([name]) => name)
  .sort();
function keys(c, seen = new Set()) {
  if (!c || typeof c !== "object" || seen.has(c)) return [];
  seen.add(c);
  const own = Array.isArray(c.props) ? c.props : Object.keys(c.props ?? {});
  return [...keys(c.extends, seen), ...(c.mixins ?? []).flatMap((m) => keys(m, seen)), ...own];
}
const props = {};
for (const name of names) {
  if (vue[name]) props[name] = [...new Set(keys(vue[name]))].sort();
}
process.stdout.write(JSON.stringify({ components, props }));
`;

// One type-level assertion per exported component: no runtime prop key may be
// missing from the component's declared $props.
function writePropsInvariant(consumerDir) {
  const components = exportedComponents();
  writeFileSync(join(consumerDir, "runtime-props.mjs"), RUNTIME_PROPS_SCRIPT);
  const runtime = JSON.parse(
    execFileSync(process.execPath, ["runtime-props.mjs", JSON.stringify(components)], {
      cwd: consumerDir,
      encoding: "utf8",
    })
  );
  const runtimeProps = runtime.props;
  const missing = components.filter((name) => !runtime.components.includes(name));
  const extra = runtime.components.filter((name) => !components.includes(name));
  if (missing.length > 0 || extra.length > 0)
    throw new Error(
      "[validate-consumer-types] component list from src/*/index.ts differs from the installed package's runtime components" +
        ` (missing at runtime: ${missing.join(", ") || "none"}; not found in source: ${extra.join(", ") || "none"})`
    );
  const propless = components.filter((name) => runtimeProps[name].length === 0);
  const lines = [
    'import type * as V from "@ultimate/vue";',
    "type Props<C> = C extends abstract new (...args: any) => infer I ? (I extends { $props: infer P } ? P : {}) : {};",
    "type Missing<C, K extends string> = Exclude<K, keyof Props<C>>;",
    'type Check<C, K extends string> = 0 extends 1 & C ? "any-typed component" : string extends keyof Props<C> ? "index-signature $props" : Missing<C, K>;',
    ...components
      .filter((name) => runtimeProps[name].length > 0)
      .map(
        (name) =>
          `export const ${name}_missingProps: never = null as unknown as Check<typeof V.${name}, ${runtimeProps[
            name
          ]
            .map((key) => JSON.stringify(key))
            .join(" | ")}>;`
      ),
  ];
  writeFileSync(join(consumerDir, "props-invariant.ts"), `${lines.join("\n")}\n`);
  const keyCount = components.reduce((sum, name) => sum + runtimeProps[name].length, 0);
  return { total: components.length, propless, keyCount };
}

function pack(dir, destination) {
  const output = execFileSync("pnpm", ["pack", "--pack-destination", destination], {
    cwd: dir,
    encoding: "utf8",
  });
  return output.trim().split("\n").pop();
}

function writeConsumer(consumerDir, tarballs, vueVersion) {
  const overrides = Object.fromEntries([...tarballs].map(([name, tgz]) => [name, `file:${tgz}`]));
  const dependencies = { vue: vueVersion };
  for (const [name] of CHECKED_PACKAGES) {
    if (!tarballs.has(name))
      throw new Error(
        `[validate-consumer-types] ${name} is not in @ultimate/vue's runtime closure`
      );
    dependencies[name] = `file:${tarballs.get(name)}`;
  }
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "ultimate-vue-consumer-types",
        private: true,
        type: "module",
        dependencies,
        pnpm: { overrides },
      },
      null,
      2
    )
  );

  const imports = [];
  const bindings = [];
  const entryCounts = {};
  CHECKED_PACKAGES.forEach(([name, dir], pkgIndex) => {
    const exportKeys = Object.keys(readManifest(dir).exports).filter(
      (key) => key !== "./package.json"
    );
    exportKeys.forEach((key, i) => {
      const binding = `m${pkgIndex}_${i}`;
      const specifier = key === "." ? name : `${name}/${key.slice(2)}`;
      imports.push(`import * as ${binding} from "${specifier}";`);
      bindings.push(binding);
    });
    entryCounts[name] = exportKeys.length;
  });
  imports.push(`export const allEntries = [${bindings.join(", ")}];`);
  writeFileSync(join(consumerDir, "all-entries.ts"), `${imports.join("\n")}\n`);

  for (const file of REQUIRED_FIXTURES)
    if (!existsSync(join(FIXTURES_DIR, file)))
      throw new Error(
        `[validate-consumer-types] missing required fixture ${file} in ${FIXTURES_DIR}`
      );
  const fixtures = readdirSync(FIXTURES_DIR).filter(
    (file) => file.endsWith(".vue") || file.endsWith(".ts")
  );
  for (const file of fixtures) copyFileSync(join(FIXTURES_DIR, file), join(consumerDir, file));

  for (const [mode, module, moduleResolution] of [
    ["bundler", "ESNext", "Bundler"],
    ["nodenext", "NodeNext", "NodeNext"],
  ]) {
    const compilerOptions = {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module,
      moduleResolution,
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      jsx: "preserve",
    };
    writeFileSync(
      join(consumerDir, `tsconfig.${mode}.json`),
      JSON.stringify(
        { compilerOptions, include: ["all-entries.ts", "props-invariant.ts", ...fixtures] },
        null,
        2
      )
    );
  }
  return entryCounts;
}

// One isolated pass. Returns true when every mode type-checks. Any error inside
// the pass is reported under the pass's label and fails only this pass, so the
// other pass still runs and reports.
function runPass(workDir, tarballs, pass, vueVersion) {
  const label = `${pass} vue ${vueVersion}`;
  try {
    return checkPass(workDir, tarballs, pass, vueVersion, label);
  } catch (error) {
    console.error(`[validate-consumer-types] FAIL (${label}): ${error.message}`);
    return false;
  }
}

// The pass body: its own consumer directory and install, both module modes.
function checkPass(workDir, tarballs, pass, vueVersion, label) {
  const consumerDir = join(workDir, `consumer-${pass}`);
  mkdirSync(consumerDir, { recursive: true });
  const entryCounts = writeConsumer(consumerDir, tarballs, vueVersion);
  execFileSync("pnpm", ["install", "--no-lockfile", "--prefer-offline"], {
    cwd: consumerDir,
    stdio: "ignore",
  });
  const installed = readManifest(join(consumerDir, "node_modules", "vue")).version;
  if (installed !== vueVersion) {
    console.error(
      `[validate-consumer-types] FAIL (${label}): consumer installed vue ${installed}, expected ${vueVersion}`
    );
    return false;
  }
  const invariant = writePropsInvariant(consumerDir);
  const entries = CHECKED_PACKAGES.map(([name]) => `${entryCounts[name]} ${name}`).join(" + ");

  let ok = true;
  for (const mode of ["bundler", "nodenext"]) {
    const args = ["-p", `tsconfig.${mode}.json`, ...(DIAGNOSTICS ? ["--extendedDiagnostics"] : [])];
    const run = spawnSync(VUE_TSC, args, { cwd: consumerDir, encoding: "utf8" });
    const output = `${run.stdout}${run.stderr}`.trim();
    if (run.status === 0) {
      console.log(
        `[validate-consumer-types] OK (${label}, ${mode}): ${entries} entry points, fixtures, and props invariant ` +
          `(${invariant.total - invariant.propless.length} prop-bearing components, ${invariant.keyCount} runtime prop keys typed; ` +
          `${invariant.propless.length} propless: ${invariant.propless.join(", ")})`
      );
      if (DIAGNOSTICS)
        console.log(
          output
            .split("\n")
            .filter((l) => /^(Types|Memory used|Check time|Total time):/.test(l))
            .join("\n")
        );
    } else {
      ok = false;
      console.error(`[validate-consumer-types] FAIL (${label}, ${mode}):\n${output}`);
    }
  }
  return ok;
}

function main() {
  const floor = resolveVueFloor(
    readVueFloorRanges({ vueDir: VUE_DIR, vueCoreDir: VUE_CORE_DIR, manifestPath: MANIFEST_PATH })
  );
  const workspaceVue = readManifest(join(VUE_DIR, "node_modules", "vue")).version;
  const passes = [
    ["workspace", workspaceVue],
    ["floor", floor],
  ];

  const workDir = mkdtempSync(join(tmpdir(), "ultimate-vue-consumer-types-"));
  let failed = false;
  try {
    const packDir = join(workDir, "packs");
    mkdirSync(packDir, { recursive: true });
    const tarballs = new Map();
    for (const [name, dir] of runtimeClosure()) tarballs.set(name, pack(dir, packDir));
    // Every pass runs, even after an earlier one fails.
    for (const [pass, vueVersion] of passes)
      if (!runPass(workDir, tarballs, pass, vueVersion)) failed = true;
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
}

main();
