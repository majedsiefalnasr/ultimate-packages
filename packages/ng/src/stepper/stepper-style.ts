/**
 * Ultimate-owned adaptation of PrimeNG's Stepper family styles (see
 * `.vendor-extracted/ng/stepper/style/*.ts` — `StepperStyle`,
 * `StepListStyle`, `StepItemStyle`, `StepStyle`, `StepPanelsStyle`,
 * `StepPanelStyle`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. No `@ultimate/uix-styles/stepper`
 * entry exists yet, so `css`/`classes` are authored locally (same
 * precedent as `tabsStyleModule`). Shared across all Angular
 * Stepper-family directives, matching real PrimeNG's own per-family style
 * registration granularity.
 */
const css = /*css*/ `
.u-stepper { display: flex; flex-direction: column; }
.u-step-list { display: flex; position: relative; }
.u-step-item { display: flex; flex: 1 1 auto; align-items: center; }
.u-step-item:last-child { flex: 0 0 auto; }
.u-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 0 0 auto; }
.u-step-header { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: none; cursor: pointer; }
.u-step[data-u-disabled="true"] .u-step-header { cursor: default; pointer-events: none; opacity: 0.6; }
.u-step-number { display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 2rem; height: 2rem; }
.u-stepper-separator { flex: 1 1 0; height: 2px; margin: 0 0.5rem; background: currentColor; opacity: 0.3; }
.u-step-panels { flex: 1 1 auto; }
.u-step-panel[hidden] { display: none; }
`;

const classes = {
  stepperRoot: "u-stepper u-component",
  stepListRoot: "u-step-list",
  stepItemRoot: (params: { active?: boolean } = {}) => ["u-step-item", { "u-step-item-active": params.active }],
  stepRoot: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-step",
    { "u-step-active": params.active, "u-step-disabled": params.disabled },
  ],
  stepHeader: "u-step-header",
  stepNumber: "u-step-number",
  stepTitle: "u-step-title",
  stepperSeparator: "u-stepper-separator",
  stepPanelsRoot: "u-step-panels",
  stepPanelRoot: "u-step-panel",
  stepPanelContent: "u-step-panel-content",
};

export const stepperStyleModule = { css, classes };
