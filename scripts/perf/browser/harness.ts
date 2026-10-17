// scripts/perf/browser/harness.ts
//
// Framework-neutral core of the ADR-057 Stage 1 perf pages (Spec B4-R1).
// Each playground's perf page (apps/playground-*/src/.../perf) imports this
// file, so the fixtures, the marks and the settle rule are the same code in
// Angular, React and Vue. A page only supplies `PerfAdapter`: plain state
// changes in its own framework. No framework scheduling API is used in the
// timing path.
//
// Settle rule (Controller ruling 3): a `__perf` method resolves after the
// DOM mutation it causes is observed (MutationObserver, or the `scroll`
// event for scroll), then one requestAnimationFrame callback, then one
// microtask. Each call is bracketed by `u-perf:<subject>:<phase>:start|end`
// marks and a `u-perf:<subject>:<phase>` measure.

export const SEED = 20261017;

/** mulberry32: small deterministic PRNG, so every framework gets identical data. */
export function seededRandom(seed: number = SEED): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PerfRow {
  id: number;
  name: string;
  score: number;
  category: string;
}

const SYLLABLES = ["al", "be", "co", "da", "el", "fa", "gi", "ho", "ix", "ju", "ka", "lo"];
const CATEGORIES = ["north", "south", "east", "west"];

export function makeRows(count: number): PerfRow[] {
  const random = seededRandom();
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${pick(SYLLABLES)}${pick(SYLLABLES)}${pick(SYLLABLES)} ${index + 1}`,
    score: Math.floor(random() * 1000),
    category: pick(CATEGORIES),
  }));
}

export function makeItems(count: number): string[] {
  return makeRows(count).map((row) => row.name);
}

export interface PerfOrgNode {
  key: string;
  label: string;
  /** Every node starts expanded, so each framework renders the whole tree. */
  expanded: true;
  children?: PerfOrgNode[];
}

/** Breadth 3, depth 4: 1 + 3 + 9 + 27 = 40 nodes. */
export function makeOrgTree(depth = 4, breadth = 3, key = "0"): PerfOrgNode {
  const node: PerfOrgNode = { key, label: `Node ${key}`, expanded: true };
  if (depth > 1) {
    node.children = Array.from({ length: breadth }, (_, i) =>
      makeOrgTree(depth - 1, breadth, `${key}_${i}`)
    );
  }
  return node;
}

export interface PerfOption {
  label: string;
  value: number;
}

export const SELECT_OPTIONS: PerfOption[] = makeRows(50).map((row) => ({
  label: row.name,
  value: row.id,
}));

/** P5 "value" target and the P5 "filter" constraint, shared by all pages. */
export const SELECT_UPDATE_VALUE = SELECT_OPTIONS[25].value;
export const TABLE_FILTER = { name: { value: "ka", matchMode: "contains" as const } };
export const TABLE_SORT = { field: "score", order: 1 as const };

export const TABLE_COLUMNS = [
  { field: "id", header: "Id" },
  { field: "name", header: "Name" },
  { field: "score", header: "Score" },
  { field: "category", header: "Category" },
];

export const ROW_HEIGHT = 40;

/** Fixed data sets, generated once per page load (before any measurement). */
export const ROWS_100 = makeRows(100);
export const ROWS_1000 = makeRows(1000);
export const ROWS_10K = makeRows(10_000);
export const ITEMS_10K = makeItems(10_000);
export const ORG_TREE = makeOrgTree();
export const MENU_MODEL = ["First", "Second", "Third"].map((label) => ({ label }));

/** Global page CSS: give the virtual scrollers a fixed viewport. */
export const PERF_PAGE_CSS = `#perf-root .u-scroller { height: 400px; }`;

/** Where each overlay renders (appended to body, outside #perf-root). */
export const OVERLAY_SELECTORS: Record<string, string> = {
  dialog: ".u-dialog",
  drawer: ".u-drawer",
  popover: ".u-popover",
  menu: ".u-menu",
  select: ".u-select-overlay",
};

export type UpdateKind = "sort" | "filter" | "value";

/** Page state every framework keeps for its subject. */
export interface PerfState {
  mounted: boolean;
  updated: UpdateKind | null;
  visible: boolean;
}

export const INITIAL_STATE: PerfState = { mounted: false, updated: null, visible: false };

export interface PerfAdapter {
  /** Render the subject into #perf-root. */
  mount(): void;
  /** Remove it and reset all subject state. */
  unmount(): void;
  update(kind: UpdateKind): void;
  open(): void;
  close(): void;
}

export interface PerfApi {
  mount(): Promise<void>;
  unmount(): Promise<void>;
  update(kind: UpdateKind): Promise<void>;
  open(): Promise<void>;
  close(): Promise<void>;
  scroll(px: number): Promise<void>;
}

const TIMEOUT_MS = 10_000;

/** The subject name from `/perf/<subject>`, or null. */
export function subjectFromLocation(pathname: string = location.pathname): string | null {
  const match = /^\/perf\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match ? match[1] : null;
}

export function perfRoot(): HTMLElement {
  const root = document.getElementById("perf-root");
  if (!root) throw new Error("perf harness: #perf-root not found");
  return root;
}

function settle(): Promise<void> {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve())).then(() =>
    Promise.resolve()
  );
}

function timeout(subject: string, phase: string): Error {
  return new Error(`perf harness: ${subject}:${phase} saw no DOM change within ${TIMEOUT_MS} ms`);
}

/**
 * Resolves when `done()` holds, re-checked on every DOM mutation under
 * `target`. With no `done`, it resolves on the first mutation.
 */
function whenDom(target: Node, onTimeout: () => Error, done?: () => boolean): Promise<void> {
  if (done?.()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      if (done && !done()) return;
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(onTimeout());
    }, TIMEOUT_MS);
    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  });
}

function nextScroll(element: Element, onTimeout: () => Error): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(onTimeout()), TIMEOUT_MS);
    element.addEventListener(
      "scroll",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

async function timed(
  subject: string,
  phase: string,
  arm: () => Promise<void>,
  trigger: () => void
): Promise<void> {
  const name = `u-perf:${subject}:${phase}`;
  performance.mark(`${name}:start`);
  const changed = arm();
  trigger();
  await changed;
  await settle();
  performance.mark(`${name}:end`);
  performance.measure(name, `${name}:start`, `${name}:end`);
}

/** Builds `window.__perf` for one subject from a page's framework adapter. */
export function createPerfApi(subject: string, adapter: PerfAdapter): PerfApi {
  const fail = (phase: string) => () => timeout(subject, phase);
  const overlay = OVERLAY_SELECTORS[subject];
  const overlayPresent = () => overlay !== undefined && document.querySelector(overlay) !== null;
  const requireOverlay = (phase: string) => {
    if (!overlay) throw new Error(`perf harness: ${subject} has no overlay for ${phase}()`);
  };
  return {
    mount: () =>
      timed(
        subject,
        "mount",
        () => whenDom(perfRoot(), fail("mount"), () => perfRoot().childElementCount > 0),
        () => adapter.mount()
      ),
    unmount: () =>
      timed(
        subject,
        "unmount",
        () => whenDom(perfRoot(), fail("unmount"), () => perfRoot().childElementCount === 0),
        () => adapter.unmount()
      ),
    update: (kind) =>
      timed(
        subject,
        `update-${kind}`,
        () => whenDom(perfRoot(), fail(`update-${kind}`)),
        () => adapter.update(kind)
      ),
    open: () => {
      requireOverlay("open");
      return timed(
        subject,
        "open",
        () => whenDom(document.body, fail("open"), overlayPresent),
        () => adapter.open()
      );
    },
    close: () => {
      requireOverlay("close");
      return timed(
        subject,
        "close",
        () => whenDom(document.body, fail("close"), () => !overlayPresent()),
        () => adapter.close()
      );
    },
    scroll: (px) => {
      const element = perfRoot().querySelector(".u-scroller");
      if (!element) throw new Error(`perf harness: ${subject} has no .u-scroller to scroll`);
      return timed(
        subject,
        "scroll",
        () => nextScroll(element, fail("scroll")),
        () => {
          element.scrollTop += px;
        }
      );
    },
  };
}

declare global {
  interface Window {
    __perf?: PerfApi;
  }
}

/** Installs the page CSS and `window.__perf`. */
export function installPerfApi(subject: string, adapter: PerfAdapter): void {
  const style = document.createElement("style");
  style.textContent = PERF_PAGE_CSS;
  document.head.appendChild(style);
  window.__perf = createPerfApi(subject, adapter);
}
