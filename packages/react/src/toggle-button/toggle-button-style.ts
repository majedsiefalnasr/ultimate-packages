import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `ToggleButtonBase` CSS classes
 * (see `.vendor-extracted/react/togglebutton/ToggleButtonBase.js`), hand-
 * authored inline, matching the same 100%-local pattern React's own
 * `checkbox-style.ts`/`button-style.ts` establish. Structural shape
 * (root/input/box/label, checked/disabled modifiers) mirrors real
 * `ToggleButtonBase.js`'s own `classes` map, renamed `p-togglebutton*` ->
 * `u-toggle-button*`.
 */
const css = /*css*/ `
.u-toggle-button { position: relative; display: inline-flex; cursor: pointer; user-select: none; overflow: hidden; }
.u-toggle-button-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; }
.u-toggle-button-box { display: inline-flex; align-items: center; justify-content: center; width: 100%; }
.u-toggle-button-label { flex: 1 1 auto; }
.u-toggle-button:has(.u-toggle-button-input:disabled) { cursor: default; }
`;

const classes = {
  root: (params: { checked?: boolean; disabled?: boolean } = {}) => [
    "u-toggle-button u-component",
    { "u-toggle-button-checked": params.checked, "u-toggle-button-disabled": params.disabled },
  ],
  input: "u-toggle-button-input",
  box: (params: { checked?: boolean } = {}) => [
    "u-toggle-button-box",
    { "u-toggle-button-box-checked": params.checked },
  ],
  label: "u-toggle-button-label",
};

export const toggleButtonStyleModule: StyleModule = { css, classes };
