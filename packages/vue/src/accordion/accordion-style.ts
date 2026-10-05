/**
 * Ultimate-owned adaptation of PrimeVue's `AccordionStyle` (see
 * `.vendor-extracted/vue/accordion/style/AccordionStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/accordion` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`). Shared
 * across the whole 4-directory family (accordion/accordionpanel/
 * accordionheader/accordioncontent), matching real PrimeVue's own single
 * shared `AccordionStyle` composed by all 4 real components.
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-accordionpanel[data-p-disabled="true"], .u-accordionpanel[data-p-disabled="true"] *{cursor: default;pointer-events: none;user-select: none;}
.u-accordionpanel[data-p-disabled="true"]{opacity: dt('disabled.opacity');}
.u-accordionpanel{display: flex;flex-direction: column;border-style: solid;border-width: dt('accordion.panel.border.width');border-color: dt('accordion.panel.border.color');}
.u-accordionheader{all: unset;cursor: pointer;display: flex;align-items: center;justify-content: space-between;padding: dt('accordion.header.padding');color: dt('accordion.header.color');background: dt('accordion.header.background');border-style: solid;border-width: dt('accordion.header.border.width');border-color: dt('accordion.header.border.color');font-weight: dt('accordion.header.font.weight');border-radius: dt('accordion.header.border.radius');transition: background dt('accordion.transition.duration'), color dt('accordion.transition.duration'), outline-color dt('accordion.transition.duration'), box-shadow dt('accordion.transition.duration');outline-color: transparent;}
.u-accordionpanel:first-child > .u-accordionheader{border-width: dt('accordion.header.first.border.width');border-start-start-radius: dt('accordion.header.first.top.border.radius');border-start-end-radius: dt('accordion.header.first.top.border.radius');}
.u-accordionpanel:last-child > .u-accordionheader{border-end-start-radius: dt('accordion.header.last.bottom.border.radius');border-end-end-radius: dt('accordion.header.last.bottom.border.radius');}
.u-accordionpanel:last-child[data-p-active="true"] > .u-accordionheader{border-end-start-radius: dt('accordion.header.last.active.bottom.border.radius');border-end-end-radius: dt('accordion.header.last.active.bottom.border.radius');}
.u-accordionheader-toggleicon{color: dt('accordion.header.toggle.icon.color');}
.u-accordionpanel:not([data-p-disabled="true"]) .u-accordionheader:focus-visible{box-shadow: dt('accordion.header.focus.ring.shadow');outline: dt('accordion.header.focus.ring.width') dt('accordion.header.focus.ring.style') dt('accordion.header.focus.ring.color');outline-offset: dt('accordion.header.focus.ring.offset');}
.u-accordionpanel:not([data-p-active="true"]):not([data-p-disabled="true"]) > .u-accordionheader:hover{background: dt('accordion.header.hover.background');color: dt('accordion.header.hover.color');}
.u-accordionpanel:not([data-p-active="true"]):not([data-p-disabled="true"]) .u-accordionheader:hover .u-accordionheader-toggleicon{color: dt('accordion.header.toggle.icon.hover.color');}
.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader{background: dt('accordion.header.active.background');color: dt('accordion.header.active.color');}
.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader .u-accordionheader-toggleicon{color: dt('accordion.header.toggle.icon.active.color');}
.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader:hover{background: dt('accordion.header.active.hover.background');color: dt('accordion.header.active.hover.color');}
.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader:hover .u-accordionheader-toggleicon{color: dt('accordion.header.toggle.icon.active.hover.color');}
.u-accordioncontent{display: grid;grid-template-rows: 1fr;}
.u-accordioncontent-content{border-style: solid;border-width: dt('accordion.content.border.width');border-color: dt('accordion.content.border.color');background-color: dt('accordion.content.background');color: dt('accordion.content.color');padding: dt('accordion.content.padding');}
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
