/**
 * Ultimate-owned adaptation of PrimeNG's `FieldsetStyle` (see
 * `.vendor-extracted/ng/fieldset/style/fieldsetstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/fieldset` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-fieldset { border: 1px solid var(--u-fieldset-border-color, #dee2e6); border-radius: 6px; padding: 0 1.25rem 1.25rem 1.25rem; margin: 0; }
.u-fieldset-legend { padding: 0 0.5rem; }
.u-fieldset-legend-label { font-weight: 700; }
.u-fieldset-toggle-button { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: none; padding: 0.5rem; cursor: pointer; font: inherit; color: inherit; }
.u-fieldset-toggle-icon { font-weight: 700; width: 1rem; display: inline-flex; justify-content: center; }
.u-fieldset-content { padding-top: 1rem; }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-fieldset u-component",
    { "u-fieldset-toggleable": !!params?.["toggleable"] },
  ],
  legend: "u-fieldset-legend",
  legendLabel: "u-fieldset-legend-label",
  toggleButton: "u-fieldset-toggle-button",
  toggleIcon: "u-fieldset-toggle-icon",
  contentContainer: "u-fieldset-content-container",
  content: "u-fieldset-content",
};

/** `UBaseComponent`-shaped style module for `UFieldset`. */
export const fieldsetStyleModule = { css, classes };
