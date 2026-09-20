/**
 * Ultimate-owned adaptation of PrimeVue's `AccordionStyle` (see
 * `.vendor-extracted/vue/accordion/style/AccordionStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/accordion` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`). Shared
 * across the whole 4-directory family (accordion/accordionpanel/
 * accordionheader/accordioncontent), matching real PrimeVue's own single
 * shared `AccordionStyle` composed by all 4 real components.
 */
const css = /*css*/ `
.u-accordion { display: flex; flex-direction: column; gap: 2px; }
.u-accordionpanel[data-p-disabled="true"] { opacity: 0.6; }
.u-accordionheader { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; cursor: pointer; user-select: none; background: var(--u-accordion-header-background, #f8f9fa); }
.u-accordionheader[data-p-disabled="true"] { cursor: default; pointer-events: none; }
.u-accordionheader[data-p-active="true"] { background: var(--u-accordion-header-active-background, #e9ecef); }
.u-accordionheader-toggleicon { margin-left: 0.5rem; }
.u-accordioncontent { overflow: hidden; }
.u-accordioncontent-content { padding: 0.75rem 1.25rem; }
`;

const classes = {
  root: () => ["u-accordion u-component"],
  panel: () => ["u-accordionpanel"],
  header: () => ["u-accordionheader"],
  toggleicon: () => ["u-accordionheader-toggleicon"],
  contentRoot: () => ["u-accordioncontent"],
  content: () => ["u-accordioncontent-content"],
};

/** `createBaseComponent`-shaped style module shared by the Accordion family. */
export const accordionStyleModule = { css, classes };
