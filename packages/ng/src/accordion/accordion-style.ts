/**
 * Ultimate-owned adaptation of PrimeNG's `AccordionStyle` (see
 * `.vendor-extracted/ng/accordion/style/accordionstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/accordion` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 */
const css = /*css*/ `
.u-accordion { display: flex; flex-direction: column; gap: 2px; }
.u-accordion-panel[data-u-disabled="true"] { opacity: 0.6; }
.u-accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; cursor: pointer; user-select: none; background: var(--u-accordion-header-background, #f8f9fa); }
.u-accordion-header[data-u-disabled="true"] { cursor: default; pointer-events: none; }
.u-accordion-header[data-u-active="true"] { background: var(--u-accordion-header-active-background, #e9ecef); }
.u-accordion-toggle-icon { margin-left: 0.5rem; }
.u-accordion-content { overflow: hidden; }
.u-accordion-content-inner { padding: 0.75rem 1.25rem; }
`;

/** Params passed into `cx('header', params)`/`cx('panel', params)`. */
export interface AccordionClassesParams {
  active?: boolean;
  disabled?: boolean;
}

const classes = {
  root: () => ["u-accordion u-component"],
  panel: (params: AccordionClassesParams = {}) => [
    "u-accordion-panel",
    { "u-accordion-panel-active": params.active, "u-accordion-panel-disabled": params.disabled },
  ],
  header: (params: AccordionClassesParams = {}) => [
    "u-accordion-header",
    { "u-accordion-header-active": params.active, "u-accordion-header-disabled": params.disabled },
  ],
  toggleIcon: "u-accordion-toggle-icon",
  content: () => ["u-accordion-content"],
  contentInner: "u-accordion-content-inner",
};

/** `UBaseComponent`-shaped style module for `UAccordion`. */
export const accordionStyleModule = { css, classes };
