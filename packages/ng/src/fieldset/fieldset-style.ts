/**
 * Ultimate-owned adaptation of PrimeNG's `FieldsetStyle` (see
 * `.vendor-extracted/ng/fieldset/style/fieldsetstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/fieldset` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-fieldset{background: dt('fieldset.background');border: 1px solid dt('fieldset.border.color');border-radius: dt('fieldset.border.radius');color: dt('fieldset.color');padding: dt('fieldset.padding');margin: 0;}
.u-fieldset-legend{background: dt('fieldset.legend.background');border-radius: dt('fieldset.legend.border.radius');border-width: dt('fieldset.legend.border.width');border-style: solid;border-color: dt('fieldset.legend.border.color');color: dt('fieldset.legend.color');padding: dt('fieldset.legend.padding');transition: background dt('fieldset.transition.duration'), color dt('fieldset.transition.duration'), outline-color dt('fieldset.transition.duration'), box-shadow dt('fieldset.transition.duration');}
.u-fieldset-toggleable > .u-fieldset-legend{padding: 0;}
.u-fieldset-toggle-button{cursor: pointer;user-select: none;overflow: hidden;position: relative;text-decoration: none;display: flex;gap: dt('fieldset.legend.gap');align-items: center;justify-content: center;padding: dt('fieldset.legend.padding');background: transparent;border: 0 none;border-radius: dt('fieldset.legend.border.radius');transition: background dt('fieldset.transition.duration'), color dt('fieldset.transition.duration'), outline-color dt('fieldset.transition.duration'), box-shadow dt('fieldset.transition.duration');outline-color: transparent;}
.u-fieldset-legend-label{font-weight: dt('fieldset.legend.font.weight');}
.u-fieldset-toggle-button:focus-visible{box-shadow: dt('fieldset.legend.focus.ring.shadow');outline: dt('fieldset.legend.focus.ring.width') dt('fieldset.legend.focus.ring.style') dt('fieldset.legend.focus.ring.color');outline-offset: dt('fieldset.legend.focus.ring.offset');}
.u-fieldset-toggleable > .u-fieldset-legend:hover{color: dt('fieldset.legend.hover.color');background: dt('fieldset.legend.hover.background');}
.u-fieldset-toggle-icon{color: dt('fieldset.toggle.icon.color');transition: color dt('fieldset.transition.duration');}
.u-fieldset-toggleable > .u-fieldset-legend:hover .u-fieldset-toggle-icon{color: dt('fieldset.toggle.icon.hover.color');}
.u-fieldset-content-container{display: grid;grid-template-rows: 1fr;}
.u-fieldset-content{padding: dt('fieldset.content.padding');}
.u-fieldset-toggle-button{font: inherit;color: inherit;}
.u-fieldset-toggle-icon{font-weight: 700;width: 1rem;display: inline-flex;justify-content: center;}
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
