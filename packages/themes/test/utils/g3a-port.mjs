/**
 * GAP-064 G3-A (Spec §4.3–§5.4, §13): the explicit upstream → Ultimate mapping
 * data, and the transform that turns the committed @primeuix/styles 2.0.3
 * fixture into the exact CSS each G3-A style module must contain. Used by
 * g3a-upstream-fidelity.test.ts (C3) and, as a CLI, to print the CSS to paste:
 *   node packages/themes/test/utils/g3a-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Plan stop rules).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3a.json"), "utf8")
);

export const KEYS = [
  "avatar",
  "chip",
  "tag",
  "skeleton",
  "overlaybadge",
  "knob",
  "progressbar",
  "progressspinner",
  "metergroup",
  "timeline",
  "terminal",
  "message",
  "inlinemessage",
  "toast",
];
export const FRAMEWORK_KEYS = { ng: KEYS.filter((k) => k !== "inlinemessage"), vue: KEYS };

/** Ultimate component directory per Aura key (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  avatar: "avatar",
  chip: "chip",
  tag: "tag",
  skeleton: "skeleton",
  overlaybadge: "overlay-badge",
  knob: "knob",
  progressbar: "progress-bar",
  progressspinner: "progress-spinner",
  metergroup: "meter-group",
  timeline: "timeline",
  terminal: "terminal",
  message: "message",
  inlinemessage: "inline-message",
  toast: "toast",
};

/** §4.3 renamed class prefixes (Angular and Vue identical); every other `.p-X` maps to `.u-X`. */
const PREFIX_RENAMES = {
  progressbar: ["p-progressbar", "u-progress-bar"],
  progressspinner: ["p-progressspinner", "u-progress-spinner"],
  metergroup: ["p-metergroup", "u-meter-group"],
  inlinemessage: ["p-inlinemessage", "u-inline-message"],
};

/** §4.3 upstream classes Ultimate does not render; a group whose selector uses one is omitted (§5.4 FX-A1..A7). */
export const NOT_RENDERED = {
  avatar: ["p-avatar-group"],
  skeleton: ["p-skeleton-animation-none"],
  timeline: ["p-timeline-left", "p-timeline-right", "p-timeline-alternate", "p-timeline-bottom"],
  terminal: ["p-terminal-input"],
  message: [
    "p-message-content-wrapper",
    "p-message-close-icon",
    "p-message-outlined",
    "p-message-simple",
    "p-message-sm",
    "p-message-lg",
    "p-message-enter-active",
    "p-message-leave-active",
  ],
  inlinemessage: ["p-inlinemessage-icon-only"],
  toast: [
    "p-toast-message-icon",
    "p-toast-close-icon",
    "p-toast-message-enter-active",
    "p-toast-message-leave-active",
    "p-toast-message-leave-to",
  ],
};

/** §5.3 parity-exception selector rewrites PX-A1..A3, applied before renaming; a rewritten group is "adapted". */
const REWRITES = {
  progressbar: [
    [".p-progressbar-determinate", ".u-progress-bar:not(.u-progress-bar-indeterminate)"],
  ],
  metergroup: [
    [
      ".p-metergroup-label-list-horizontal",
      ".u-meter-group-label-list:not(.u-meter-group-label-list-vertical)",
    ],
    [".p-metergroup-horizontal", ".u-meter-group:not(.u-meter-group-vertical)"],
  ],
  skeleton: [[".p-skeleton::after", ".u-skeleton-wave::after"]],
};

/** §5.3 retained Ultimate-only rules PX-A4 (toast), PX-A5 (chip, terminal), PX-A6 (skeleton) — exact text, appended last. */
export const RETAINED = {
  toast: [
    ".u-toast { position: fixed; z-index: 1200; max-width: calc(100vw - 2rem); }",
    ".u-toast-top-right { top: 1rem; right: 1rem; }",
    ".u-toast-top-left { top: 1rem; left: 1rem; }",
    ".u-toast-bottom-right { bottom: 1rem; right: 1rem; }",
    ".u-toast-bottom-left { bottom: 1rem; left: 1rem; }",
    ".u-toast-top-center { top: 1rem; left: 50%; }",
    ".u-toast-bottom-center { bottom: 1rem; left: 50%; }",
    ".u-toast-center { top: 50%; left: 50%; }",
  ],
  chip: [".u-chip-label { line-height: 1.5; padding: 0.25rem 0; }"],
  terminal: [
    ".u-terminal-welcome-message { margin-bottom: 0.5rem; }",
    ".u-terminal-command { display: block; margin-bottom: 0.25rem; }",
  ],
  skeleton: [".u-skeleton { position: relative; }"],
};

/** Spec §4.4 counts [ported rule groups incl. adapted, omitted groups] — pins the data above. */
export const COUNTS = {
  avatar: [10, 5],
  chip: [7, 0],
  tag: [9, 0],
  skeleton: [4, 1],
  overlaybadge: [3, 0],
  knob: [5, 0],
  progressbar: [7, 0],
  progressspinner: [4, 0],
  metergroup: [17, 0],
  timeline: [18, 12],
  terminal: [5, 1],
  message: [25, 28],
  inlinemessage: [15, 1],
  toast: [37, 5],
};

/** Whitespace normalisation only; never touches parentheses or operators (calc() stays valid). */
export const norm = (css) =>
  css
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .trim();
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level groups; @keyframes / @-webkit-keyframes are kept whole. Any other at-rule is an error. */
export function parseGroups(css) {
  const src = stripComments(css);
  const groups = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) {
      if (src.slice(i).trim()) throw new Error(`trailing CSS: ${src.slice(i).trim()}`);
      break;
    }
    let depth = 0;
    let j = open;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}" && --depth === 0) break;
    }
    const head = src.slice(i, open).trim();
    if (head.startsWith("@") && !/^@(-webkit-)?keyframes\s/.test(head))
      throw new Error(`unexpected at-rule: ${head}`);
    groups.push({ head, body: src.slice(open + 1, j), keyframes: head.startsWith("@") });
    i = j + 1;
  }
  return groups;
}

const renameKeyframeRefs = (s) => s.replace(/\bp-([a-z0-9-]+)/g, "u-$1");

function mapSelector(key, selector) {
  let s = selector;
  let adapted = false;
  for (const [from, to] of REWRITES[key] ?? []) {
    if (s.includes(from)) {
      s = s.split(from).join(to);
      adapted = true;
    }
  }
  const pr = PREFIX_RENAMES[key];
  if (pr) s = s.replace(new RegExp(`\\.${pr[0]}(?![a-z0-9])`, "g"), `.${pr[1]}`);
  return { selector: s.replace(/\.p-/g, ".u-"), adapted };
}

/**
 * Canonical C3 ordering (Plan Review correction 3): `ordered` keeps the
 * UPSTREAM SOURCE ORDER of every non-omitted group — ported rules, adapted
 * (PX-A1..A3) rules and used keyframes interleaved exactly as upstream wrote
 * them — so the cascade between same-specificity rules is upstream's. The
 * category arrays (ported/adapted/keyframes/omitted) exist only for counting.
 */
export function expected(key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const ported = [];
  const adapted = [];
  const omitted = [];
  const mapped = []; // { kind: "rule" | "keyframes", index, text, name? } in upstream order
  for (const [index, g] of groups.entries()) {
    if (g.keyframes) {
      mapped.push({
        kind: "keyframes",
        index,
        name: renameKeyframeRefs(g.head.split(/\s+/)[1]),
        text: norm(`${renameKeyframeRefs(g.head)}{${g.body}}`),
      });
      continue;
    }
    const classes = [...g.head.matchAll(/\.(p-[a-z0-9-]+)/g)].map((m) => m[1]);
    if (classes.some((c) => (NOT_RENDERED[key] ?? []).includes(c))) {
      omitted.push(norm(g.head));
      continue;
    }
    const m = mapSelector(key, g.head);
    const text = norm(`${m.selector}{${renameKeyframeRefs(g.body)}}`);
    (m.adapted ? adapted : ported).push(text);
    mapped.push({ kind: "rule", index, text });
  }
  const used = [...ported, ...adapted].join("\n");
  const isUsed = (name) => new RegExp(`\\b${name}(?![a-z0-9-])`).test(used);
  const keyframes = mapped
    .filter((x) => x.kind === "keyframes" && isUsed(x.name))
    .map((x) => x.text);
  const kept = mapped.filter((x) => x.kind === "rule" || isUsed(x.name));
  return {
    ordered: kept.map((x) => x.text),
    upstreamIndex: kept.map((x) => x.index),
    ported,
    keyframes,
    adapted,
    omitted,
  };
}

/** The exact rule list of a style module: upstream-ordered port, then the retained rules (§5.3), in RETAINED order. */
export function expectedCss(key) {
  return [...expected(key).ordered, ...(RETAINED[key] ?? []).map(norm)];
}

/** Property names declared by a normalized rule text, keyed by selector. */
export function declarations(ruleText) {
  const open = ruleText.indexOf("{");
  const selector = ruleText.slice(0, open);
  const props = ruleText
    .slice(open + 1, -1)
    .split(";")
    .map((d) => d.split(":")[0].trim())
    .filter(Boolean);
  return { selector, props };
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
  if (!FRAMEWORK_KEYS[fw]?.includes(key))
    throw new Error(
      `usage: g3a-port.mjs <ng|vue> <key>; key one of ${FRAMEWORK_KEYS[fw ?? "vue"].join(", ")}`
    );
  console.log(expectedCss(key).join("\n"));
}
