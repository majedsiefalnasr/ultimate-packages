/**
 * GAP-064 G3-D (Spec §4–§8): the explicit upstream → Ultimate data for the
 * Overlays + Composites port (confirmdialog, confirmpopup, drawer, popover,
 * splitbutton, speeddial):
 *   D1 ported groups (Spec §4 mapping), D2 omitted groups (FX-D1..FX-D8),
 *   D3 B-2 base roles, D4 ADR-052 X-4 runtime roles, D5 Ultimate-only rules (Plan Task 8 gate).
 * Used by g3d-upstream-fidelity.test.ts and, as a CLI, to print the exact
 * css body of one style module:  node packages/themes/test/utils/g3d-port.mjs <ng|vue> <key>
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
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3d.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = [
  "confirmdialog",
  "confirmpopup",
  "drawer",
  "popover",
  "splitbutton",
  "speeddial",
];
/** Aura key → Ultimate directory (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  confirmdialog: "confirm-dialog",
  confirmpopup: "confirm-popup",
  drawer: "drawer",
  popover: "popover",
  splitbutton: "split-button",
  speeddial: "speed-dial",
};

/**
 * Spec §4 mapping, applied in order to every selector part of a D1 group, then
 * the generic `.p-` → `.u-` rule. Kinds: "text" (replace one exact part),
 * "class" (replace a token inside a part, followed by a non-name character).
 */
const POS = ["left", "right", "top", "bottom"];
const DRAWER = [
  ["text", ".p-drawer-full .p-drawer", ".u-drawer.u-drawer-position-full"],
  ...POS.map((p) => ["text", `.p-drawer-${p} .p-drawer`, `.u-drawer.u-drawer-position-${p}`]),
  ...POS.map((p) => [
    "text",
    `.p-drawer-${p} .p-drawer-content`,
    `.u-drawer.u-drawer-position-${p} .u-drawer-content`,
  ]),
];
const OPEN = ".u-speeddial:has(> .u-speeddial-button.u-speeddial-open)";
const SHARED = {
  confirmdialog: [
    [
      "text",
      ".p-confirmdialog .p-dialog-content",
      ".u-dialog-content:has(> .u-confirmdialog-message)",
    ],
  ],
  drawer: DRAWER,
  speeddial: [
    ["text", ".p-speeddial-open .p-speeddial-list", `${OPEN} .u-speeddial-list`],
    ["text", ".p-speeddial-open .p-speeddial-item", `${OPEN} .u-speeddial-item`],
  ],
};
const SPLIT = (button, dropdown) => [
  ["class", ".p-splitbutton-button.p-button", button],
  ["class", ".p-splitbutton-dropdown.p-button", dropdown],
];
export const MAPPING = {
  ng: {
    ...SHARED,
    splitbutton: SPLIT(".u-splitbutton-button > .u-button", ".u-splitbutton-dropdown > .u-button"),
  },
  vue: {
    ...SHARED,
    splitbutton: SPLIT(".u-splitbutton-button.u-button", ".u-splitbutton-dropdown.u-button"),
  },
};

const range = (a, b, tag) =>
  Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, tag]));
/** D2 — Spec §5: omitted upstream group numbers (1-based source order) with their FX tag. Identical in both frameworks. */
const OMIT = {
  confirmdialog: {},
  confirmpopup: { 7: "FX-D2", ...range(8, 13, "FX-D1") },
  drawer: { ...range(7, 16, "FX-D3"), 22: "FX-D4", ...range(24, 33, "FX-D3") },
  popover: { 3: "FX-D2", ...range(4, 9, "FX-D1") },
  splitbutton: { 6: "FX-D5", ...range(7, 10, "FX-D6") },
  speeddial: { 3: "FX-D7", 6: "FX-D8", 10: "FX-D7" },
};
export const OMITTED = { ng: OMIT, vue: OMIT };

/** Spec §5.7 counts: [upstream groups, D1 ported] (identical in both frameworks). */
export const COUNTS = {
  confirmdialog: [2, 2],
  confirmpopup: [13, 6],
  drawer: [33, 12],
  popover: [9, 2],
  splitbutton: [10, 5],
  speeddial: [10, 7],
};
export const TOTALS = {
  ng: { upstream: 77, ported: 34, omitted: 43 },
  vue: { upstream: 77, ported: 34, omitted: 43 },
};

/** D3 — Spec §6.1: B-2 base roles, exact text, first in the module (SpeedDial only). */
const SPEEDDIAL_BASE = [
  ".u-speeddial-mask { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }",
  ".u-speeddial-button:disabled, .u-speeddial-button:disabled *, .u-speeddial-action:disabled, .u-speeddial-action:disabled * { cursor: default; pointer-events: none; user-select: none; }",
  ".u-speeddial-button:disabled, .u-speeddial-action:disabled { opacity: dt('disabled.opacity'); }",
];
export const BASE_ROLE = {
  ng: { speeddial: SPEEDDIAL_BASE },
  vue: { speeddial: SPEEDDIAL_BASE },
};
/** Each D3 rule's declarations equal its base group's, except the recorded PX-B3 difference (no --px-mask-background wrapper). */
export const BASE_SOURCES = [
  {
    base: ".p-overlay-mask",
    ruleIndex: 0,
    keys: ["speeddial"],
    differs: {
      background: ["var(--px-mask-background, dt('mask.background'))", "dt('mask.background')"],
    },
  },
  { base: ".p-disabled, .p-disabled *", ruleIndex: 1, keys: ["speeddial"], differs: {} },
  { base: ".p-disabled, .p-component:disabled", ruleIndex: 2, keys: ["speeddial"], differs: {} },
];

/** D4 — Spec §6.2: runtime-role CSS, exact text, after D1 (R-1, R-2, R-3, R-4). */
const RUNTIME = (wrapper) => ({
  popover: [".u-popover { position: absolute; }"],
  drawer: [
    ".u-drawer-mask { position: fixed; inset: 0; display: flex; }",
    ".u-drawer-position-right { margin-left: auto; }",
    ".u-drawer-position-bottom { margin-top: auto; }",
    ...wrapper,
  ],
  speeddial: [
    ".u-speeddial-direction-up { flex-direction: column-reverse; align-items: center; }",
    ".u-speeddial-direction-down { flex-direction: column; align-items: center; }",
    ".u-speeddial-direction-left { flex-direction: row-reverse; justify-content: center; }",
    ".u-speeddial-direction-right { flex-direction: row; justify-content: center; }",
  ],
});
export const RUNTIME_ROLE = {
  ng: RUNTIME([
    ".u-drawer > [ufocustrap] { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }",
  ]),
  vue: RUNTIME([]),
};

/** D5 — Spec §6.4, exact text. R-D1 is retained (D-D3c fallback); R-D2..R-D5 are gate G-D1 candidates. */
const CANDIDATE_RULES = {
  "R-D1": [
    ".u-speeddial-action { display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; width: 2.5rem; height: 2.5rem; }",
  ],
  "R-D2": [".u-speeddial-item-hidden { visibility: hidden; }"],
  "R-D3": [".u-confirmdialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }"],
  "R-D4": [
    ".u-confirmdialog-icon { flex-shrink: 0; }",
    ".u-confirmdialog-message { flex-grow: 1; }",
  ],
  "R-D5": [".u-popover-content { position: relative; }"],
};
export const CANDIDATES = { ng: CANDIDATE_RULES, vue: CANDIDATE_RULES };
const CANDIDATE_KEY = {
  "R-D1": "speeddial",
  "R-D2": "speeddial",
  "R-D3": "confirmdialog",
  "R-D4": "confirmdialog",
  "R-D5": "popover",
};
/** Gate outcome (Plan Task 8; Spec §8 G-D1, §17): R-D5 dropped (no difference in any engine); R-D4 pending user ruling. */
export const KEPT = ["R-D1", "R-D2", "R-D3", "R-D4"];
const retained = () => {
  const out = {};
  for (const id of KEPT) (out[CANDIDATE_KEY[id]] ??= []).push(...CANDIDATE_RULES[id]);
  return out;
};
export const RETAINED = { ng: retained(), vue: retained() };

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
    throw new Error(`usage: g3d-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
