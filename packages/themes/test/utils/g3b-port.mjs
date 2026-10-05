/**
 * GAP-064 G3-B (Spec §5.2–§5.9, §13): the explicit upstream → Ultimate data for
 * the F1 Containers & Panels port, in the six Spec §5.9 categories:
 *   D1 ported component groups (with the §5.2 selector mapping),
 *   D2 omitted component groups (FX-B1..FX-B7),
 *   D3 B-2 base-role rules (PX-B1..PX-B3),
 *   D4 B-3 inline-role rules (PX-B6),
 *   D5 B-4 retained Ultimate-only rules (PX-B9),
 *   D6 base-module exclusions (FX-B8).
 * Used by g3b-upstream-fidelity.test.ts (C3) and, as a CLI, to print the exact
 * css body of one style module:
 *   node packages/themes/test/utils/g3b-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §11 stop condition 6).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3b.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = [
  "accordion",
  "blockui",
  "card",
  "divider",
  "fieldset",
  "inplace",
  "panel",
  "scrollpanel",
  "splitter",
  "toolbar",
];

/** Ultimate component directory per Aura key (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  accordion: "accordion",
  blockui: "block-ui",
  card: "card",
  divider: "divider",
  fieldset: "fieldset",
  inplace: "inplace",
  panel: "panel",
  scrollpanel: "scroll-panel",
  splitter: "splitter",
  toolbar: "toolbar",
};

/** The 4 ADR-051 renames (Spec §5.1): Aura key → old registered key. */
export const OLD_KEYS = { blockui: "block-ui", scrollpanel: "scroll-panel" };

/**
 * Spec §5.2 selector mapping, applied in order to every D1 selector, then the
 * generic `.p-` → `.u-` rule. Entry kinds:
 *   "class"  — replace a whole class token (not followed by [a-z0-9-]);
 *   "prefix" — replace every occurrence, including longer class names;
 *   "text"   — replace an exact selector fragment.
 */
const ACCORDION_NG = [
  ["class", ".p-accordionpanel-active", ".u-accordion-panel-active"],
  ["class", ".p-accordionpanel", ".u-accordion-panel"],
  ["class", ".p-disabled", ".u-accordion-panel-disabled"],
  ["class", ".p-accordionheader-toggle-icon", ".u-accordion-toggle-icon"],
  ["class", ".p-accordionheader", ".u-accordion-header"],
  ["class", ".p-accordioncontent-content", ".u-accordion-content-inner"],
  ["class", ".p-accordioncontent", ".u-accordion-content"],
];
const ACCORDION_VUE = [
  ["class", ".p-accordionpanel-active", '[data-p-active="true"]'],
  ["class", ".p-disabled", '[data-p-disabled="true"]'],
  ["class", ".p-accordionheader-toggle-icon", ".u-accordionheader-toggleicon"],
];
const SHARED = {
  blockui: [
    ["text", ".p-blockui-mask-document.p-overlay-mask", ".u-blockui-mask.u-blockui-mask-document"],
    ["text", ".p-blockui-mask.p-overlay-mask", ".u-blockui-mask"],
    ["class", ".p-blockui", ".u-blockui-container"],
  ],
  inplace: [["class", ".p-disabled", '[data-p-disabled="true"]']],
  panel: [
    ["text", ".p-panel-toggleable .p-panel-header", ".u-panel-header.u-panel-header-toggleable"],
  ],
  scrollpanel: [
    ["class", ".p-scrollpanel-hidden", ".u-scroll-panel-bar-hidden"],
    ["class", ".p-scrollpanel-grabbed", ".u-scroll-panel-bar-grabbed"],
    ["prefix", ".p-scrollpanel", ".u-scroll-panel"],
  ],
};
export const MAPPING = {
  ng: {
    ...SHARED,
    accordion: ACCORDION_NG,
    splitter: [
      ["prefix", ".p-splitterpanel", ".u-splitter-panel"],
      ["class", ".p-splitter-resizing", "[data-resizing]"],
    ],
  },
  vue: {
    ...SHARED,
    accordion: ACCORDION_VUE,
    splitter: [["prefix", ".p-splitterpanel", ".u-splitter-panel"]],
  },
};

/** D2 — Spec §5.3: omitted upstream group numbers (1-based source order) with their FX tag. */
const OMIT_SHARED = {
  accordion: { 15: "FX-B1" },
  divider: {
    8: "FX-B3",
    9: "FX-B3",
    10: "FX-B3",
    11: "FX-B3",
    12: "FX-B3",
    13: "FX-B3",
    14: "FX-B4",
  },
  fieldset: { 11: "FX-B1" },
};
export const OMITTED = {
  ng: {
    ...OMIT_SHARED,
    card: { 2: "FX-B2" },
    panel: { 6: "FX-B1", 8: "FX-B5" },
    splitter: { 13: "FX-B6" },
  },
  vue: {
    ...OMIT_SHARED,
    panel: { 6: "FX-B1" },
    splitter: { 6: "FX-B7", 7: "FX-B7", 13: "FX-B6" },
  },
};

/** Spec §5.3 / §5.9 counts: [upstream groups, D1 ported ng, D1 ported vue]. */
export const COUNTS = {
  accordion: [16, 15, 15],
  blockui: [4, 4, 4],
  card: [5, 4, 5],
  divider: [14, 7, 7],
  fieldset: [12, 11, 11],
  inplace: [4, 4, 4],
  panel: [8, 6, 7],
  scrollpanel: [10, 10, 10],
  splitter: [14, 13, 11],
  toolbar: [2, 2, 2],
};
export const TOTALS = { upstream: 89, ported: 76, omitted: 13 };

const DISABLED_ROLE = (sel) => [
  `${sel}, ${sel} * { cursor: default; pointer-events: none; user-select: none; }`,
  `${sel} { opacity: dt('disabled.opacity'); }`,
];

/** D3 — Spec §5.5 PX-B1..PX-B3: base-role rules, exact text, first in the module. */
export const BASE_ROLE = {
  ng: {
    accordion: DISABLED_ROLE(".u-accordion-panel-disabled"),
    inplace: DISABLED_ROLE('.u-inplace-display[data-p-disabled="true"]'),
  },
  vue: {
    accordion: DISABLED_ROLE('.u-accordionpanel[data-p-disabled="true"]'),
    inplace: DISABLED_ROLE('.u-inplace-display[data-p-disabled="true"]'),
  },
};
const MASK_ROLE =
  ".u-blockui-mask { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }";
BASE_ROLE.ng.blockui = [MASK_ROLE];
BASE_ROLE.vue.blockui = [MASK_ROLE];

/**
 * D3 source evidence: each base-role rule's declarations equal the upstream base
 * group's, except the one recorded difference (PX-B3: no `--px-mask-background` wrapper).
 */
export const BASE_SOURCES = [
  { base: ".p-disabled, .p-disabled *", ruleIndex: 0, keys: ["accordion", "inplace"] },
  { base: ".p-disabled, .p-component:disabled", ruleIndex: 1, keys: ["accordion", "inplace"] },
  {
    base: ".p-overlay-mask",
    ruleIndex: 0,
    keys: ["blockui"],
    differences: {
      background: ["var(--px-mask-background, dt('mask.background'))", "dt('mask.background')"],
    },
  },
];

/** D4 — Spec §5.5 PX-B6: inline-role rules, exact text, after the D1 groups. */
export const INLINE_ROLE = {
  divider: [
    ".u-divider-horizontal { justify-content: center; }",
    ".u-divider-vertical { align-items: center; }",
  ],
};

/** D5 — Spec §5.5 PX-B9: the only retained Ultimate-only rules, exact text, last. */
export const RETAINED = {
  fieldset: [
    ".u-fieldset-toggle-button { font: inherit; color: inherit; }",
    ".u-fieldset-toggle-icon { font-weight: 700; width: 1rem; display: inline-flex; justify-content: center; }",
  ],
  splitter: [".u-splitter-gutter { touch-action: none; }"],
};

/** D6 — Spec §5.7 FX-B8: base-module groups never emitted (not part of the 89). */
export const BASE_EXCLUDED = [
  ".p-overlay-mask-enter-active",
  ".p-overlay-mask-leave-active",
  "@keyframes p-animate-overlay-mask-enter",
  "@keyframes p-animate-overlay-mask-leave",
];

/** Spec §5.6: the only unresolved references (both frameworks). */
export const UNRESOLVED = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function mapSelector(fw, key, selector) {
  let s = selector;
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "class") s = s.replace(new RegExp(`${escape(from)}(?![a-z0-9-])`, "g"), to);
    else s = s.split(from).join(to);
  }
  return s.replace(/\.p-/g, ".u-");
}

/** D1 and D2 for one framework style module, in upstream source order. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (g.keyframes) throw new Error(`${key}: unexpected keyframes in a G3-B module`);
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §5.4 canonical order: D3, then D1 (upstream order), then D4, then D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(INLINE_ROLE[key] ?? []).map(norm),
    ...(RETAINED[key] ?? []).map(norm),
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
    throw new Error(`usage: g3b-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
