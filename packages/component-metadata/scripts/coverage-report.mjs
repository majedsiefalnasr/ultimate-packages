// Metadata coverage report (Spec B4-R3/B4-R4, ADR-058 DOC-1/DOC-4).
//
// Lists every shipped component (per framework) that lacks a metadata record,
// the record's `api[framework]` / `accessibility` / `guidance` facts, a Skill
// file, or Storybook stories. Report mode exits 0 until the C02 component
// denominator is settled; `--enforce` exits 1 when anything is missing and is
// switched on by a later, separately authorized change.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "../../..");
export const FRAMEWORKS = ["ng", "react", "vue"];

// Entries of a framework package's `exports` map that are not documented
// components, so they are not expected to have a record, Skill or stories:
// - ".", "./package.json": package entry points, not components.
// - Behavioural directives with no rendered output and no component page:
//   autofocus, ripple, key-filter, style-class, animate-on-scroll.
// - Compound sub-parts documented under their parent: accordion-panel,
//   accordion-header, accordion-content (parts of Accordion).
// Directives that are documented components (tooltip, which has a record) and
// wrapper components (fluid, deferred-content) stay in the denominator.
export const NON_COMPONENT_SUBPATHS = new Set([
  ".",
  "./package.json",
  "./autofocus",
  "./ripple",
  "./key-filter",
  "./style-class",
  "./animate-on-scroll",
  "./accordion-panel",
  "./accordion-header",
  "./accordion-content",
]);

// Record names, subpaths, Skill file names and story directories all compare
// in this form: lowercase, hyphens stripped ("RadioButton" == "radio-button").
export function normalizeName(name) {
  return name.replace(/-/g, "").toLowerCase();
}

export function shippedComponents(packageJson) {
  return Object.keys(packageJson.exports ?? {})
    .filter((subpath) => !NON_COMPONENT_SUBPATHS.has(subpath))
    .map((subpath) => normalizeName(subpath.replace(/^\.\//, "")));
}

// `shipped` is either a per-framework map or a flat list shipped by every
// framework. `stories` is a per-framework list of normalised names.
function shippedByFramework(shipped) {
  if (Array.isArray(shipped)) {
    return Object.fromEntries(FRAMEWORKS.map((framework) => [framework, shipped]));
  }
  return shipped;
}

function lacksFor(record, framework, hasSkill, hasStories) {
  const lacks = [];
  if (!record) {
    lacks.push("record");
  } else {
    if (!record.api?.[framework]) lacks.push("api");
    if (!record.accessibility) lacks.push("accessibility");
    if (!record.guidance) lacks.push("guidance");
  }
  if (!hasSkill) lacks.push("skill");
  if (!hasStories) lacks.push("stories");
  return lacks;
}

export function coverageReport({ shipped, records, skills, stories }) {
  const recordByName = new Map(records.map((record) => [normalizeName(record.name), record]));
  const skillSet = new Set(skills.map(normalizeName));
  const byFramework = shippedByFramework(shipped);
  const missing = [];
  const components = [
    ...new Set(
      FRAMEWORKS.flatMap((framework) => (byFramework[framework] ?? []).map(normalizeName))
    ),
  ].sort();
  for (const component of components) {
    for (const framework of FRAMEWORKS) {
      if (!(byFramework[framework] ?? []).map(normalizeName).includes(component)) continue;
      const hasStories = (stories?.[framework] ?? []).map(normalizeName).includes(component);
      const lacks = lacksFor(
        recordByName.get(component),
        framework,
        skillSet.has(component),
        hasStories
      );
      if (lacks.length > 0) missing.push({ component, framework, lacks });
    }
  }
  return { missing };
}

export function parseArgs(argv) {
  const options = { enforce: false };
  for (const arg of argv) {
    if (arg === "--enforce") options.enforce = true;
    else throw new Error(`unknown option: ${arg}`);
  }
  return options;
}

export function exitCodeFor(report, options) {
  return options.enforce && report.missing.length > 0 ? 1 : 0;
}

const USAGE = "Usage: coverage-report.mjs [--enforce]";

function readRepositoryInputs() {
  const shipped = {};
  const stories = {};
  for (const framework of FRAMEWORKS) {
    const packageRoot = resolve(REPO_ROOT, "packages", framework);
    const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
    shipped[framework] = shippedComponents(packageJson);
    stories[framework] = shipped[framework].filter((component) => {
      const dirs = readdirSync(resolve(packageRoot, "src"), { withFileTypes: true }).filter((d) =>
        d.isDirectory()
      );
      return dirs
        .filter((dir) => normalizeName(dir.name) === component)
        .some((dir) =>
          readdirSync(resolve(packageRoot, "src", dir.name)).some((file) =>
            /\.stories\.[^.]+$/.test(file)
          )
        );
    });
  }
  const skillsDir = resolve(REPO_ROOT, "skills");
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""))
        .filter((name) => name !== "README" && name !== "AGENT_CONVENTIONS")
    : [];
  return { shipped, stories, skills };
}

function printReport(report, shipped) {
  console.log("Metadata coverage report");
  for (const framework of FRAMEWORKS) {
    const entries = report.missing.filter((entry) => entry.framework === framework);
    const counts = {};
    for (const entry of entries) {
      for (const lack of entry.lacks) counts[lack] = (counts[lack] ?? 0) + 1;
    }
    const breakdown = Object.entries(counts)
      .map(([lack, count]) => `${lack} ${count}`)
      .join(", ");
    console.log(
      `  ${framework}: ${shipped[framework].length} shipped, ${entries.length} with gaps` +
        (breakdown ? ` (${breakdown})` : "")
    );
  }
  console.log(`  total: ${report.missing.length} component/framework pair(s) with gaps`);
  if (report.missing.length === 0) return;
  const width = Math.max(...report.missing.map((entry) => entry.component.length), 9);
  console.log(`\n${"component".padEnd(width)}  fw     lacks`);
  for (const entry of report.missing) {
    console.log(
      `${entry.component.padEnd(width)}  ${entry.framework.padEnd(5)}  ${entry.lacks.join(", ")}`
    );
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[coverage] ${error.message}`);
    console.error(USAGE);
    process.exit(2);
  }
  const { ALL_COMPONENTS } = await import("../dist/index.mjs");
  const inputs = readRepositoryInputs();
  const report = coverageReport({ ...inputs, records: ALL_COMPONENTS });
  printReport(report, inputs.shipped);
  const code = exitCodeFor(report, options);
  if (code !== 0) console.error("[coverage] FAILED: --enforce and gaps remain");
  else if (report.missing.length > 0) {
    console.log("\n[coverage] report mode: exiting 0 (use --enforce after C02)");
  }
  process.exit(code);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
