// scripts/perf/stage1-subjects.mjs
//
// ADR-057 Stage 1 subject matrix for the browser categories P3–P8 (Spec
// B4-R1; methods research 2026-10-11 §4). One source for the runner, the
// Playwright spec and the perf-page server. The perf pages themselves
// implement every subject listed here except the "not built" ones.

export const FRAMEWORKS = ["ng", "react", "vue"];

/** Static perf-page servers (client-only builds, see serve-perf-page.mjs). */
export const PERF_PAGE_PORTS = { ng: 6021, react: 6022, vue: 6023 };

/** Built perf page per framework (`build:perf` in each playground). */
export const PERF_PAGE_DIRS = {
  ng: "apps/playground-angular/dist/perf/browser",
  react: "apps/playground-react/dist/perf",
  vue: "apps/playground-vue/dist/perf",
};

/** The existing SSR harness servers (`build` in each playground), used by P8. */
export const SSR_SERVERS = {
  ng: { entry: "apps/playground-angular/dist/playground-angular/server/server.mjs", port: 6011 },
  react: { entry: "apps/playground-react/dist/server.js", port: 6012 },
  vue: { entry: "apps/playground-vue/dist/server.js", port: 6013 },
};

/** Subjects per browser category. P5 entries carry the `update(kind)` kind. */
export const CATEGORY_SUBJECTS = {
  P3: [
    "button",
    "inputtext",
    "select",
    "datepicker",
    "dialog",
    "popover",
    "table-100",
    "scroller-10k",
    "tree",
  ],
  P4: ["table-1000", "dataview", "organizationchart"],
  P5: [
    { subject: "table-100", kind: "sort" },
    { subject: "table-100", kind: "filter" },
    { subject: "select", kind: "value" },
    { subject: "tree", kind: "expand" },
  ],
  P6: ["scroller-10k", "table-virtual-10k"],
  P7: ["dialog", "popover", "drawer", "menu", "select"],
};

/** Subjects with no shipped component in a framework (Controller ruling 2). */
export const NOT_BUILT = {
  tree: ["ng", "react", "vue"],
  organizationchart: ["ng"],
};

/** P7 variants: Playwright `emulateMedia({ reducedMotion })` values. */
export const MOTION_VARIANTS = [
  { variant: "motion", reducedMotion: "no-preference" },
  { variant: "reduced", reducedMotion: "reduce" },
];

/** P6 scripted scroll: SCROLL_STEPS steps of SCROLL_STEP_PX, one per settled frame. */
export const SCROLL_STEP_PX = 100;
export const SCROLL_STEPS = 50;

export function isBuilt(framework, subject) {
  return !(NOT_BUILT[subject] ?? []).includes(framework);
}

const subjectName = (entry) => (typeof entry === "string" ? entry : entry.subject);

/** Every distinct subject a framework's perf page implements. */
export function pageSubjects(framework) {
  const all = Object.values(CATEGORY_SUBJECTS).flat().map(subjectName);
  return [...new Set(all)].filter((subject) => isBuilt(framework, subject)).sort();
}
