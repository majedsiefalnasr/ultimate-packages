import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputSwitchBase` CSS classes
 * (see `.vendor-extracted/react/inputswitch/InputSwitchBase.js`), hand-
 * authored inline, matching the same 100%-local pattern React's own
 * `checkbox-style.ts`/`button-style.ts` establish. Structural shape
 * (root/input/slider, checked/disabled modifiers) mirrors real
 * `InputSwitchBase.js`'s own `classes` map, renamed `p-inputswitch*` ->
 * `u-input-switch*`. Note: real PrimeReact names this capability
 * `InputSwitch`, not `ToggleSwitch` (distinct from PrimeNG/PrimeVue's own
 * `toggleswitch` naming/token namespace) — this file follows React's own
 * framework-native name, per this repo's convention of not forcing unified
 * cross-framework naming.
 */
const css = /*css*/ `
.u-input-switch { position: relative; display: inline-block; width: 3rem; height: 1.75rem; }
.u-input-switch-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; z-index: 1; }
.u-input-switch-slider {
  position: absolute; inset: 0; border-radius: 999px; transition: background 0.2s;
  pointer-events: none;
}
.u-input-switch-checked .u-input-switch-slider::before { transform: translateX(1.25rem); }
.u-input-switch-slider::before {
  content: ""; position: absolute; width: 1.25rem; height: 1.25rem; left: 0.25rem; top: 50%;
  transform: translateY(-50%); border-radius: 50%; transition: transform 0.2s;
}
`;

const classes = {
  root: (params: { checked?: boolean; disabled?: boolean } = {}) => [
    "u-input-switch u-component",
    { "u-input-switch-checked": params.checked, "u-input-switch-disabled": params.disabled },
  ],
  input: "u-input-switch-input",
  slider: "u-input-switch-slider",
};

export const inputSwitchStyleModule: StyleModule = { css, classes };
