/**
 * GAP-064 G3-E (Spec §6–§8): the explicit upstream → Ultimate data for the Media + Data port
 * (carousel, galleria, image, imagecompare, dataview, orderlist, organizationchart, picklist):
 *   D1 ported groups (approved batch-record mapping), D2 omitted groups (FX-E tags),
 *   D3 B-2 base roles, L PrimeNG-local rules (Angular only, OI-E1), D4 ADR-052 X-4 runtime
 *   roles, D5 retained Ultimate-only rules.
 * The data of each key is transcribed from its approved batch record (Plan PR-4); keys enter
 * PORTED when their batch is ported (Plan Tasks 6, 9, 12, 15).
 * Used by g3e-upstream-fidelity.test.ts and, as a CLI, to print the exact css body of one
 * style module:  node packages/themes/test/utils/g3e-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §12).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3e.json"), "utf8")
);
/** OI-E1: PrimeNG-local CSS appended after the shared style import, per key (raw upstream text). */
export const NG_LOCAL = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeng-local-g3e.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = [
  "carousel",
  "galleria",
  "image",
  "imagecompare",
  "dataview",
  "orderlist",
  "organizationchart",
  "picklist",
];
/** Aura key → Ultimate directory (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  carousel: "carousel",
  galleria: "galleria",
  image: "image",
  imagecompare: "image-compare",
  dataview: "data-view",
  orderlist: "order-list",
  organizationchart: "organization-chart",
  picklist: "pick-list",
};

/** Keys whose batch has been ported (Plan Tasks 6, 9, 12, 15 append). */
export const PORTED = [];

/**
 * Batch-record mapping, applied in order to every selector part of a D1 group, then the
 * generic `.p-` → `.u-` rule. Kinds: "text" (replace one exact part), "class" (replace a
 * token inside a part, followed by a non-name character).
 */
export const MAPPING = { ng: {}, vue: {} };
/** D2 — omitted upstream group numbers (1-based source order) with their FX-E tag. */
export const OMITTED = { ng: {}, vue: {} };
/** Per key: [upstream groups, D1 ported] (literals from the approved batch records). */
export const COUNTS = {};
export const TOTALS = {
  ng: { upstream: 0, ported: 0, omitted: 0 },
  vue: { upstream: 0, ported: 0, omitted: 0 },
};
/** D3 — B-2 base roles, exact text, first in the module. */
export const BASE_ROLE = { ng: {}, vue: {} };
/** Each D3 rule's declarations equal its base group's, except recorded differences. */
export const BASE_SOURCES = [];
/** D4 — ADR-052 X-4 runtime-role CSS, exact text, after D1 and L. */
export const RUNTIME_ROLE = { ng: {}, vue: {} };
/** L — OI-E1 PrimeNG-local rules ported into the Angular module (mapped text), per key. */
export const LOCAL_RULES = { ng: {}, vue: {} };
/** D5 — retained Ultimate-only rules, exact text, last. */
export const RETAINED = { ng: {}, vue: {} };

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const token = (from) => new RegExp(`${escape(from)}(?![a-z0-9-])`, "g");

export function mapSelector(fw, key, selector) {
  let parts = selector.split(",").map((p) => p.trim().replace(/\s+/g, " "));
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "text") parts = parts.map((p) => (p === from ? to : p));
    else parts = parts.map((p) => p.replace(token(from), to));
  }
  return parts.map((p) => p.replace(/\.p-/g, ".u-")).join(", ");
}

/** D1 and D2 for one framework style module, in upstream source order. Keyframes may only be omitted. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else if (g.keyframes) throw new Error(`${key}: keyframes group ${n} must be omitted`);
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §7 canonical order: D3, D1 (upstream order), L (Angular only), D4, D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(LOCAL_RULES[fw][key] ?? []).map(norm),
    ...(RUNTIME_ROLE[fw][key] ?? []).map(norm),
    ...(RETAINED[fw][key] ?? []).map(norm),
  ];
}

export function declarations(ruleText) {
  const open = ruleText.indexOf("{");
  const props = ruleText
    .slice(open + 1, -1)
    .split(";")
    .map((d) => d.split(":")[0].trim())
    .filter(Boolean);
  return { selector: ruleText.slice(0, open), props };
}

export function styleFile(fw, key) {
  return path.join(REPO, "packages", fw, "src", DIRS[key], `${DIRS[key]}-style.ts`);
}

export function actualCssText(fw, key) {
  const src = readFileSync(styleFile(fw, key), "utf8");
  const blocks = [...src.matchAll(/\/\*css\*\/\s*`([\s\S]*?)`/g)];
  if (blocks.length !== 1)
    throw new Error(`${fw}/${key}: expected exactly one /*css*/ block, found ${blocks.length}`);
  if (blocks[0][1].includes("${")) throw new Error(`${fw}/${key}: css must not interpolate`);
  return blocks[0][1];
}

export function actualRules(fw, key) {
  return parseGroups(actualCssText(fw, key)).map((g) => norm(`${g.head}{${g.body}}`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [fw, key] = process.argv.slice(2);
  if (!FRAMEWORKS.includes(fw) || !KEYS.includes(key))
    throw new Error(`usage: g3e-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
