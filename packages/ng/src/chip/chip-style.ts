/**
 * Ultimate-owned adaptation of PrimeNG's `ChipStyle` (see
 * `.vendor-extracted/ng/chip/style/chipstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/chip` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-chip { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--u-chip-background, #dee2e6); color: var(--u-chip-color, #495057); border-radius: 16px; padding: 0 0.75rem; }
.u-chip-image { width: 2rem; height: 2rem; border-radius: 50%; margin-left: -0.5rem; }
.u-chip-icon { font-size: 1rem; }
.u-chip-label { line-height: 1.5; padding: 0.25rem 0; }
.u-chip-remove-icon { cursor: pointer; font-size: 1rem; }
.u-chip-remove-icon:focus-visible { outline: 2px solid var(--u-chip-focus-ring, #8dd0ff); outline-offset: 1px; }
`;

const classes = {
  root: () => ["u-chip u-component"],
  image: "u-chip-image",
  icon: "u-chip-icon",
  label: "u-chip-label",
  removeIcon: "u-chip-remove-icon",
};

/** `UBaseComponent`-shaped style module for `UChip`. */
export const chipStyleModule = { css, classes };
