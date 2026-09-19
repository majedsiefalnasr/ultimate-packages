import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `StepperBase`/
 * `StepperPanelBase` styles (see `.vendor-extracted/react/stepper/
 * StepperBase.js`, `.vendor-extracted/react/stepperpanel/
 * StepperPanelBase.js`), shaped to match `useComponentBase`'s
 * `styleModule: {css, classes}` contract. No `@ultimate/uix-styles/stepper`
 * entry exists yet, so `css`/`classes` are authored locally (same
 * precedent as this same capability's Angular `stepper-style.ts` sibling).
 */
const css = /*css*/ `
.u-stepper { display: flex; flex-direction: column; }
.u-stepper-nav { display: flex; position: relative; margin: 0; padding: 0; list-style: none; }
.u-stepper-header { display: flex; flex: 1 1 auto; align-items: center; }
.u-stepper-header:last-child { flex: 0 0 auto; }
.u-stepper-header-action { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: transparent; border: none; cursor: pointer; }
.u-stepper-header[data-u-disabled="true"] .u-stepper-header-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-stepper-header-number { display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 2rem; height: 2rem; }
.u-stepper-separator { flex: 1 1 0; height: 2px; margin: 0 0.5rem; background: currentColor; opacity: 0.3; }
.u-stepper-panels { flex: 1 1 auto; }
.u-stepper-panel[data-u-hidden="true"] { display: none; }
`;

const classes = {
  root: "u-stepper u-component",
  nav: "u-stepper-nav",
  header: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-stepper-header",
    { "u-stepper-header-active": params.active, "u-stepper-header-disabled": params.disabled },
  ],
  headerAction: "u-stepper-header-action",
  headerNumber: "u-stepper-header-number",
  headerTitle: "u-stepper-header-title",
  separator: "u-stepper-separator",
  panels: "u-stepper-panels",
  panel: "u-stepper-panel",
};

export const stepperStyleModule: StyleModule = { css, classes };
