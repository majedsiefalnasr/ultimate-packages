#!/usr/bin/env node
// scripts/prime-reference/check-records.mjs
//
// Record checking tool for the Prime reference study (docs/prime-reference/).
// It reports, by file name, every problem it finds in the hand-written notes:
//
//   section        a component record without all twelve sections, in the
//                  template order, each with some content (README "Component
//                  records")
//   citation       a `<package>-<version>:<path>` citation whose package or
//                  version is not a pinned archive, or whose path does not
//                  exist in that archive (records and foundation notes)
//   unmapped-item  a showcase menu item (all three frameworks) that maps to no
//                  record, foundation note or listed exclusion
//   missing-target a mapping entry that points at a record or foundation note
//                  that does not exist
//   stale-mapping  a mapping entry that matches no menu item
//   orphan         a record that no menu item maps to
//
// Inputs are the pinned archives in .vendor-cache/ (ADR-048) only; the archives
// are read directly with `tar` (listing and one member), so no network access
// and no extraction step is needed. Output is sorted and deterministic.
//
// Usage:
//   node scripts/prime-reference/check-records.mjs
//   options: --vendor-dir <dir>  --docs-dir <dir>  --json
// Exit code 1 when any problem is reported, 0 otherwise.
//
// Menu mapping. A menu item is addressed by its path in the showcase menu,
// joined with " / " (for example `Components / Form / Select`). An item under
// `Components` whose last segment, lower-cased with non-alphanumerics removed,
// equals a record file name maps to that record automatically. Everything else
// is listed in docs/prime-reference/coverage-map.json:
//
//   {
//     "schemaVersion": 1,
//     "primeng": { "<menu path>": { "record": "datatable" } },
//     "primevue": { "<menu path>": { "foundation": "foundations/primevue.md" } },
//     "primereact": { "<menu path>": { "excluded": "<reason>" } }
//   }
//
// A key may name a group; it then covers every item below it. The most
// specific key wins. Verified on demand; it is not CI-enforced because CI does
// not hold all archives.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { REPO_ROOT, resolveVendorDir } from "./generate-catalog.mjs";

export const DOCS_DIR = join(REPO_ROOT, "docs/prime-reference");
export const SECTIONS = [
  "Summary",
  "Names & status",
  "Per framework",
  "Anatomy",
  "API highlights",
  "Usage guidance",
  "Accessibility",
  "Theming",
  "Relationships",
  "Dependencies",
  "Framework differences",
  "Sources",
];
export const FRAMEWORK_MENUS = [
  { framework: "primeng", package: "primeng", path: "apps/showcase/assets/data/menu.json" },
  { framework: "primevue", package: "primevue", path: "apps/showcase/assets/menu/menu.json" },
  { framework: "primereact", package: "primereact", path: "components/layout/menu.json" },
];

const CITATION =
  /(@primeuix\/[a-z]+|primeng|primevue|primereact)-(\d+\.\d+\.\d+):([A-Za-z0-9_@./[\]*{},-]+)/g;
const MENU_SEP = " / ";

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------- sections --

function h2Headings(text) {
  const lines = text.split("\n");
  const found = [];
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) fence = !fence;
    if (fence) continue;
    const m = /^## (.+?)\s*$/.exec(lines[i]);
    if (m) found.push({ title: m[1], line: i });
  }
  return { lines, found };
}

export function checkSections(name, text) {
  const problems = [];
  const expected = SECTIONS.map((title, i) => `${i + 1}. ${title}`);
  const { lines, found } = h2Headings(text);
  const titles = found.map((h) => h.title);
  for (const want of expected) {
    if (!titles.includes(want)) {
      problems.push({ kind: "section", subject: name, detail: `missing section "## ${want}"` });
    }
  }
  for (const title of titles) {
    if (!expected.includes(title)) {
      problems.push({ kind: "section", subject: name, detail: `unexpected heading "## ${title}"` });
    }
  }
  const known = titles.filter((t) => expected.includes(t));
  const inOrder = [...known].sort((a, b) => expected.indexOf(a) - expected.indexOf(b));
  if (known.join("\n") !== inOrder.join("\n")) {
    problems.push({
      kind: "section",
      subject: name,
      detail: `sections out of order (found ${known.map((t) => t.split(".")[0]).join(",")})`,
    });
  }
  found.forEach((heading, index) => {
    if (!expected.includes(heading.title)) return;
    const end = index + 1 < found.length ? found[index + 1].line : lines.length;
    if (!lines.slice(heading.line + 1, end).some((l) => l.trim() !== "")) {
      problems.push({
        kind: "section",
        subject: name,
        detail: `empty section "## ${heading.title}" (write N/A when there is nothing to say)`,
      });
    }
  });
  return problems;
}

// --------------------------------------------------------------- citations --

export function extractCitations(text) {
  const out = [];
  for (const m of text.matchAll(CITATION)) {
    const path = m[3].replace(/[.,]+$/, "");
    if (/[*{}]/.test(path)) continue; // glob or brace pattern, not a single path
    out.push({ pkg: `${m[1]}-${m[2]}`, path });
  }
  return out;
}

export function checkCitations(name, text, archives) {
  const problems = [];
  const seen = new Set();
  for (const { pkg, path } of extractCitations(text)) {
    const key = `${pkg}:${path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const archive = archives[pkg];
    if (!archive) {
      problems.push({
        kind: "citation",
        subject: name,
        detail: `unknown archive "${pkg}" in ${key}`,
      });
    } else if (!archive.has(path.replace(/\/$/, ""))) {
      problems.push({ kind: "citation", subject: name, detail: `path not in archive: ${key}` });
    }
  }
  return problems;
}

// ---------------------------------------------------------------- coverage --

export function flattenMenu(menu) {
  const items = [];
  const walk = (node, trail) => {
    const path = [...trail, node.name];
    if (Array.isArray(node.children) && node.children.length > 0) {
      for (const child of node.children) walk(child, path);
    } else {
      items.push(path.join(MENU_SEP));
    }
  };
  for (const group of menu.data) walk(group, []);
  return items;
}

const normalizeName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function lookupMapping(entries, path) {
  const segments = path.split(MENU_SEP);
  for (let n = segments.length; n >= 1; n--) {
    const key = segments.slice(0, n).join(MENU_SEP);
    if (Object.hasOwn(entries, key)) return { key, target: entries[key] };
  }
  return undefined;
}

function describeTarget(target) {
  if (target.record) return `record ${target.record}`;
  if (target.foundation) return `foundation ${target.foundation}`;
  return `excluded: ${target.excluded}`;
}

export function checkCoverage({ menus, mapping, records, foundationExists }) {
  const problems = [];
  const coverage = [];
  const mappedRecords = new Set();
  const recordSet = new Set(records);

  for (const [framework, menu] of Object.entries(menus)) {
    const entries = mapping[framework] ?? {};
    const used = new Set();
    for (const item of flattenMenu(menu)) {
      const hit = lookupMapping(entries, item);
      let target = hit?.target;
      if (hit) used.add(hit.key);
      if (!target) {
        const segments = item.split(MENU_SEP);
        const guess = normalizeName(segments[segments.length - 1]);
        if (segments[0] === "Components" && recordSet.has(guess)) target = { record: guess };
      }
      if (!target) {
        problems.push({
          kind: "unmapped-item",
          subject: `${framework}: ${item}`,
          detail: "no record, foundation or exclusion",
        });
        continue;
      }
      if (target.record) {
        mappedRecords.add(target.record);
        if (!recordSet.has(target.record)) {
          problems.push({
            kind: "missing-target",
            subject: `${framework}: ${item}`,
            detail: `record "${target.record}" does not exist`,
          });
        }
      } else if (target.foundation) {
        if (!foundationExists(target.foundation)) {
          problems.push({
            kind: "missing-target",
            subject: `${framework}: ${item}`,
            detail: `foundation note "${target.foundation}" does not exist`,
          });
        }
      } else if (!target.excluded) {
        problems.push({
          kind: "missing-target",
          subject: `${framework}: ${item}`,
          detail: "mapping entry has no record, foundation or excluded",
        });
      }
      coverage.push({ framework, item, target: describeTarget(target) });
    }
    for (const key of Object.keys(entries)) {
      if (!used.has(key)) {
        problems.push({
          kind: "stale-mapping",
          subject: `${framework}: ${key}`,
          detail: "mapping entry matches no menu item",
        });
      }
    }
  }
  for (const record of records) {
    if (!mappedRecords.has(record)) {
      problems.push({
        kind: "orphan",
        subject: `components/${record}.md`,
        detail: "no menu item maps to this record",
      });
    }
  }
  return { problems, coverage };
}

// -------------------------------------------------------------------- core --

function listMarkdown(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(path));
    else if (entry.name.endsWith(".md")) out.push(path);
  }
  return out.sort(byText);
}

/**
 * Check a whole set of records.
 * @param {object} options
 * @param {string} options.docsDir  folder holding components/, foundations/ and coverage-map.json
 * @param {Record<string, Set<string>>} options.archives  "<package>-<version>" -> every file and folder path in the archive
 * @param {Record<string, {data: object[]}>} options.menus  framework -> showcase menu JSON
 * @param {object} [options.mapping]  defaults to <docsDir>/coverage-map.json
 */
export function checkRecords({ docsDir, archives, menus, mapping }) {
  const map =
    mapping ??
    (existsSync(join(docsDir, "coverage-map.json"))
      ? JSON.parse(readFileSync(join(docsDir, "coverage-map.json"), "utf8"))
      : {});
  const recordFiles = listMarkdown(join(docsDir, "components"));
  const records = recordFiles.map((f) => basename(f, ".md"));
  const problems = [];

  for (const file of recordFiles) {
    const text = readFileSync(file, "utf8");
    problems.push(...checkSections(file.slice(docsDir.length + 1), text));
  }
  for (const file of [...recordFiles, ...listMarkdown(join(docsDir, "foundations"))]) {
    const name = file.slice(docsDir.length + 1);
    problems.push(...checkCitations(name, readFileSync(file, "utf8"), archives));
  }
  const coverage = checkCoverage({
    menus,
    mapping: map,
    records,
    foundationExists: (rel) => existsSync(join(docsDir, rel)),
  });
  problems.push(...coverage.problems);
  problems.sort(
    (a, b) => byText(a.kind, b.kind) || byText(a.subject, b.subject) || byText(a.detail, b.detail)
  );
  return { problems, coverage: coverage.coverage, stats: { records: records.length } };
}

export function formatReport(result) {
  const lines = result.problems.map((p) => `${p.kind}\t${p.subject}\t${p.detail}`);
  const counts = {};
  for (const p of result.problems) counts[p.kind] = (counts[p.kind] ?? 0) + 1;
  const summary = Object.keys(counts)
    .sort(byText)
    .map((k) => `${k}=${counts[k]}`)
    .join(" ");
  lines.push(
    `${result.stats.records} records checked, ${result.problems.length} problems` +
      (summary ? ` (${summary})` : "")
  );
  return lines.join("\n");
}

// ---------------------------------------------------------------- archives --

function tarList(archive) {
  return execFileSync("tar", ["-tzf", archive], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  })
    .split("\n")
    .filter(Boolean);
}

/** Every file and folder path in a tar.gz, without its single top-level folder. */
export function indexArchive(archive) {
  const paths = new Set();
  for (const entry of tarList(archive)) {
    const rel = entry.split("/").slice(1).join("/").replace(/\/$/, "");
    if (!rel) continue;
    const parts = rel.split("/");
    for (let i = 1; i <= parts.length; i++) paths.add(parts.slice(0, i).join("/"));
  }
  return paths;
}

function readArchiveMember(archive, rel) {
  const root = tarList(archive)[0].split("/")[0];
  return execFileSync("tar", ["-xzOf", archive, `${root}/${rel}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

export function loadArchives({ vendorDir, repoRoot = REPO_ROOT } = {}) {
  const dir = resolveVendorDir({ vendorDir, repoRoot });
  const checksums = JSON.parse(
    readFileSync(join(repoRoot, "docs/architecture/checksums.json"), "utf8")
  );
  const archives = {};
  const menus = {};
  for (const artifact of checksums.artifacts) {
    const file = join(dir, basename(artifact.cachedAt));
    if (!existsSync(file)) {
      throw new Error(`Missing archive ${file}; run \`pnpm run vendor:fetch\` first.`);
    }
    archives[`${artifact.package}-${artifact.version}`] = indexArchive(file);
    const menu = FRAMEWORK_MENUS.find((m) => m.package === artifact.package);
    if (menu) menus[menu.framework] = JSON.parse(readArchiveMember(file, menu.path));
  }
  return { archives, menus };
}

// --------------------------------------------------------------------- cli --

function parseArgs(argv) {
  const options = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") options.json = true;
    else if (arg === "--vendor-dir") options.vendorDir = argv[++i];
    else if (arg === "--docs-dir") options.docsDir = resolve(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { archives, menus } = loadArchives({ vendorDir: options.vendorDir });
  const result = checkRecords({ docsDir: options.docsDir ?? DOCS_DIR, archives, menus });
  console.log(options.json ? JSON.stringify(result, null, 2) : formatReport(result));
  process.exitCode = result.problems.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
