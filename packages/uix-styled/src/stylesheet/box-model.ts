import { cn } from "@ultimate/uix-utils";
import type StyleSheet from "./index";

/** Key prefix for each component's box-model rule (GAP-098, ADR-063). */
export const BOX_MODEL_KEY_PREFIX = "u-box-model:";

// `list` (Spec Amendment A2): Vue AutoComplete teleports its list element to
// <body> without an overlay wrapper.
const SCOPE_KEY = /^(root|overlay|panel|mask|list)$|(Root|Overlay|Mask)$/;
const ROOT_CLASS = /^u-[A-Za-z0-9_-]+$/;

/**
 * `border-box` for a component's own DOM: each scope root and its subtree.
 * Prime makes every box `border-box` through `@primeuix/styles` 2.0.3
 * `base` (`*, ::before, ::after`), and PrimeReact 10.9.9
 * `components/lib/componentbase/ComponentBase.js:259-263` scopes the same
 * rule as `.p-component, .p-component *`. Ultimate never applies the
 * page-wide form (user ruling 2026-10-08); `:where()` keeps specificity at 0.
 */
export function boxModelCss(roots: readonly string[]): string {
  if (roots.length === 0 || roots.some((root) => !ROOT_CLASS.test(root))) {
    throw new Error(
      `boxModelCss: expected one or more u- root classes, got ${JSON.stringify(roots)}`
    );
  }
  const scope = `:where(${roots.map((root) => `.${root}, .${root} *`).join(", ")})`;
  return `
${scope},
${scope}::before,
${scope}::after {
    box-sizing: border-box;
}
`;
}

/**
 * A style module's scope roots: the first `u-` class of every `classes` entry
 * keyed `root`, `overlay`, `panel`, `mask` or `list`, or ending in `Root`, `Overlay`
 * or `Mask`, resolved with empty params as the cores' `cx()` does.
 */
export function scopeRootsOf(classes: Record<string, unknown>): string[] {
  const roots: string[] = [];
  for (const [key, value] of Object.entries(classes)) {
    if (!SCOPE_KEY.test(key)) continue;
    const resolved = typeof value === "function" ? value({}) : value;
    const classList: string = cn(resolved) ?? "";
    const first = classList.split(/\s+/).find((token) => token.startsWith("u-"));
    if (first && !roots.includes(first)) roots.push(first);
  }
  return roots;
}

/**
 * Registers `componentName`'s box-model rule into `sheet` once. A no-op for an
 * empty name or root list (Spec Amendment A1).
 */
export function registerBoxModel(
  sheet: StyleSheet<any>,
  componentName: string,
  roots: readonly string[]
): void {
  if (!componentName || roots.length === 0) return;
  const key = `${BOX_MODEL_KEY_PREFIX}${componentName}`;
  if (!sheet.has(key)) sheet.add(key, boxModelCss(roots));
}
