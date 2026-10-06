/**
 * GAP-064 G3-C2 (Spec §4–§8, §16): the explicit upstream → Ultimate data for
 * the Menus port (tieredmenu, contextmenu, menubar, megamenu, panelmenu):
 *   D1 ported component groups (Spec §4 mapping), D2 omitted groups (FX-M1..FX-M7),
 *   D3 C-7 disabled base role, D4 ADR-052 X-4 runtime-role CSS,
 *   D5 C-8 Ultimate-only candidates kept by the Spec §8 gates (Plan Task 7).
 * Used by g3c2-upstream-fidelity.test.ts and, as a CLI, to print the exact
 * css body of one style module:  node packages/themes/test/utils/g3c2-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §14).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3c2.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = ["tieredmenu", "contextmenu", "menubar", "megamenu", "panelmenu"];
/** Aura key → Ultimate directory (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  tieredmenu: "tiered-menu",
  contextmenu: "context-menu",
  menubar: "menubar",
  megamenu: "mega-menu",
  panelmenu: "panel-menu",
};

const TOP = ".u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item)";
const NEST = ".u-panelmenu-item .u-panelmenu-item";
const FOCUS = ".u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible)";

/**
 * Spec §4 mapping, applied in order to every selector part of a D1 group, then
 * the generic `.p-` → `.u-` rule. Kinds: "text" (replace one exact part),
 * "class" (replace a whole class token), "drop" (remove one exact part, C-2).
 */
const PANEL_TEXT = (childList) => [
  ["text", ".p-panelmenu-panel", TOP],
  ["text", ".p-panelmenu-panel:first-child", `${TOP}:first-child`],
  ["text", ".p-panelmenu-panel:last-child", `${TOP}:last-child`],
  ["text", ".p-panelmenu-header", `${TOP} > .u-panelmenu-header-content`],
  ["text", ".p-panelmenu-header-content", `${TOP} > .u-panelmenu-header-content`],
  [
    "text",
    ".p-panelmenu-header-link",
    `${TOP} > .u-panelmenu-header-content > .u-panelmenu-header-link`,
  ],
  [
    "text",
    ".p-panelmenu-header-icon",
    `${TOP} > .u-panelmenu-header-content .u-panelmenu-header-icon`,
  ],
  [
    "text",
    ".p-panelmenu-item-icon",
    `${NEST} > .u-panelmenu-header-content .u-panelmenu-header-icon`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled):focus-visible .p-panelmenu-header-content",
    `${TOP}:not(.u-panelmenu-item-disabled) > ${FOCUS}`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled):focus-visible .p-panelmenu-header-content .p-panelmenu-header-icon",
    `${TOP}:not(.u-panelmenu-item-disabled) > ${FOCUS} .u-panelmenu-header-icon`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled):focus-visible .p-panelmenu-header-content .p-panelmenu-submenu-icon",
    `${TOP}:not(.u-panelmenu-item-disabled) > ${FOCUS} .u-panelmenu-submenu-icon`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled) .p-panelmenu-header-content:hover",
    `${TOP}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled) .p-panelmenu-header-content:hover .p-panelmenu-header-icon",
    `${TOP}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-header-icon`,
  ],
  [
    "text",
    ".p-panelmenu-header:not(.p-disabled) .p-panelmenu-header-content:hover .p-panelmenu-submenu-icon",
    `${TOP}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-submenu-icon`,
  ],
  ["text", ".p-panelmenu-submenu", ".u-panelmenu-item .u-panelmenu-submenu"],
  ["text", ".p-panelmenu-submenu:dir(rtl)", ".u-panelmenu-item .u-panelmenu-submenu:dir(rtl)"],
  [
    "text",
    ".p-panelmenu-item-link",
    `${NEST} > .u-panelmenu-header-content > .u-panelmenu-header-link`,
  ],
  [
    "text",
    ".p-panelmenu-item-label",
    `${NEST} > .u-panelmenu-header-content .u-panelmenu-header-label`,
  ],
  ["text", ".p-panelmenu-item-content", `${NEST} > .u-panelmenu-header-content`],
  [
    "text",
    ".p-panelmenu-item:not(.p-disabled) > .p-panelmenu-item-content:hover",
    `${NEST}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover`,
  ],
  [
    "text",
    ".p-panelmenu-item:not(.p-disabled) > .p-panelmenu-item-content:hover .p-panelmenu-item-icon",
    `${NEST}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-header-icon`,
  ],
  [
    "text",
    ".p-panelmenu-item:not(.p-disabled) > .p-panelmenu-item-content:hover .p-panelmenu-submenu-icon",
    `${NEST}:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-submenu-icon`,
  ],
  ["text", ".p-panelmenu-content-container", childList],
  ["text", ".p-panelmenu-content-wrapper", childList],
];
const STATES = (key) => [
  ["class", `.p-${key}-item-active`, `.u-${key}-item-open`],
  ["class", ".p-disabled", `.u-${key}-item-disabled`],
];
const SHARED = {
  tieredmenu: STATES("tieredmenu"),
  contextmenu: [
    ["drop", ".p-contextmenu-submenu"],
    ["class", ".p-focus", ".u-contextmenu-item-focused"],
    ...STATES("contextmenu"),
  ],
  megamenu: [["class", ".p-megamenu-horizontal", ".u-megamenu"], ...STATES("megamenu")],
};
export const MAPPING = {
  ng: {
    ...SHARED,
    menubar: [
      [
        "text",
        ".p-menubar-submenu > .p-menubar-item-active > .p-menubar-submenu",
        ".u-menubar-submenu > .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu",
      ],
      ...STATES("menubar"),
    ],
    panelmenu: PANEL_TEXT(`${TOP} > u-panel-menu-list > .u-panelmenu-submenu`),
  },
  vue: {
    ...SHARED,
    menubar: STATES("menubar"),
    panelmenu: PANEL_TEXT(`${TOP} > .u-panelmenu-submenu`),
  },
};

const range = (a, b, tag) =>
  Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, tag]));
/** D2 — Spec §5: omitted upstream group numbers (1-based source order) with their FX tag. Identical in both frameworks. */
const OMIT = {
  tieredmenu: { ...range(11, 13, "FX-M2"), ...range(22, 25, "FX-M1") },
  contextmenu: {
    3: "FX-M3",
    9: "FX-M3",
    10: "FX-M3",
    13: "FX-M3",
    16: "FX-M3",
    ...range(17, 19, "FX-M3"),
    ...range(21, 23, "FX-M1"),
  },
  menubar: {
    2: "FX-M4",
    ...range(13, 15, "FX-M2"),
    ...range(26, 30, "FX-M4"),
    ...range(31, 44, "FX-M1"),
  },
  megamenu: {
    2: "FX-M4",
    28: "FX-M4",
    29: "FX-M4",
    ...range(43, 45, "FX-M4"),
    ...range(11, 13, "FX-M2"),
    25: "FX-M7",
    ...range(30, 35, "FX-M5"),
    ...range(37, 42, "FX-M6"),
    ...range(46, 56, "FX-M1"),
  },
  panelmenu: range(22, 24, "FX-M2"),
};
export const OMITTED = { ng: OMIT, vue: OMIT };

/** Spec §5.6 counts: [upstream groups, D1 ported] (identical in both frameworks). */
export const COUNTS = {
  tieredmenu: [25, 18],
  contextmenu: [23, 12],
  menubar: [44, 21],
  megamenu: [56, 23],
  panelmenu: [29, 26],
};
export const TOTALS = {
  ng: { upstream: 177, ported: 100, omitted: 77 },
  vue: { upstream: 177, ported: 100, omitted: 77 },
};

const DISABLED_ROLE = (sel) => [
  `${sel}, ${sel} * { cursor: default; pointer-events: none; user-select: none; }`,
  `${sel} { opacity: dt('disabled.opacity'); }`,
];
/** D3 — Spec §6.1: base-role rules, exact text, first in the module. */
const BASE = Object.fromEntries(KEYS.map((k) => [k, DISABLED_ROLE(`.u-${k}-item-disabled`)]));
export const BASE_ROLE = { ng: BASE, vue: BASE };
export const BASE_SOURCES = [
  { base: ".p-disabled, .p-disabled *", ruleIndex: 0, keys: KEYS },
  { base: ".p-disabled, .p-component:disabled", ruleIndex: 1, keys: KEYS },
];

/**
 * D4 — Spec §6.2: runtime-role CSS, exact text, after D1 (role 1, then 2, 3, 4).
 * Role 1b (PanelMenu collapsed-list visibility) is excluded under ADR-052 X-1
 * (Spec §18 A1): the nested list is only rendered while its item is expanded.
 */
const RUNTIME = (h) => ({
  tieredmenu: [
    `.u-tieredmenu-item:not(.u-tieredmenu-item-open) > ${h.tm}.u-tieredmenu-submenu { display: none; }`,
    ".u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px; }",
    ".u-tieredmenu-submenu { inset-inline-start: 100%; top: 0; }",
  ],
  contextmenu: [".u-contextmenu { position: absolute; }"],
  menubar: [
    `.u-menubar .u-menubar-item-open > ${h.mb}.u-menubar-submenu { display: flex; flex-direction: column; }`,
  ],
});
export const RUNTIME_ROLE = {
  ng: RUNTIME({ tm: "u-tiered-menu-sub > ", mb: "u-menubar-sub > " }),
  vue: RUNTIME({ tm: "", mb: "" }),
};

/** D5 candidates — Spec §6.3 (R-M1..R-M4), exact text. RETAINED is the gate-approved subset (Plan Task 7). */
export const CANDIDATES = {
  "R-M1": [".u-megamenu-column { display: flex; flex-direction: column; }"],
  "R-M2": [".u-menubar-submenu { top: 100%; left: 0; }"],
  "R-M3": [".u-tieredmenu { display: inline-block; }"],
  "R-M4": [
    ".u-panelmenu-submenu-icon { transition: transform 0.2s; }",
    ".u-panelmenu-item-expanded > .u-panelmenu-header-content .u-panelmenu-submenu-icon { transform: rotate(90deg); }",
  ],
};
const CANDIDATE_KEY = {
  "R-M1": "megamenu",
  "R-M2": "menubar",
  "R-M3": "tieredmenu",
  "R-M4": "panelmenu",
};
/** Gate outcome (Plan Task 7). Until then every candidate ships provisionally. */
export const KEPT = ["R-M1", "R-M2", "R-M3", "R-M4"];
const RET = {};
for (const id of KEPT) (RET[CANDIDATE_KEY[id]] ??= []).push(...CANDIDATES[id]);
export const RETAINED = { ng: RET, vue: RET };

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const token = (from) => new RegExp(`${escape(from)}(?![a-z0-9-])`, "g");

export function mapSelector(fw, key, selector) {
  let parts = selector.split(",").map((p) => p.trim().replace(/\s+/g, " "));
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "text") parts = parts.map((p) => (p === from ? to : p));
    else if (kind === "drop") parts = parts.filter((p) => p !== from);
    else parts = parts.map((p) => p.replace(token(from), to));
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
    if (g.keyframes) throw new Error(`${key}: unexpected keyframes in a G3-C2 module`);
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §8 canonical order: D3, D1 (upstream order), D4, D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
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
    throw new Error(`usage: g3c2-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
