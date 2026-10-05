/**
 * Ultimate-owned adaptation of PrimeNG's `StepsStyle` (see
 * `.vendor-extracted/ng/steps/style/stepsstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/steps` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `tieredMenuStyleModule`/
 * `menubarStyleModule`).
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-steps{position: relative;}
.u-steps-list{padding: 0;margin: 0;list-style-type: none;display: flex;}
.u-steps-item{position: relative;display: flex;justify-content: center;flex: 1 1 auto;}
.u-steps-item.u-steps-item-disabled, .u-steps-item.u-steps-item-disabled *{opacity: 1;pointer-events: auto;user-select: auto;cursor: auto;}
.u-steps-item:before{content: ' ';border-top: 2px solid dt('steps.separator.background');width: 100%;top: 50%;left: 0;display: block;position: absolute;margin-top: calc(-1rem + 1px);}
.u-steps-item:first-child::before{width: calc(50% + 1rem);transform: translateX(100%);}
.u-steps-item:last-child::before{width: 50%;}
.u-steps-item-link{display: inline-flex;flex-direction: column;align-items: center;overflow: hidden;text-decoration: none;transition: outline-color dt('steps.transition.duration'), box-shadow dt('steps.transition.duration');border-radius: dt('steps.item.link.border.radius');outline-color: transparent;gap: dt('steps.item.link.gap');}
.u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible{box-shadow: dt('steps.item.link.focus.ring.shadow');outline: dt('steps.item.link.focus.ring.width') dt('steps.item.link.focus.ring.style') dt('steps.item.link.focus.ring.color');outline-offset: dt('steps.item.link.focus.ring.offset');}
.u-steps-item-label{white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width: 100%;color: dt('steps.item.label.color');display: block;font-weight: dt('steps.item.label.font.weight');}
.u-steps-item-number{display: flex;align-items: center;justify-content: center;color: dt('steps.item.number.color');border: 2px solid dt('steps.item.number.border.color');background: dt('steps.item.number.background');min-width: dt('steps.item.number.size');height: dt('steps.item.number.size');line-height: dt('steps.item.number.size');font-size: dt('steps.item.number.font.size');z-index: 1;border-radius: dt('steps.item.number.border.radius');position: relative;font-weight: dt('steps.item.number.font.weight');}
.u-steps-item-number::after{content: ' ';position: absolute;width: 100%;height: 100%;border-radius: dt('steps.item.number.border.radius');box-shadow: dt('steps.item.number.shadow');}
.u-steps-item-active .u-steps-item-number{background: dt('steps.item.number.active.background');border-color: dt('steps.item.number.active.border.color');color: dt('steps.item.number.active.color');}
.u-steps-item-active .u-steps-item-label{color: dt('steps.item.label.active.color');}
`;

const classes = {
  root: () => ["u-steps u-component"],
  list: "u-steps-list",
  item: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-steps-item",
    { "u-steps-item-active": params.active, "u-steps-item-disabled": params.disabled },
  ],
  itemLink: "u-steps-item-link",
  itemNumber: "u-steps-item-number",
  itemLabel: "u-steps-item-label",
};

export const stepsStyleModule = { css, classes };
