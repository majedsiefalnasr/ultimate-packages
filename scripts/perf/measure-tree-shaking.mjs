#!/usr/bin/env node
// scripts/perf/measure-tree-shaking.mjs
//
// ADR-057 Stage 1, category P2 (tree-shaking). Generalizes
// scripts/provenance/verify-tree-shaking{,-react,-vue}.mjs, which stay as they
// are. For every component subpath that a framework package exports, it builds
// two real esbuild production bundles (minified, against the built dist/, not
// src/): one importing the component from its subpath
// (`@ultimate/<pkg>/<subpath>`) and one importing the same export from the
// barrel (`@ultimate/<pkg>`). It records the bundle bytes and which *other*
// components' code ended up in the bundle.
//
// A barrel that does not export the component is reported under `unmeasured`
// in the output file, not as a failure. Output shape:
//   { identity, protocol, category: "P2", results: [{ subject, metric, samples,
//     summary, export, import, foreignComponents }], unmeasured: [...] }
//
// The measurement is deterministic, so each subject has one sample and the
// protocol is { W: 0, R: 1, I: 1 }.
//
// Run `pnpm run build` first. Usage:
//   node scripts/perf/measure-tree-shaking.mjs [--out perf-results/p2.json]
//
// Foreign component: a module that contributes bytes to the bundle and lives
// under another component's source or dist directory (any workspace package,
// for example packages/uix-styles/dist/dialog/ in a button bundle). Names are
// compared with hyphens removed and in lower case, because the shared style
// packages spell directories "inputnumber" where subpaths say "input-number".
// A module that was included but contributes 0 bytes is not present code.

import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runIdentity } from "./run-identity.mjs";
import { summarize } from "./stage1-stats.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Peer dependencies stay external: they are not part of the package's own shaking. */
const FRAMEWORKS = {
  ng: { dir: "ng", external: ["@angular/*", "rxjs", "rxjs/*", "tslib"] },
  react: { dir: "react", external: ["react", "react-dom", "react/*", "react-dom/*"] },
  vue: { dir: "vue", external: ["vue", "vue/*"] },
};

/** `exports` keys that are not component entries. */
export const NON_COMPONENT_SUBPATHS = new Set([".", "./package.json"]);

export function isComponentSubpath(subpath) {
  return !NON_COMPONENT_SUBPATHS.has(subpath);
}

const normalize = (name) => name.replace(/-/g, "").toLowerCase();

/** `./radio-button` -> `URadioButton`. */
export function componentNameFor(subpath) {
  const pascal = subpath
    .replace(/^\.\//, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `U${pascal}`;
}

/** The export to import: exact U-name, else the first U-prefixed export, else the first export. */
export function pickComponentExport(exportNames, subpath) {
  const expected = componentNameFor(subpath);
  if (exportNames.includes(expected)) return expected;
  return exportNames.find((name) => /^U[A-Z]/.test(name)) ?? exportNames[0];
}

function belongsTo(inputPath, name) {
  const wanted = normalize(name);
  const segments = inputPath.split("/");
  const isRoot = (segment) => segment === "dist" || segment === "src";
  const adjacent = segments.some(
    (segment, i) =>
      normalize(segment) === wanted &&
      (isRoot(segments[i - 1] ?? "") || isRoot(segments[i + 1] ?? ""))
  );
  // Angular secondary entry points are flat files: fesm2022/ultimate-ng-<name>.mjs
  const base = (segments.at(-1) ?? "").replace(/\.[^.]+$/, "");
  return adjacent || normalize(base) === normalize(`ultimate-ng-${name}`);
}

/**
 * Pure. `bytes` is the size of the (single) output file; `foreignComponents`
 * lists the other components that have code in it.
 */
export function classifyBundle(metafile, componentName, otherComponentNames) {
  const output = Object.values(metafile.outputs)[0];
  const present = Object.entries(output.inputs)
    .filter(([, input]) => input.bytesInOutput > 0)
    .map(([path]) => path);
  const foreignComponents = otherComponentNames
    .filter((name) => name !== componentName)
    .filter((name) => present.some((path) => belongsTo(path, name)))
    .sort();
  return { bytes: output.bytes, foreignComponents };
}

/** Resolve @ultimate/<pkg>[/subpath] imports to the built files named in package.json `exports`. */
function selfResolvePlugin(pkgName, pkgDir, exportsMap) {
  return {
    name: "self-resolve",
    setup(b) {
      b.onResolve({ filter: new RegExp(`^${pkgName}(/.*)?$`) }, (args) => {
        const key = args.path === pkgName ? "." : `.${args.path.slice(pkgName.length)}`;
        const target = exportsMap[key];
        const file = typeof target === "string" ? target : (target?.import ?? target?.default);
        return file ? { path: join(pkgDir, file) } : undefined;
      });
    },
  };
}

function bundleOptions(framework, pkgJson, pkgDir) {
  return {
    bundle: true,
    write: false,
    metafile: true,
    minify: true,
    format: "esm",
    platform: "browser",
    absWorkingDir: pkgDir,
    external: FRAMEWORKS[framework].external,
    plugins: [selfResolvePlugin(pkgJson.name, pkgDir, pkgJson.exports)],
    logLevel: "silent",
  };
}

async function exportNamesOf(framework, pkgJson, pkgDir, subpath) {
  const result = await build({
    ...bundleOptions(framework, pkgJson, pkgDir),
    stdin: { contents: `export * from "${pkgJson.name}/${subpath.slice(2)}";`, resolveDir: pkgDir },
    packages: "external",
    minify: false,
  });
  return Object.values(result.metafile.outputs)[0].exports;
}

/** Returns null when the import specifier does not export `exportName` (a finding, not an error). */
async function measureImport(framework, pkgJson, pkgDir, importSpecifier, exportName, others, own) {
  try {
    const result = await build({
      ...bundleOptions(framework, pkgJson, pkgDir),
      stdin: {
        contents: `import { ${exportName} } from "${importSpecifier}";\nconsole.log(${exportName});\n`,
        resolveDir: pkgDir,
      },
    });
    return classifyBundle(result.metafile, own, others);
  } catch (error) {
    if (String(error.message).includes("No matching export")) return null;
    throw error;
  }
}

export async function measureFramework(framework) {
  const pkgDir = join(repoRoot, "packages", FRAMEWORKS[framework].dir);
  const pkgJson = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const subpaths = Object.keys(pkgJson.exports).filter(isComponentSubpath);
  const names = subpaths.map((subpath) => subpath.slice(2));
  const results = [];
  const unmeasured = [];
  for (const subpath of subpaths) {
    const name = subpath.slice(2);
    const exportName = pickComponentExport(
      await exportNamesOf(framework, pkgJson, pkgDir, subpath),
      subpath
    );
    for (const [kind, specifier] of [
      ["subpath", `${pkgJson.name}/${name}`],
      ["barrel", pkgJson.name],
    ]) {
      const measured = await measureImport(
        framework,
        pkgJson,
        pkgDir,
        specifier,
        exportName,
        names,
        name
      );
      if (measured === null) {
        unmeasured.push({
          subject: `${framework}:${name}`,
          metric: `${kind}-bundle-bytes`,
          reason: `${specifier} does not export ${exportName}`,
        });
        continue;
      }
      const { bytes, foreignComponents } = measured;
      results.push({
        subject: `${framework}:${name}`,
        metric: `${kind}-bundle-bytes`,
        samples: [bytes],
        summary: summarize([bytes]),
        export: exportName,
        import: specifier,
        foreignComponents,
      });
    }
  }
  return { results, unmeasured };
}

async function main() {
  const outIndex = process.argv.indexOf("--out");
  const out = outIndex === -1 ? "perf-results/p2.json" : process.argv[outIndex + 1];
  for (const { dir } of Object.values(FRAMEWORKS)) {
    if (!existsSync(join(repoRoot, "packages", dir, "dist"))) {
      console.error(
        `[measure-tree-shaking] FATAL: packages/${dir}/dist is missing. Run "pnpm run build" first.`
      );
      process.exit(1);
    }
  }
  const results = [];
  const unmeasured = [];
  for (const framework of Object.keys(FRAMEWORKS)) {
    const measured = await measureFramework(framework);
    results.push(...measured.results);
    unmeasured.push(...measured.unmeasured);
  }

  const artifact = {
    identity: runIdentity(),
    protocol: { W: 0, R: 1, I: 1 },
    category: "P2",
    results,
    unmeasured,
  };
  const outPath = resolve(repoRoot, out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

  const leaking = results.filter((r) => r.foreignComponents.length > 0);
  console.log(`[measure-tree-shaking] ${results.length} measurements written to ${out}`);
  for (const framework of Object.keys(FRAMEWORKS)) {
    const count = results.filter(
      (r) => r.subject.startsWith(`${framework}:`) && r.metric.startsWith("subpath")
    ).length;
    console.log(`[measure-tree-shaking]   ${framework}: ${count} components`);
  }
  console.log(
    `[measure-tree-shaking] ${unmeasured.length} import(s) not measurable (barrel lacks the export); listed under "unmeasured"`
  );
  console.log(
    `[measure-tree-shaking] ${leaking.length} measurement(s) include other components' code (findings, not failures)`
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
