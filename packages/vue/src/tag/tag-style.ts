/**
 * Ultimate-owned adaptation of PrimeVue's `Tag` style (see
 * `.vendor-extracted/vue/tag/style/TagStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tag` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-tag { display: inline-flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: var(--u-tag-bg, #6b7280); color: var(--u-tag-color, #fff); }
.u-tag-rounded { border-radius: 9999px; }
.u-tag-success { background: var(--u-tag-success-bg, #22c55e); }
.u-tag-info { background: var(--u-tag-info-bg, #3b82f6); }
.u-tag-warn { background: var(--u-tag-warn-bg, #f59e0b); }
.u-tag-danger { background: var(--u-tag-danger-bg, #ef4444); }
.u-tag-secondary { background: var(--u-tag-secondary-bg, #6b7280); }
.u-tag-contrast { background: var(--u-tag-contrast-bg, #18181b); }
.u-tag-icon { flex-shrink: 0; }
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    [
      "u-tag u-component",
      params?.["rounded"] ? "u-tag-rounded" : "",
      params?.["severity"] ? `u-tag-${params["severity"] as string}` : "",
    ]
      .filter(Boolean)
      .join(" "),
  icon: "u-tag-icon",
  label: "u-tag-label",
};

/** `createBaseComponent`-shaped style module for `UTag`. */
export const tagStyleModule = { css, classes };
