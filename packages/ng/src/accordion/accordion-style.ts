/**
 * Ultimate-owned adaptation of PrimeNG's `AccordionStyle` (see
 * `.vendor-extracted/ng/accordion/style/accordionstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/accordion` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-accordion-panel-disabled, .u-accordion-panel-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-accordion-panel-disabled{opacity: dt('disabled.opacity');}
.u-accordion-panel{display: flex;flex-direction: column;border-style: solid;border-width: dt('accordion.panel.border.width');border-color: dt('accordion.panel.border.color');}
.u-accordion-header{all: unset;cursor: pointer;display: flex;align-items: center;justify-content: space-between;padding: dt('accordion.header.padding');color: dt('accordion.header.color');background: dt('accordion.header.background');border-style: solid;border-width: dt('accordion.header.border.width');border-color: dt('accordion.header.border.color');font-weight: dt('accordion.header.font.weight');border-radius: dt('accordion.header.border.radius');transition: background dt('accordion.transition.duration'), color dt('accordion.transition.duration'), outline-color dt('accordion.transition.duration'), box-shadow dt('accordion.transition.duration');outline-color: transparent;}
.u-accordion-panel:first-child > .u-accordion-header{border-width: dt('accordion.header.first.border.width');border-start-start-radius: dt('accordion.header.first.top.border.radius');border-start-end-radius: dt('accordion.header.first.top.border.radius');}
.u-accordion-panel:last-child > .u-accordion-header{border-end-start-radius: dt('accordion.header.last.bottom.border.radius');border-end-end-radius: dt('accordion.header.last.bottom.border.radius');}
.u-accordion-panel:last-child.u-accordion-panel-active > .u-accordion-header{border-end-start-radius: dt('accordion.header.last.active.bottom.border.radius');border-end-end-radius: dt('accordion.header.last.active.bottom.border.radius');}
.u-accordion-toggle-icon{color: dt('accordion.header.toggle.icon.color');}
.u-accordion-panel:not(.u-accordion-panel-disabled) .u-accordion-header:focus-visible{box-shadow: dt('accordion.header.focus.ring.shadow');outline: dt('accordion.header.focus.ring.width') dt('accordion.header.focus.ring.style') dt('accordion.header.focus.ring.color');outline-offset: dt('accordion.header.focus.ring.offset');}
.u-accordion-panel:not(.u-accordion-panel-active):not(.u-accordion-panel-disabled) > .u-accordion-header:hover{background: dt('accordion.header.hover.background');color: dt('accordion.header.hover.color');}
.u-accordion-panel:not(.u-accordion-panel-active):not(.u-accordion-panel-disabled) .u-accordion-header:hover .u-accordion-toggle-icon{color: dt('accordion.header.toggle.icon.hover.color');}
.u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header{background: dt('accordion.header.active.background');color: dt('accordion.header.active.color');}
.u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header .u-accordion-toggle-icon{color: dt('accordion.header.toggle.icon.active.color');}
.u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header:hover{background: dt('accordion.header.active.hover.background');color: dt('accordion.header.active.hover.color');}
.u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header:hover .u-accordion-toggle-icon{color: dt('accordion.header.toggle.icon.active.hover.color');}
.u-accordion-content{display: grid;grid-template-rows: 1fr;}
.u-accordion-content-inner{border-style: solid;border-width: dt('accordion.content.border.width');border-color: dt('accordion.content.border.color');background-color: dt('accordion.content.background');color: dt('accordion.content.color');padding: dt('accordion.content.padding');}
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
