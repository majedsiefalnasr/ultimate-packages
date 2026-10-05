import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's Stepper family styles (see
 * `.vendor-extracted/vue/{stepper,step,stepitem,steplist,steppanel,
 * steppanels}/style/*.js`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. No `@ultimate/uix-styles/stepper`
 * entry exists yet, so `css`/`classes` are authored locally. Shared across
 * all 6 Vue Stepper-family components, matching this same capability's
 * Angular `stepper-style.ts` sibling's own per-family granularity.
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-step-disabled, .u-step-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-step-disabled{opacity: dt('disabled.opacity');}
.u-step-list{position: relative;display: flex;justify-content: space-between;align-items: center;margin: 0;padding: 0;list-style-type: none;overflow-x: auto;}
.u-step{position: relative;display: flex;flex: 1 1 auto;align-items: center;gap: dt('stepper.step.gap');padding: dt('stepper.step.padding');}
.u-step:last-of-type{flex: initial;}
.u-step-header{border: 0 none;display: inline-flex;align-items: center;text-decoration: none;cursor: pointer;transition: background dt('stepper.transition.duration'), color dt('stepper.transition.duration'), border-color dt('stepper.transition.duration'), outline-color dt('stepper.transition.duration'), box-shadow dt('stepper.transition.duration');border-radius: dt('stepper.step.header.border.radius');outline-color: transparent;background: transparent;padding: dt('stepper.step.header.padding');gap: dt('stepper.step.header.gap');}
.u-step-header:focus-visible{box-shadow: dt('stepper.step.header.focus.ring.shadow');outline: dt('stepper.step.header.focus.ring.width') dt('stepper.step.header.focus.ring.style') dt('stepper.step.header.focus.ring.color');outline-offset: dt('stepper.step.header.focus.ring.offset');}
.u-step-title{display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width: 100%;color: dt('stepper.step.title.color');font-weight: dt('stepper.step.title.font.weight');transition: background dt('stepper.transition.duration'), color dt('stepper.transition.duration'), border-color dt('stepper.transition.duration'), box-shadow dt('stepper.transition.duration'), outline-color dt('stepper.transition.duration');}
.u-step-number{display: flex;align-items: center;justify-content: center;color: dt('stepper.step.number.color');border: 2px solid dt('stepper.step.number.border.color');background: dt('stepper.step.number.background');min-width: dt('stepper.step.number.size');height: dt('stepper.step.number.size');line-height: dt('stepper.step.number.size');font-size: dt('stepper.step.number.font.size');z-index: 1;border-radius: dt('stepper.step.number.border.radius');position: relative;font-weight: dt('stepper.step.number.font.weight');}
.u-step-number::after{content: ' ';position: absolute;width: 100%;height: 100%;border-radius: dt('stepper.step.number.border.radius');box-shadow: dt('stepper.step.number.shadow');}
.u-step-active .u-step-header{cursor: default;}
.u-step-active .u-step-number{background: dt('stepper.step.number.active.background');border-color: dt('stepper.step.number.active.border.color');color: dt('stepper.step.number.active.color');}
.u-step-active .u-step-title{color: dt('stepper.step.title.active.color');}
.u-step:not(.u-step-disabled):focus-visible{outline: dt('focus.ring.width') dt('focus.ring.style') dt('focus.ring.color');outline-offset: dt('focus.ring.offset');}
.u-step:has(~ .u-step-active) .u-stepper-separator{background: dt('stepper.separator.active.background');}
.u-stepper-separator{flex: 1 1 0;background: dt('stepper.separator.background');width: 100%;height: dt('stepper.separator.size');transition: background dt('stepper.transition.duration'), color dt('stepper.transition.duration'), border-color dt('stepper.transition.duration'), box-shadow dt('stepper.transition.duration'), outline-color dt('stepper.transition.duration');}
.u-step-panels{padding: dt('stepper.steppanels.padding');}
.u-step-panel{background: dt('stepper.steppanel.background');color: dt('stepper.steppanel.color');}
.u-stepper:has(.u-step-item){display: flex;flex-direction: column;}
.u-step-item{display: flex;flex-direction: column;flex: initial;}
.u-step-item.u-step-item-active{flex: 1 1 auto;}
.u-step-item .u-step{flex: initial;}
.u-step-item .u-step-panel{display: grid;grid-template-rows: 1fr;}
.u-step-item .u-step-panel-content-wrapper{display: flex;flex: 1 1 auto;min-height: 0;}
.u-step-item .u-step-panel-content{width: 100%;padding: dt('stepper.steppanel.padding');margin-inline-start: 1rem;}
.u-step-item .u-stepper-separator{flex: 0 0 auto;width: dt('stepper.separator.size');height: auto;margin: dt('stepper.separator.margin');position: relative;left: calc(-1 * dt('stepper.separator.size'));}
.u-step-item .u-stepper-separator:dir(rtl){left: calc(-9 * dt('stepper.separator.size'));}
.u-step-item:has(~ .u-step-item-active) .u-stepper-separator{background: dt('stepper.separator.active.background');}
.u-step-item:last-of-type .u-step-panel{padding-inline-start: dt('stepper.step.number.size');}
`;

const classes = {
  stepperRoot: "u-stepper u-component",
  stepListRoot: "u-step-list",
  stepItemRoot: (params: Record<string, unknown> = {}) => ["u-step-item", { "u-step-item-active": Boolean(params.active) }],
  stepRoot: (params: Record<string, unknown> = {}) => [
    "u-step",
    { "u-step-active": Boolean(params.active), "u-step-disabled": Boolean(params.disabled) },
  ],
  stepHeader: "u-step-header",
  stepNumber: "u-step-number",
  stepTitle: "u-step-title",
  stepperSeparator: "u-stepper-separator",
  stepPanelsRoot: "u-step-panels",
  stepPanelRoot: "u-step-panel",
  stepPanelContentWrapper: "u-step-panel-content-wrapper",
  stepPanelContent: "u-step-panel-content",
};

export const stepperStyleModule: StyleModule = { css, classes };
