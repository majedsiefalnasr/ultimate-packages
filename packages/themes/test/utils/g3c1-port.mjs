/**
 * GAP-064 G3-C1 (Spec §4–§6, §8, §15): the explicit upstream → Ultimate data
 * for the Navigation port (breadcrumb, dock, steps, stepper, tabs), in the
 * Spec §8 categories:
 *   D1 ported component groups (with the §4 selector mapping),
 *   D2 omitted component groups (FX-C1..FX-C6),
 *   D3 C-7 base-role rules (disabled; never for steps, PX-C1),
 *   D5 C-8 retained Ultimate-only rules (R-C1..R-C3).
 * D4 (inline roles) and D6 (base exclusions) are empty in C1.
 * Used by g3c1-upstream-fidelity.test.ts (C3) and, as a CLI, to print the
 * exact css body of one style module:
 *   node packages/themes/test/utils/g3c1-port.mjs <ng|vue> <key>
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
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3c1.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
/** Aura key = Ultimate directory for all five (style file: <key>/<key>-style.ts). */
export const KEYS = ["breadcrumb", "dock", "steps", "stepper", "tabs"];

/**
 * Spec §4 selector mapping, applied in order to every selector of a D1 group,
 * then the generic `.p-` → `.u-` rule. Entry kinds:
 *   "text"   — replace one exact upstream selector (PX-C2 only, Spec §6.5);
 *   "class"  — replace a whole class token (not followed by [a-z0-9-]);
 *   "expand" — turn one selector of a list into one selector per target (C-3).
 * Identical for Angular and Vue.
 */
const SHARED = {
  steps: [
    [
      "text",
      ".p-steps-item-link:not(.p-disabled):focus-visible",
      ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    ],
    ["class", ".p-disabled", ".u-steps-item-disabled"],
  ],
  stepper: [
    ["class", ".p-steppanel-content-wrapper", ".u-step-panel-content-wrapper"],
    ["class", ".p-steppanel-content", ".u-step-panel-content"],
    ["class", ".p-steppanels", ".u-step-panels"],
    ["class", ".p-steppanel", ".u-step-panel"],
    ["class", ".p-stepitem-active", ".u-step-item-active"],
    ["class", ".p-stepitem", ".u-step-item"],
    ["class", ".p-steplist", ".u-step-list"],
    ["class", ".p-disabled", ".u-step-disabled"],
  ],
  tabs: [
    ["class", ".p-tablist-viewport", ".u-tablist-content"],
    ["expand", ".p-tablist-nav-button", [".u-tablist-prev-button", ".u-tablist-next-button"]],
    ["class", ".p-disabled", ".u-tab-disabled"],
  ],
};
export const MAPPING = { ng: SHARED, vue: SHARED };

/** D2 — Spec §5: omitted upstream group numbers (1-based source order) with their FX tag. */
const OMIT_SHARED = {
  breadcrumb: { 4: "FX-C1" },
  dock: { 5: "FX-C2", 13: "FX-C3", 14: "FX-C3", 15: "FX-C3", 16: "FX-C3", 17: "FX-C3" },
  steps: { 13: "FX-C4" },
};
export const OMITTED = {
  ng: { ...OMIT_SHARED, stepper: { 6: "FX-C5", 23: "FX-C6", 24: "FX-C6" } },
  vue: { ...OMIT_SHARED, stepper: { 6: "FX-C5" } },
};

/** Spec §5 counts: [upstream groups, D1 ported ng, D1 ported vue]. */
export const COUNTS = {
  breadcrumb: [11, 10, 10],
  dock: [17, 11, 11],
  steps: [15, 14, 14],
  stepper: [28, 25, 27],
  tabs: [19, 19, 19],
};
export const TOTALS = {
  ng: { upstream: 90, ported: 79, omitted: 11 },
  vue: { upstream: 90, ported: 81, omitted: 9 },
};

const DISABLED_ROLE = (sel) => [
  `${sel}, ${sel} * { cursor: default; pointer-events: none; user-select: none; }`,
  `${sel} { opacity: dt('disabled.opacity'); }`,
];

/** D3 — Spec §6.1: base-role rules, exact text, first in the module. Never steps (PX-C1). */
const BASE_SHARED = {
  breadcrumb: DISABLED_ROLE(".u-breadcrumb-item-disabled"),
  dock: DISABLED_ROLE(".u-dock-item-disabled"),
  stepper: DISABLED_ROLE(".u-step-disabled"),
  tabs: DISABLED_ROLE(".u-tab-disabled"),
};
export const BASE_ROLE = { ng: BASE_SHARED, vue: BASE_SHARED };

/** D3 source evidence: each base-role rule's declarations equal the upstream base group's (no difference). */
export const BASE_SOURCES = [
  {
    base: ".p-disabled, .p-disabled *",
    ruleIndex: 0,
    keys: ["breadcrumb", "dock", "stepper", "tabs"],
  },
  {
    base: ".p-disabled, .p-component:disabled",
    ruleIndex: 1,
    keys: ["breadcrumb", "dock", "stepper", "tabs"],
  },
];

/** D5 — Spec §6.3: the only retained Ultimate-only rules, exact text, last. */
const DOCK_RETAINED = [
  ".u-dock-item-link { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: bottom center; }",
  '.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"] { transform: scale(1.5); }',
];
export const RETAINED = {
  ng: { dock: DOCK_RETAINED, stepper: [".u-step-panel[hidden] { display: none; }"] },
  vue: { dock: DOCK_RETAINED },
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const token = (from) => new RegExp(`${escape(from)}(?![a-z0-9-])`, "g");

export function mapSelector(fw, key, selector) {
  let parts = selector.split(",").map((p) => p.trim());
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "text") parts = parts.map((p) => (p === from ? to : p));
    else if (kind === "class") parts = parts.map((p) => p.replace(token(from), to));
    else
      parts = parts.flatMap((p) =>
        token(from).test(p) ? to.map((t) => p.replace(token(from), t)) : [p]
      );
  }
  return parts.map((p) => p.replace(/\.p-/g, ".u-")).join(", ");
}

/** D1 and D2 for one framework style module, in upstream source order. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (g.keyframes) throw new Error(`${key}: unexpected keyframes in a G3-C1 module`);
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §8 canonical order: D3, then D1 (upstream order), then D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(RETAINED[fw][key] ?? []).map(norm),
  ];
}

/** Property names declared by a normalized rule text. */
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
  return path.join(REPO, "packages", fw, "src", key, `${key}-style.ts`);
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
    throw new Error(`usage: g3c1-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
