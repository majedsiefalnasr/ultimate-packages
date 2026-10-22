#!/usr/bin/env node
// scripts/prime-reference/generate-catalog.mjs
//
// Generates the Prime catalog (docs/prime-reference/catalog/*.json): the API
// facts that each pinned Prime framework archive publishes in its showcase
// apidoc index, with every prose field removed.
//
// Inputs are the pinned archives in .vendor-cache/ (ADR-048) only. Each archive
// is verified against docs/architecture/checksums.json before anything is read
// from it, and the apidoc JSON is streamed straight out of the .tar.gz with
// `tar -xzOf`, so a fresh checkout that holds only the archives is enough.
//
// Usage:
//   node scripts/prime-reference/generate-catalog.mjs            # write catalog
//   node scripts/prime-reference/generate-catalog.mjs --check    # fail if stale
//   options: --out <dir>  --vendor-dir <dir>
//
// Vendor directory lookup (first existing wins): --vendor-dir, the
// PRIME_VENDOR_CACHE environment variable, <repo>/.vendor-cache, then
// <main checkout>/.vendor-cache (so linked git worktrees reuse one cache).
// A missing archive or a checksum mismatch is a hard failure.
//
// Output schema (schemaVersion 1), one file per framework:
//
//   {
//     "header": {
//       "archive": ".vendor-cache/<file>.tar.gz",
//       "archiveSha256": "<sha256 from checksums.json, verified>",
//       "commit": "<pinned git commit>",
//       "counts": { "components": <n>, "modules": <n> },
//       "generator": "scripts/prime-reference/generate-catalog.mjs",
//       "package": "primeng" | "primevue" | "primereact",
//       "schemaVersion": 1,
//       "source": "<package>-<version>:<apidoc path inside the archive>",
//       "version": "<pinned version>"
//     },
//     "modules": { "<upstream module key>": <module> }
//   }
//
// <module> keeps the upstream apidoc structure of that framework, transformed by
// these rules only (see docs/prime-reference/catalog/README.md):
//   1. Prose is dropped: every `description`, `eventDescription`,
//      `methodDescription` and `typeDescription` key.
//   2. Section wrappers `{ description, values }` collapse to their `values`,
//      so `components.Button.props.values[]` becomes `components.Button.props[]`
//      and `types.values.Foo.values` (a type alias string) becomes `types.Foo`.
//   3. Empty strings, nulls, empty arrays and empty objects are omitted
//      (upstream uses `""` for "no default" and `[]` for "none").
//   4. `deprecated` keeps only its first line (later lines repeat prose).
//   5. Type-like strings lose showcase HTML markup (`<span ...>`), HTML
//      entities are decoded (`&rArr;` -> `=>`), `// comment` text inside
//      multi-line object types is removed, and multi-line values are folded
//      onto one line.
//   6. Object keys are sorted. Arrays of named entries (`name` or `class`) are
//      sorted by that key, except `parameters`, whose order is the call
//      signature and is kept as published.
// Entries carry only fact fields: name, type, default, optional, readonly,
// deprecated, parameters, returnType, parent, value, class, members,
// relatedProp, extendedTypes, extendedBy, and the section keys of the
// framework (props, emits, templates, methods, events, callbacks, interfaces,
// types, enumerations, functions, model, style, classes, components, tokens).
// Output is 2-space JSON with a trailing newline and no timestamps, so two runs
// over the same archives are byte-identical.

import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DEFAULT_OUT_DIR = join(REPO_ROOT, "docs/prime-reference/catalog");
const CHECKSUMS_PATH = "docs/architecture/checksums.json";
const GENERATOR = "scripts/prime-reference/generate-catalog.mjs";
const SCHEMA_VERSION = 1;

export const FRAMEWORKS = [
  { package: "primeng", apidocPath: "apps/showcase/doc/apidoc/index.json" },
  { package: "primevue", apidocPath: "apps/showcase/doc/common/apidoc/index.json" },
  { package: "primereact", apidocPath: "components/doc/common/apidoc/index.json" },
];

const PROSE_KEYS = new Set([
  "description",
  "eventDescription",
  "methodDescription",
  "typeDescription",
]);
const WRAPPER_KEYS = new Set([...PROSE_KEYS, "values"]);
const ORDERED_ARRAY_KEYS = new Set(["parameters"]);
const VERBATIM_STRING_KEYS = new Set(["name", "class"]);
const ENTITIES = { "&rArr;": "=>", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&amp;": "&" };

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function cleanString(key, value) {
  if (VERBATIM_STRING_KEYS.has(key)) return value;
  let text = value;
  if (key === "deprecated") text = text.split("\n")[0];
  text = text.replace(/<\/?span\b[^>]*>/g, "");
  text = text.replace(/&(?:rArr|lt|gt|quot|amp);/g, (entity) => ENTITIES[entity]);
  if (text.includes("\n")) {
    text = text
      .split("\n")
      .map((line) => line.replace(/,\s*\/\/[^"\n]*"/, '"').replace(/\s+\/\/.*$/, ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/,\s*([}\]])/g, " $1");
  }
  return text.trim();
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isWrapper(value) {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  return keys.includes("values") && keys.every((key) => WRAPPER_KEYS.has(key));
}

function entrySortKey(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return undefined;
  const key = entry.name ?? entry.class;
  return typeof key === "string" || typeof key === "number" ? String(key) : undefined;
}

// Recursively applies the schema rules from the header comment. Returns
// undefined for values that are omitted (rule 3).
export function normalize(value, key = "") {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const text = cleanString(key, value);
    return text === "" ? undefined : text;
  }
  if (typeof value !== "object") return value;
  if (isWrapper(value)) return normalize(value.values, key);
  if (Array.isArray(value)) {
    const items = value.map((item) => normalize(item, key)).filter((item) => item !== undefined);
    if (items.length === 0) return undefined;
    if (!ORDERED_ARRAY_KEYS.has(key) && items.every((item) => entrySortKey(item) !== undefined)) {
      items.sort(
        (a, b) =>
          compareStrings(entrySortKey(a), entrySortKey(b)) ||
          compareStrings(JSON.stringify(a), JSON.stringify(b))
      );
    }
    return items;
  }
  const result = {};
  for (const childKey of Object.keys(value).sort(compareStrings)) {
    if (PROSE_KEYS.has(childKey)) continue;
    let child = normalize(value[childKey], childKey);
    // A component whose every member was empty still exists: keep it as {}.
    if (child === undefined && key === "components" && isObject(value[childKey])) child = {};
    if (child !== undefined) result[childKey] = child;
  }
  return Object.keys(result).length === 0 ? undefined : result;
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const key of Object.keys(value).sort(compareStrings)) result[key] = sortKeysDeep(value[key]);
  return result;
}

function countComponents(modules) {
  let count = 0;
  for (const module of Object.values(modules)) {
    if (module.components && typeof module.components === "object") {
      count += Object.keys(module.components).length;
    }
  }
  return count;
}

export function buildCatalog(framework, artifact, apidoc) {
  const modules = {};
  for (const moduleKey of Object.keys(apidoc).sort(compareStrings)) {
    const module = normalize(apidoc[moduleKey]);
    modules[moduleKey] = module ?? {};
  }
  return sortKeysDeep({
    header: {
      archive: artifact.cachedAt,
      archiveSha256: artifact.sha256,
      commit: artifact.identifier,
      counts: { components: countComponents(modules), modules: Object.keys(modules).length },
      generator: GENERATOR,
      package: framework.package,
      schemaVersion: SCHEMA_VERSION,
      source: `${framework.package}-${artifact.version}:${framework.apidocPath}`,
      version: artifact.version,
    },
    modules,
  });
}

export function serialize(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

function readArtifacts(repoRoot) {
  const checksums = JSON.parse(readFileSync(join(repoRoot, CHECKSUMS_PATH), "utf8"));
  return checksums.artifacts;
}

function mainCheckoutRoot(repoRoot) {
  try {
    const commonDir = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).trim();
    return dirname(commonDir);
  } catch {
    return undefined;
  }
}

export function resolveVendorDir({ vendorDir, repoRoot = REPO_ROOT } = {}) {
  if (vendorDir) return resolve(vendorDir);
  if (process.env.PRIME_VENDOR_CACHE) return resolve(process.env.PRIME_VENDOR_CACHE);
  const local = join(repoRoot, ".vendor-cache");
  if (existsSync(local)) return local;
  const main = mainCheckoutRoot(repoRoot);
  if (main && existsSync(join(main, ".vendor-cache"))) return join(main, ".vendor-cache");
  return local;
}

async function sha256File(path) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}

async function readVerifiedApidoc(framework, artifact, vendorDir) {
  const archivePath = join(vendorDir, artifact.cachedAt.replace(/^\.vendor-cache\//, ""));
  if (!existsSync(archivePath)) {
    throw new Error(
      `${framework.package}: archive not found at ${archivePath}. ` +
        `Fetch it with: pnpm run vendor:fetch -- ${framework.package}`
    );
  }
  const actual = await sha256File(archivePath);
  if (actual !== artifact.sha256) {
    throw new Error(
      `${framework.package}: sha256 mismatch for ${archivePath}: expected ${artifact.sha256} ` +
        `(${CHECKSUMS_PATH}), got ${actual}`
    );
  }
  const memberPath = `${framework.package}-${artifact.identifier}/${framework.apidocPath}`;
  const text = execFileSync("tar", ["-xzOf", archivePath, memberPath], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(text);
}

// Builds every framework catalog and returns { "<package>.json": "<content>" }.
export async function generateCatalogFiles({ vendorDir, repoRoot = REPO_ROOT } = {}) {
  const artifacts = readArtifacts(repoRoot);
  const resolvedVendorDir = resolveVendorDir({ vendorDir, repoRoot });
  const files = {};
  for (const framework of FRAMEWORKS) {
    const matches = artifacts.filter((artifact) => artifact.package === framework.package);
    if (matches.length !== 1) {
      throw new Error(`${framework.package}: expected exactly one entry in ${CHECKSUMS_PATH}`);
    }
    const apidoc = await readVerifiedApidoc(framework, matches[0], resolvedVendorDir);
    files[`${framework.package}.json`] = serialize(buildCatalog(framework, matches[0], apidoc));
  }
  return files;
}

// Writes the catalog files into outDir and returns the generated file map.
export async function generateCatalog({ outDir = DEFAULT_OUT_DIR, vendorDir, repoRoot } = {}) {
  const files = await generateCatalogFiles({ vendorDir, repoRoot });
  mkdirSync(outDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(outDir, name), content);
  return files;
}

// Returns the names of committed catalog files that differ from a fresh build.
export async function findStaleFiles({ outDir = DEFAULT_OUT_DIR, vendorDir, repoRoot } = {}) {
  const files = await generateCatalogFiles({ vendorDir, repoRoot });
  return Object.entries(files)
    .filter(([name, content]) => {
      const path = join(outDir, name);
      return !existsSync(path) || readFileSync(path, "utf8") !== content;
    })
    .map(([name]) => name);
}

function parseArgs(argv) {
  const options = { check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--out") options.outDir = resolve(argv[++index] ?? "");
    else if (arg === "--vendor-dir") options.vendorDir = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.check) {
    const stale = await findStaleFiles(options);
    if (stale.length > 0) {
      console.error(`Prime catalog is stale: ${stale.join(", ")}. Run node ${GENERATOR}`);
      process.exit(1);
    }
    console.log("Prime catalog is up to date.");
    return;
  }
  const files = await generateCatalog(options);
  for (const [name, content] of Object.entries(files)) {
    console.log(`wrote ${name} (${Buffer.byteLength(content)} bytes)`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
