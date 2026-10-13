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
export const PORTED = [
  "image",
  "imagecompare",
  "carousel",
  "galleria",
  "orderlist",
  "picklist",
  "dataview",
  "organizationchart",
];

/**
 * Batch-record mapping, applied in order to every selector part of a D1 group, then the
 * generic `.p-` → `.u-` rule. Kinds: "text" (replace one exact part), "class" (replace a
 * token inside a part, followed by a non-name character).
 */
const IMAGE_MAPPING = [
  [
    "text",
    ".p-image-preview:hover > .p-image-preview-mask",
    ".u-image:has(> .u-image-preview-mask):hover > .u-image-preview-mask",
  ],
  ["text", ".p-image-action .p-icon", ".u-image-toolbar > button svg"],
  ["text", ".p-image-action.p-disabled", ".u-image-toolbar > button:disabled"],
  ["class", ".p-image-preview", ".u-image:has(> .u-image-preview-mask)"],
  ["class", ".p-image-action", ".u-image-toolbar > button"],
];
const IMAGECOMPARE_MAPPING = [
  ["text", ".p-imagecompare img + img", ".u-image-compare > span"],
  ["text", ".p-imagecompare:dir(rtl) img + img", ".u-image-compare:dir(rtl) > span"],
  ["class", ".p-imagecompare-slider", ".u-image-compare-slider"],
  ["class", ".p-imagecompare", ".u-image-compare"],
];
const CAROUSEL_MAPPING = [
  ["class", ".p-carousel-content-container", ".u-carousel-content"],
  ["class", ".p-carousel-content", ".u-carousel-content-inner"],
];
const NAV = [".u-galleria-prev-button", ".u-galleria-next-button"];
const GALLERIA_MAPPING = [
  ["text", ".p-galleria-nav-button", NAV.join(", ")],
  [
    "text",
    ".p-galleria-nav-button:not(.p-disabled):hover",
    NAV.map((b) => `${b}:not(:disabled):hover`).join(", "),
  ],
  [
    "text",
    ".p-galleria-nav-button:not(.p-disabled):focus-visible",
    NAV.map((b) => `${b}:not(:disabled):focus-visible`).join(", "),
  ],
  [
    "text",
    ".p-galleria-mask .p-galleria-nav-button",
    NAV.map((b) => `.u-galleria-mask ${b}`).join(", "),
  ],
  ["class", ".p-galleria-content", ".u-galleria"],
  ["class", ".p-galleria-items-container", ".u-galleria-item-wrapper"],
  ["class", ".p-galleria-items", ".u-galleria-item-container"],
  ["class", ".p-galleria-item", ".u-galleria-item-container"],
  ["class", ".p-galleria-thumbnails-content", ".u-galleria-thumbnail-list"],
  ["class", ".p-galleria-thumbnail-items", ".u-galleria-thumbnail-list"],
  ["class", ".p-galleria-thumbnail-item-current", ".u-galleria-thumbnail-item-active"],
  ["class", ".p-galleria-thumbnail", ".u-galleria-thumbnail-item"],
  ["class", ".p-galleria-close-icon", ".u-galleria-close-button svg"],
];
const ORDERLIST_MAPPING_NG = [
  ["text", ".p-orderlist .p-listbox", '.u-order-list > [data-pc-section="listcontainer"]'],
  ["class", ".p-orderlist-controls", ".u-order-list-controls"],
  ["class", ".p-orderlist", ".u-order-list"],
];
const ORDERLIST_MAPPING_VUE = [
  ["text", ".p-orderlist .p-listbox", ".u-order-list-list"],
  ["text", ".p-orderlist", ".u-order-list > section"],
  ["class", ".p-orderlist-controls", ".u-order-list-controls"],
];
const PICKLIST_MAPPING = [
  ["text", ".p-picklist .p-listbox", ".u-pick-list .u-listbox"],
  ["text", ".p-picklist-list-container", ".u-pick-list-source, .u-pick-list-target"],
  ["class", ".p-picklist-controls", ".u-pick-list-controls"],
  ["class", ".p-picklist", ".u-pick-list"],
];
const DATAVIEW_MAPPING = [
  ["text", ".p-dataview-content", ".u-data-view-list, .u-data-view-grid"],
  [
    "text",
    ".p-dataview-paginator-top",
    ".u-data-view > .u-paginator:not(.u-data-view-list ~ .u-paginator):not(.u-data-view-grid ~ .u-paginator)",
  ],
  [
    "text",
    ".p-dataview-paginator-bottom",
    ".u-data-view-list ~ .u-paginator, .u-data-view-grid ~ .u-paginator",
  ],
  ["text", ".p-dataview-loading-overlay", '.u-data-view > [role="status"]'],
  ["class", ".p-dataview", ".u-data-view"],
];
const OC_NODE = ".u-organization-chart-node-content";
const OC_TOGGLE = `${OC_NODE} > button`;
const ORGANIZATIONCHART_MAPPING = [
  ["text", ".p-organizationchart-node", OC_NODE],
  [
    "text",
    ".p-organizationchart-node:has(.p-organizationchart-node-toggle-button)",
    `${OC_NODE}:has(> button)`,
  ],
  [
    "text",
    ".p-organizationchart-node.p-organizationchart-node-selectable:not(.p-organizationchart-node-selected):hover",
    `.u-organization-chart-node[aria-selected="false"] > ${OC_NODE}:hover`,
  ],
  [
    "text",
    ".p-organizationchart-node-selected",
    `.u-organization-chart-node[aria-selected="true"] > ${OC_NODE}`,
  ],
  ["text", ".p-organizationchart-node-toggle-button", OC_TOGGLE],
  ["text", ".p-organizationchart-node-toggle-button:hover", `${OC_TOGGLE}:hover`],
  ["text", ".p-organizationchart-node-toggle-button:focus-visible", `${OC_TOGGLE}:focus-visible`],
  ["text", ".p-organizationchart-node-toggle-button-icon", `${OC_TOGGLE} > span`],
  [
    "text",
    ".p-organizationchart-node-selectable",
    `.u-organization-chart-node[aria-selected] > ${OC_NODE}`,
  ],
];
export const MAPPING = {
  ng: {
    image: IMAGE_MAPPING,
    imagecompare: IMAGECOMPARE_MAPPING,
    carousel: CAROUSEL_MAPPING,
    galleria: GALLERIA_MAPPING,
    orderlist: ORDERLIST_MAPPING_NG,
    picklist: PICKLIST_MAPPING,
    dataview: DATAVIEW_MAPPING,
  },
  vue: {
    image: IMAGE_MAPPING,
    imagecompare: IMAGECOMPARE_MAPPING,
    carousel: CAROUSEL_MAPPING,
    galleria: GALLERIA_MAPPING,
    orderlist: ORDERLIST_MAPPING_VUE,
    picklist: PICKLIST_MAPPING,
    dataview: DATAVIEW_MAPPING,
    organizationchart: ORGANIZATIONCHART_MAPPING,
  },
};
/** D2 — omitted upstream group numbers (1-based source order) with their FX-E tag. */
const IMAGE_OMITTED = { 13: "FX-E1", 14: "FX-E1", 15: "FX-E2", 16: "FX-E2" };
const CAROUSEL_OMITTED = { 16: "FX-E3", 17: "FX-E3" };
const tag = (from, to, t) =>
  Object.fromEntries(Array.from({ length: to - from + 1 }, (_, i) => [from + i, t]));
const GALLERIA_OMITTED = {
  8: "FX-E4",
  ...tag(14, 17, "FX-E5"),
  ...tag(18, 22, "FX-E6"),
  24: "FX-E6",
  25: "FX-E6",
  27: "FX-E6",
  ...tag(32, 54, "FX-E5"),
  61: "FX-E6",
  62: "FX-E6",
  ...tag(63, 67, "FX-E7"),
};
const DATAVIEW_OMITTED = { 2: "FX-E8", 4: "FX-E8" };
const ORGANIZATIONCHART_OMITTED = {
  1: "FX-E9",
  2: "FX-E9",
  ...tag(11, 14, "FX-E10"),
  ...tag(16, 18, "FX-E10"),
};
export const OMITTED = {
  ng: {
    image: IMAGE_OMITTED,
    imagecompare: {},
    carousel: CAROUSEL_OMITTED,
    galleria: GALLERIA_OMITTED,
    orderlist: {},
    picklist: {},
    dataview: DATAVIEW_OMITTED,
  },
  vue: {
    image: IMAGE_OMITTED,
    imagecompare: {},
    carousel: CAROUSEL_OMITTED,
    galleria: GALLERIA_OMITTED,
    orderlist: {},
    picklist: {},
    dataview: DATAVIEW_OMITTED,
    organizationchart: ORGANIZATIONCHART_OMITTED,
  },
};
/** Per key: [upstream groups, D1 ported] (literals from the approved batch records). */
export const COUNTS = {
  image: [16, 12],
  imagecompare: [12, 12],
  carousel: [17, 15],
  galleria: [67, 24],
  orderlist: [3, 3],
  picklist: [4, 4],
  dataview: [7, 5],
  organizationchart: [18, 9],
};
export const TOTALS = {
  ng: { upstream: 126, ported: 75, omitted: 51 },
  vue: { upstream: 144, ported: 84, omitted: 60 },
};
/** D3 — B-2 base roles, exact text, first in the module. */
const IMAGE_BASE = [
  ".u-image-mask { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }",
  ".u-image-toolbar > button:disabled { opacity: dt('disabled.opacity'); }",
];
const DATAVIEW_BASE = [
  ".u-data-view > [role=\"status\"] { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }",
];
const GALLERIA_BASE = [
  ".u-galleria-mask { background: dt('mask.background'); color: dt('mask.color'); }",
  ".u-galleria-prev-button:disabled, .u-galleria-next-button:disabled { opacity: dt('disabled.opacity'); }",
];
export const BASE_ROLE = {
  ng: {
    image: IMAGE_BASE,
    imagecompare: [],
    carousel: [],
    galleria: GALLERIA_BASE,
    orderlist: [],
    picklist: [],
    dataview: DATAVIEW_BASE,
  },
  vue: {
    image: IMAGE_BASE,
    imagecompare: [],
    carousel: [],
    galleria: GALLERIA_BASE,
    orderlist: [],
    picklist: [],
    dataview: DATAVIEW_BASE,
    organizationchart: [],
  },
};
/** Each D3 rule's declarations equal its base group's, except recorded differences. */
export const BASE_SOURCES = [
  {
    keys: ["image"],
    ruleIndex: 0,
    source: ".p-overlay-mask",
    differences: "background uses dt('mask.background') without --px wrapper (PX-B3)",
  },
  {
    keys: ["image"],
    ruleIndex: 1,
    source: ".p-disabled, .p-component:disabled",
    differences: "native disabled toolbar button selector",
  },
  {
    keys: ["galleria"],
    ruleIndex: 0,
    source: ".p-overlay-mask",
    differences:
      "background and colour only; position, inset and size come from ported group 55 (E-2 record §5)",
  },
  {
    keys: ["galleria"],
    ruleIndex: 1,
    source: ".p-disabled, .p-component:disabled",
    differences: "native disabled navigator button selector",
  },
  {
    keys: ["dataview"],
    ruleIndex: 0,
    source: ".p-overlay-mask",
    differences:
      "loading overlay (E-4 record §5): the E-1 .u-image-mask text with the DataView status selector; group 7 sets position: absolute",
  },
];
/** D4 — ADR-052 X-4 runtime-role CSS, exact text, after D1 and L. */
const CAROUSEL_RUNTIME = [".u-carousel-item-list { transition: transform 500ms ease 0s; }"];
const GALLERIA_RUNTIME = [".u-galleria-mask { z-index: 1100; }"];
export const RUNTIME_ROLE = {
  ng: {
    image: [".u-image-mask { z-index: 1100; }"],
    imagecompare: [],
    carousel: CAROUSEL_RUNTIME,
    galleria: GALLERIA_RUNTIME,
    orderlist: [],
    picklist: [],
    dataview: [],
  },
  vue: {
    image: [".u-image-mask { z-index: 1100; }"],
    imagecompare: [],
    carousel: CAROUSEL_RUNTIME,
    galleria: GALLERIA_RUNTIME,
    orderlist: [],
    picklist: [],
    dataview: [],
    organizationchart: [],
  },
};
/** L — OI-E1 PrimeNG-local rules ported into the Angular module (mapped text), per key. */
export const LOCAL_RULES = {
  ng: {
    image: [],
    imagecompare: [],
    carousel: [],
    galleria: [],
    orderlist: [],
    picklist: [],
    dataview: [],
  },
  vue: {
    image: [],
    imagecompare: [],
    carousel: [],
    galleria: [],
    orderlist: [],
    picklist: [],
    dataview: [],
    organizationchart: [],
  },
};
/** D5 — retained Ultimate-only rules, exact text, last. */
const CAROUSEL_RETAINED = [
  ".u-carousel-item { flex-shrink: 0; box-sizing: border-box; }",
  ".u-carousel-prev-button:disabled, .u-carousel-next-button:disabled { opacity: 0.5; cursor: default; pointer-events: none; }",
];
const ORDERLIST_STRIPED =
  '.u-order-list.u-striped .u-order-list-item:nth-child(even), .u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }';
const DRAG_ITEM = (k) => [
  `.u-${k}-item { display: block; padding: .5rem .75rem; cursor: pointer; }`,
  `.u-${k}-item-selected { outline: 2px solid currentColor; outline-offset: -2px; }`,
];
// D-E4-1 (a): intentional grid layout (C); itemTemplate returns a string, so callers cannot lay items out.
const DATAVIEW_GRID =
  ".u-data-view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }";
// GAP-124 B-2 (Spec 2026-10-11-gap-124-loading-spinner-design.md §6, SR-1): the loading icon takes a
// colour with ≥ 3:1 non-text contrast (WCAG 2.2 SC 1.4.11) over the mask on the declared surfaces.
// `text.hover.color` is used for a static, non-hover purpose ON PURPOSE: it is the existing semantic token
// that is dark in the light scheme (surface.800) and white in the dark scheme, with the widest margin
// (4.28:1 over surface.200, where `text.color` gives 3.03:1). Do not "correct" it to `text.color`.
const DATAVIEW_LOADING_ICON =
  ".u-data-view > [role=\"status\"] svg { color: dt('text.hover.color'); }";
const ORGANIZATIONCHART_RETAINED = [
  ".u-organization-chart { display: flex; justify-content: center; overflow: auto; }",
  ".u-organization-chart-node { position: relative; display: flex; flex-direction: column; align-items: center; min-width: max-content; }",
  ".u-organization-chart-children { position: relative; display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; }",
  '.u-organization-chart-children::before { content: ""; position: absolute; top: 0; left: 12.5%; right: 12.5%; border-top: 1px solid currentColor; }',
  '.u-organization-chart-children > .u-organization-chart-node::before { content: ""; position: absolute; top: -1.5rem; height: 1.5rem; border-left: 1px solid currentColor; }',
];
export const RETAINED = {
  ng: {
    image: [],
    imagecompare: [
      ".u-image-compare > span { position: absolute; inset: 0; top: auto; bottom: auto; height: 100%; }",
    ],
    carousel: CAROUSEL_RETAINED,
    galleria: [],
    // E3-V1 review fix: reset for the Angular drag-mode `ul` list (exact previous declaration).
    orderlist: [
      ".u-order-list-list { margin: 0; padding: 0; list-style: none; }",
      ...DRAG_ITEM("order-list"),
      ORDERLIST_STRIPED,
    ],
    picklist: [
      ".u-pick-list-list { margin: 0; padding: 0; list-style: none; }",
      ...DRAG_ITEM("pick-list"),
      ".u-pick-list > .u-pick-list-source { order: 0; }",
      ".u-pick-list > .u-pick-list-controls { order: 1; }",
      ".u-pick-list > .u-pick-list-target { order: 2; }",
    ],
    dataview: [
      ".u-data-view-list { margin: 0; padding: 0; list-style: none; }",
      DATAVIEW_GRID,
      DATAVIEW_LOADING_ICON,
    ],
  },
  vue: {
    image: [],
    imagecompare: [".u-image-compare > span { position: absolute; inset: 0; }"],
    carousel: CAROUSEL_RETAINED,
    galleria: [],
    orderlist: [
      ".u-order-list.u-order-list-narrow .u-order-list-controls { flex-direction: row; flex-wrap: wrap; }",
      // E3-R2 (i): Vue emits no u-order-list-item (no listItem class, no drag mode); that part is dropped.
      '.u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }',
    ],
    picklist: [
      '.u-pick-list.u-striped .u-pick-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }',
    ],
    dataview: [DATAVIEW_GRID, DATAVIEW_LOADING_ICON],
    organizationchart: ORGANIZATIONCHART_RETAINED,
  },
};

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
