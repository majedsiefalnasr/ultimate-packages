#!/usr/bin/env node
// GAP-082 consumer type-check. Packs the built @ultimate/vue and its workspace
// runtime dependencies, installs them into a scratch consumer, and type-checks
// the consumer fixtures with vue-tsc under moduleResolution Bundler and NodeNext
// (skipLibCheck: false). Imports resolve through the packages' `exports` maps.
// The fixtures in test/consumer-types pin both directions: valid usage must
// produce no errors, and every @vue-expect-error / @ts-expect-error marker must
// be consumed (an unused marker, TS2578, means prop types were lost).
// Exhaustive invariant: for every exported SFC component, every prop key its built
// runtime declares (merged through `extends`/`mixins`) must exist in the declared
// `$props` type, so full or partial erasure of prop types fails with the missing
// keys named. Components that declare no runtime props are reported as propless.
// Requires a prior `pnpm run build`. `--diagnostics` also prints vue-tsc's
// extended diagnostics (check time, memory) for the size/cost record.
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const VUE_DIR = join(fileURLToPath(import.meta.url), "..", "..");
const PACKAGES_DIR = join(VUE_DIR, "..");
const FIXTURES_DIR = join(VUE_DIR, "test", "consumer-types");
const VUE_TSC = join(VUE_DIR, "node_modules", ".bin", "vue-tsc");
const DIAGNOSTICS = process.argv.includes("--diagnostics");

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
function keys(c, seen = new Set()) {
  if (!c || typeof c !== "object" || seen.has(c)) return [];
  seen.add(c);
  const own = Array.isArray(c.props) ? c.props : Object.keys(c.props ?? {});
  return [...keys(c.extends, seen), ...(c.mixins ?? []).flatMap((m) => keys(m, seen)), ...own];
}
const out = {};
for (const name of names) {
  if (!vue[name]) throw new Error("@ultimate/vue does not export " + name);
  out[name] = [...new Set(keys(vue[name]))].sort();
}
process.stdout.write(JSON.stringify(out));
`;

// One type-level assertion per exported component: no runtime prop key may be
// missing from the component's declared $props.
function writePropsInvariant(consumerDir) {
  const components = exportedComponents();
  writeFileSync(join(consumerDir, "runtime-props.mjs"), RUNTIME_PROPS_SCRIPT);
  const runtimeProps = JSON.parse(
    execFileSync(process.execPath, ["runtime-props.mjs", JSON.stringify(components)], {
      cwd: consumerDir,
      encoding: "utf8",
    })
  );
  const propless = components.filter((name) => runtimeProps[name].length === 0);
  const lines = [
    'import type * as V from "@ultimate/vue";',
    "type Props<C> = C extends abstract new (...args: any) => infer I ? (I extends { $props: infer P } ? P : never) : never;",
    "type Missing<C, K extends string> = Exclude<K, keyof Props<C>>;",
    ...components
      .filter((name) => runtimeProps[name].length > 0)
      .map(
        (name) =>
          `export const ${name}_missingProps: never = null as unknown as Missing<typeof V.${name}, ${runtimeProps[
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

function writeConsumer(consumerDir, tarballs) {
  const overrides = Object.fromEntries([...tarballs].map(([name, tgz]) => [name, `file:${tgz}`]));
  const vueVersion = readManifest(join(VUE_DIR, "node_modules", "vue")).version;
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "ultimate-vue-consumer-types",
        private: true,
        type: "module",
        dependencies: { "@ultimate/vue": `file:${tarballs.get("@ultimate/vue")}`, vue: vueVersion },
        pnpm: { overrides },
      },
      null,
      2
    )
  );

  const exportKeys = Object.keys(readManifest(VUE_DIR).exports).filter(
    (key) => key !== "./package.json"
  );
  const imports = exportKeys.map((key, i) => {
    const specifier = key === "." ? "@ultimate/vue" : `@ultimate/vue/${key.slice(2)}`;
    return `import * as m${i} from "${specifier}";`;
  });
  imports.push(`export const allEntries = [${exportKeys.map((_, i) => `m${i}`).join(", ")}];`);
  writeFileSync(join(consumerDir, "all-entries.ts"), `${imports.join("\n")}\n`);

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
  return exportKeys.length;
}

function main() {
  const workDir = mkdtempSync(join(tmpdir(), "ultimate-vue-consumer-types-"));
  let failed = false;
  try {
    const packDir = join(workDir, "packs");
    const consumerDir = join(workDir, "consumer");
    execFileSync("mkdir", ["-p", packDir, consumerDir]);
    const tarballs = new Map();
    for (const [name, dir] of runtimeClosure()) tarballs.set(name, pack(dir, packDir));
    const entryCount = writeConsumer(consumerDir, tarballs);
    execFileSync("pnpm", ["install", "--no-lockfile", "--prefer-offline"], {
      cwd: consumerDir,
      stdio: "ignore",
    });
    const invariant = writePropsInvariant(consumerDir);

    for (const mode of ["bundler", "nodenext"]) {
      const args = [
        "-p",
        `tsconfig.${mode}.json`,
        ...(DIAGNOSTICS ? ["--extendedDiagnostics"] : []),
      ];
      const run = spawnSync(VUE_TSC, args, { cwd: consumerDir, encoding: "utf8" });
      const output = `${run.stdout}${run.stderr}`.trim();
      if (run.status === 0) {
        console.log(
          `[validate-consumer-types] OK (${mode}): ${entryCount} entry points, fixtures, and props invariant ` +
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
        failed = true;
        console.error(`[validate-consumer-types] FAIL (${mode}):\n${output}`);
      }
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
}

main();
